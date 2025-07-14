import { Injectable } from '@nestjs/common';
import { RequestStatus } from 'generated/prisma';
import { ApiResponse } from 'src/common/types/apiResponse';
import { DbService } from 'src/utils/db/db.service';

@Injectable()
export class HomeDataService {
  constructor(private readonly db: DbService) {}

  private async getTaskStatistics() {
    const [
      totalTask,
      totalTaskRequests,
      totalUnAssignedTask,
      totalAssignedTasks,
      totalConfirmedTasks,
      totalCompletedTasks,
      totalLateWork,
    ] = await Promise.all([
      this.db.serviceRequest.count(),
      this.db.serviceRequest.count({where:{
        status: RequestStatus.PENDING
      }}),
      this.db.serviceRequest.count({
        where: {status:RequestStatus.PENDING}
      }),
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
      this.db.serviceRequest
        .count({
          where: {
            status: RequestStatus.CONFIRMED,
            preferredDate: {
              lt: new Date(), // earlier than now
            },
          },
        })
        .then(async (confirmedLate) => {
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
      totalTask,
      totalTaskRequests,
      totalUnAssignedTask,
      totalAssignedTasks,
      totalConfirmedTasks,
      totalCompletedTasks,
      totalLateWork,
    };
  }

  public async totalWorkers() {
    return this.db.workerProfile.count();
  }

  public async getAverageRating() {
    return this.db.serviceRequest.aggregate({
      _avg: {
        rating: true,
      },
    });
  }

  public async getHomeData(): Promise<ApiResponse<any>> {
    const taskStatistics = await this.getTaskStatistics();
    const totalWorkers = await this.totalWorkers();
    const averageRating = await this.getAverageRating();
    const firstThreeTasksRaw = await this.db.serviceRequest.findMany({
      take: 3,
      orderBy: {
      createdAt: 'desc',
      },
      where: {
      status: RequestStatus.ASSIGNED,
      workerProfileId: { not: null }, 
      },
      include: {
      TaskType: {
        select: {
        name: true,
        id: true,
        },
      },
      WorkerProfile: {
        select: {
        userName: true,
        id: true,
        },
      },
      },
    });

    // Helper function to format date as "x days ago"
    function formatRelativeDate(date: Date): string {
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHr = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHr / 24);

      if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
      if (diffHr > 0) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
      if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
      return 'just now';
    }

    const firstThreeTasks = firstThreeTasksRaw.map(task => ({
      ...task,
      createdAtFormatted: formatRelativeDate(task.createdAt),
    }));
    return {
      data: {
        taskStatistics,
        totalWorkers,
        averageRating,
        firstThreeTasks,
      },
      message: 'Home data fetched successfully',
      success: true,
    };
  }
}
