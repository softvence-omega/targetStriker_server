import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { FilterTaskDto } from 'src/main/admin/dto/filtertask.dto';
import { DbService } from 'src/utils/db/db.service';

@Injectable()
export class MyTaskService {
  constructor(private readonly dbService: DbService) {}

  async getMyTask(
    { skip, take }: PaginationDto,
    { location, taskTypeId, status, search }: FilterTaskDto,
    id: string,
  ) {
    const where: Prisma.ServiceRequestWhereInput = {};

    const orConditions: Prisma.ServiceRequestWhereInput[] = [];

    where.workerProfileId = id;

    if (location) {
      orConditions.push({
        city: {
          contains: location,
          mode: 'insensitive',
        },
      });
    }

    if (search) {
      orConditions.push({
        name: {
          contains: search,
          mode: 'insensitive',
        },
      });
    }

    if (orConditions.length > 0) {
      where.OR = orConditions;
    }

    if (taskTypeId) {
      where.taskTypeId = taskTypeId;
    }

    if (status) {
      where.status = status;
    }

    const taskRequests = await this.dbService.task.findMany({
      include: {
        ServiceRequest: {
          include: {
            ClientProfile: true,
            WorkerProfile: true,
          },
        },
      },
      take,
      skip,
      // where: Object.keys(where).length ? where : undefined,
    });

    // const now = new Date();

    // return taskRequests.map((task) => {
    //   let statusLabel = 'REQUESTED';

    //   if (task.done === RequestStatus.COMPLETED) {
    //     statusLabel = 'COMPLETED';
    //   } else if (task.status === RequestStatus.CONFIRMED) {
    //     statusLabel = task.preferredDate < now ? 'LATE' : 'CONFIRMED';
    //   } else if (
    //     task.workerProfileId &&
    //     task.status === RequestStatus.ASSIGNED
    //   ) {
    //     statusLabel = 'ASSIGNED';
    //   }
    //   return {
    //     ...task,
    //     statusLabel,
    //   };
    // });
    return taskRequests;
  }
}
