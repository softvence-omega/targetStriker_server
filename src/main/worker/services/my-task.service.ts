import { Injectable } from '@nestjs/common';
import { Prisma, RequestStatus } from 'generated/prisma';
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

    if (id) {
      const worker = await this.dbService.workerProfile.findUnique({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        where: { userId: id },
        select: { id: true },
      });

      if (worker) {
        where.workerProfileId = worker.id;
      } else {
        return [];
      }
    }

    const orConditions: Prisma.ServiceRequestWhereInput[] = [];

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

    const taskRequests = await this.dbService.serviceRequest.findMany({
      include: {
        ClientProfile: true,
        WorkerProfile: true,
      },
      take,
      skip,
      where: Object.keys(where).length ? where : undefined,
    });

    const now = new Date();

    return taskRequests.map((task) => {
      let statusLabel = 'REQUESTED';

      if (task.status === RequestStatus.COMPLETED) {
        statusLabel = 'COMPLETED';
      } else if (task.status === RequestStatus.CONFIRMED) {
        statusLabel = task.preferredDate < now ? 'LATE' : 'CONFIRMED';
      } else if (
        task.workerProfileId &&
        task.status === RequestStatus.ASSIGNED
      ) {
        statusLabel = 'ASSIGNED';
      }

      return {
        ...task,
        statusLabel,
      };
    });
  }
}
