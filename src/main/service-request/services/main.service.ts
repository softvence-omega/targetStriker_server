import { BadRequestException, Injectable } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';
import { FileService } from 'src/utils/file/file.service';
import { CreateServiceRequestDTO } from '../dto/serviceRequest.sto';
import { IdDto } from 'src/common/dto/id.dto';
import { ApiResponse } from 'src/common/types/apiResponse';

@Injectable()
export class MainService {
  constructor(
    private readonly db: DbService,
    private readonly file: FileService,
  ) {}

  async createServiceRequest(rawData: CreateServiceRequestDTO, { id }: IdDto): Promise<ApiResponse<any>> {
  const { reqPhoto, name, taskTypeId, ...rest } = rawData;

  if (!reqPhoto) {
    throw new BadRequestException('reqPhoto is required');
  }

  const file = await this.file.processUploadedFile(reqPhoto);

  // Check which profile this ID belongs to
  const [client, admin, worker] = await Promise.all([
    this.db.clientProfile.findUnique({ where: { id } }),
    this.db.adminProfile.findUnique({ where: { id } }),
    this.db.workerProfile.findUnique({ where: { id } }),
  ]);

  if (!client && !admin && !worker) {
    this.file.remove(file.id);
    throw new BadRequestException('Invalid profile ID — not a client, admin, or worker');
  }

  const data: any = {
    reqPhoto: {
      connect: { id: file.id },
    },
    name,
    status:"PENDING",
    ...rest,
    TaskType: {
      connect: { id: taskTypeId },
    },
  };

  if (client) {
    data.ClientProfile = { connect: { id } };
  } else if (admin) {
    data.AdminProfile = { connect: { id } };
  } else if (worker) {
    data.WorkerProfile = { connect: { id } };
  }

  try {
    const serviceRequest = await this.db.serviceRequest.create({
      data,
      include: {
        reqPhoto: { select: { url: true } },
        tasks: { select: { name: true, price: true } },
        ClientProfile: true,
        AdminProfile: true,
        WorkerProfile: true,
      },
    });

    // Return extra info based on who created it
    const creator = client
      ? { role: 'CLIENT', profile: serviceRequest.ClientProfile }
      : admin
      ? { role: 'ADMIN', profile: serviceRequest.AdminProfile }
      : { role: 'WORKER', profile: serviceRequest.WorkerProfile };

    return {
      data: {
        ...serviceRequest,
        createdBy: creator,
      },
      message: 'Service request created successfully',
      success: true,
    };
  } catch (error) {
    this.file.remove(file.id);
    throw new BadRequestException(`Failed to create service request\n ${error}`);
  }
}

    async cancelServiceRequest (id:IdDto,userId){
      const result = await this.db.serviceRequest.update({
        where:{id:id.id,clientProfileId:userId},
        data:{
          status:"CANCELLED"
        }
      })
      return {
         data: result,
         success:true,
         message: "Service Request Cancle"
      }
    }

}
