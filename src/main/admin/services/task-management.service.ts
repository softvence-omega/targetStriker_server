import { Injectable } from '@nestjs/common';
import { RequestStatus } from 'generated/prisma';
import { IdDto } from 'src/common/dto/id.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { DbService } from 'src/utils/db/db.service';

@Injectable()
export class TaskManagementService {
  constructor(private readonly dbService: DbService) {}

  async getServiceRequestsWithStatusLabel({ skip, take }: PaginationDto, id?: IdDto) {
    const taskRequests = await this.dbService.serviceRequest.findMany({
      include: {
        ClientProfile: true,
        WorkerProfile: true,
      },
      take,
      skip,
      ...(id && { where: { clientProfileId: id.id } }),
    });

    const now = new Date();

    const result = taskRequests.map((task) => {
      let statusLabel = 'REQUESTED';

      if (task.status === RequestStatus.COMPLETED) statusLabel = 'COMPLETED';
      if (task.status === RequestStatus.CONFIRMED) {
        if (task.preferredDate < now) {
          statusLabel = 'LATE';
        } else {
          statusLabel = 'CONFIRMED';
        }
      }
      if (task.clientProfileId && task.status === RequestStatus.ASSIGNED)
        statusLabel = 'ASSIGNED';

      return {
        ...task,
        statusLabel,
      };
    });

    return result;
  }
}
