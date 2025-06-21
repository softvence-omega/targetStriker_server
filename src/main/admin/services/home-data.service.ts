import { Injectable } from '@nestjs/common';
import { RequestStatus } from 'generated/prisma';
import { ApiResponse } from 'src/common/types/apiResponse';
import { DbService } from 'src/utils/db/db.service';

@Injectable()
export class HomeDataService {
    constructor(
        private readonly db: DbService
    ) {}

    private async getTaskStatistics() {
    const [totalTaskRequests, totalAssignedTasks, totalConfirmedTasks, totalCompletedTasks, totalLateWork] =
      await Promise.all([
        this.db.serviceRequest.count(),
        this.db.serviceRequest.count({
          where: {
            workerProfileId: { not: null },
            status: RequestStatus.ASSIGNED,
          },
        }),
        this.db.serviceRequest.count({
          where: {
            status: RequestStatus.CONFIRMED,
          },
        }),
        this.db.serviceRequest.count({
          where: {
            status: RequestStatus.COMPLETED,
          },
        }),
        this.db.serviceRequest.count({
          where: {
            status: RequestStatus.CONFIRMED,
            preferredDate: {
              lt: new Date(), // earlier than now
            },
          },
        }).then(async (confirmedLate) => {
          const completedLate = await this.db.serviceRequest.count({
            where: {
              status: RequestStatus.COMPLETED,
              preferredDate: {
                lt: new Date(),
              },
            },
          });
          return confirmedLate - completedLate;
        }),
      ]);

    return {
      totalTaskRequests,
      totalAssignedTasks,
      totalConfirmedTasks,
      totalCompletedTasks,
      totalLateWork,
    };
  }

  public async getHomeData():Promise<ApiResponse<any>> {
    const taskStatistics = await this.getTaskStatistics();
    const firstThreeTasks = await this.db.serviceRequest.findMany({
      take: 3,
      orderBy: {
        createdAt: 'desc',
      },
      where:{
        status: RequestStatus.PENDING
      }
    })
    return {
        data: {
            taskStatistics,
            firstThreeTasks
        },
        message: 'Home data fetched successfully',
        success: true
    };
  }
}
