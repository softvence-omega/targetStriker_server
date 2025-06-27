import { Injectable, NotFoundException } from '@nestjs/common';
import { IdDto } from 'src/common/dto/id.dto';
import { ApiResponse } from 'src/common/types/apiResponse';
import { DbService } from 'src/utils/db/db.service';

@Injectable()
export class CommonService {
    constructor(
        private readonly db: DbService  
    ) {}


    public async getTaskDetails({id:serviceRequestId}:IdDto):Promise<ApiResponse<any>>{
        const data = await this.db.serviceRequest.findUnique({
            where: {
              id: serviceRequestId,
            },
            include: {
             tasks:{
                select:{
                    name: true
                }
             },
             reqPhoto: {
                select: {
                  url: true,
                },
              },
             afterPhoto: {
                select: {
                  url: true,
                },
             }
            },
        }) 

        if (!data) {
            throw new NotFoundException('Service request not found');
        }

        return {
            data:{
                serviceRequestId: data.id,
                serviceRequestName: data.name,
                tasks: data.tasks,
                reqPhoto: data.reqPhoto,
                afterPhoto: data.afterPhoto
            },
            message: 'Task details fetched successfully',
            success: true
        }
    }

}
