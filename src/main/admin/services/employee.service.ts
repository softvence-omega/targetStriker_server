import { Injectable } from '@nestjs/common';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ApiResponse } from 'src/common/types/apiResponse';
import { DbService } from 'src/utils/db/db.service';
import { FilterWorkerDto } from '../dto/filterWroker.dto';
import { Prisma } from 'generated/prisma';

@Injectable()
export class EmployeeService {
  constructor(private readonly db: DbService) {}

  public async getAllWorkerProfiles({
    skip,
    take,
    search,
    workerTypeId,
  }: FilterWorkerDto): Promise<ApiResponse<any>> {
    const filter: Prisma.WorkerProfileWhereInput = {};

    if (search) {
      filter.User = {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      };
    }

    if (workerTypeId) {
      filter.WorkerSpecialist = {
        id: workerTypeId,
      };
    }

    const data = await this.db.workerProfile.findMany({
      include: {
        User: {
          select: {
            name: true,
          },
        },
        profilePic: {
          select: {
            url: true,
          },
        },
        WorkerSpecialist: {
          select: {
            name: true,
            id: true,
          },
        },
      },
      skip,
      take,
      where: filter,
    });

    return {
      data,
      message: 'Worker profiles fetched successfully',
      success: true,
    };
  }

  public async searOrFilterWorkerProfiles({
    search,
    workerTypeId,
  }: FilterWorkerDto): Promise<ApiResponse<any>> {
    const data = await this.db.workerProfile.findMany({
      where: {
        OR: [
          {
            User: {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
          {
            WorkerSpecialist: {
              id: workerTypeId,
            },
          },
        ],
      },
    });

    return {
      data,
      message: 'Worker profiles fetched successfully',
      success: true,
    };
  }
}
