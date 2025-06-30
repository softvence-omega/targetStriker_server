import { Injectable } from '@nestjs/common';
import { Prisma, RequestStatus } from 'generated/prisma';
import { IdDto } from 'src/common/dto/id.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { DbService } from 'src/utils/db/db.service';
import { FilterTaskDto } from '../dto/filtertask.dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class TaskManagementService {
  constructor(private readonly dbService: DbService) {}

  async getServiceRequestsWithStatusLabel(
    { skip, take }: PaginationDto,
    { location, taskTypeId, status, search }: FilterTaskDto,
    id?: IdDto,
  ) {
    const where: Prisma.ServiceRequestWhereInput = {};

    if (id?.id) {
      where.clientProfileId = id.id;
    }

    if (location) {
      where.OR = [
        {
          city: {
            contains: location,
            mode: 'insensitive', // Optional: makes search case-insensitive
          },
        },
      ];
    }

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive', // Optional: makes search case-insensitive
          },
        },
      ];
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
      where: Object.keys(where).length ? where : undefined, // Apply only if filters exist
    });

    const now = new Date();

    const result = taskRequests.map((task) => {
      let statusLabel = 'REQUESTED';

      if (task.status === RequestStatus.COMPLETED) {
        statusLabel = 'COMPLETED';
      } else if (task.status === RequestStatus.CONFIRMED) {
        statusLabel = task.preferredDate < now ? 'LATE' : 'CONFIRMED';
      } else if (
        task.clientProfileId &&
        task.status === RequestStatus.ASSIGNED
      ) {
        statusLabel = 'ASSIGNED';
      }

      return {
        ...task,
        statusLabel,
      };
    });

    return result;
  }
}
