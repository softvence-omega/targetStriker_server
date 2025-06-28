import { Injectable } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';
import { DateTime } from 'luxon';
import { $Enums, RequestStatus } from 'generated/prisma';

@Injectable()
export class ReportAnalysesService {
  constructor(private readonly db: DbService) {}

  public async getReport() {
    return {
      monthlyTurnoverReport: await this.getMonthlyTurnoverReport(),
      monthlyCompletionRate: await this.getMonthlyCompletionRate(),
      taskTypeStatistics: await this.getTaskTypeStatistics(),
      taskStatus: await this.statusCount(),
      averageRatingAndReviews: await this.averageRating(),
    };
  }

  private async getMonthlyCompletionRate(month?: string) {
    const zone = 'Europe/Copenhagen';

    const targetMonth = month
      ? DateTime.fromFormat(month, 'yyyy-MM', { zone }).startOf('month')
      : DateTime.now().setZone(zone).startOf('month');

    const previousMonth = targetMonth.minus({ months: 1 });

    const [totalCompletedTasks, currentMonthCompleted, previousMonthCompleted] =
      await Promise.all([
        this.db.serviceRequest.count({
          where: { status: $Enums.RequestStatus.COMPLETED },
        }),
        this.db.serviceRequest.count({
          where: {
            status: $Enums.RequestStatus.COMPLETED,
            updatedAt: {
              gte: targetMonth.toJSDate(),
              lt: targetMonth.plus({ months: 1 }).toJSDate(),
            },
          },
        }),
        this.db.serviceRequest.count({
          where: {
            status: $Enums.RequestStatus.COMPLETED,
            updatedAt: {
              gte: previousMonth.toJSDate(),
              lt: targetMonth.toJSDate(),
            },
          },
        }),
      ]);

    const progressRate =
      ((currentMonthCompleted - previousMonthCompleted) /
        Math.max(previousMonthCompleted, 1)) *
      100;

    return {
      targetMonth: targetMonth.toFormat('yyyy-MM'),
      totalCompletedTasks,
      currentMonth: currentMonthCompleted,
      previousMonth: previousMonthCompleted,
      progressRate: Number(progressRate.toFixed(2)),
    };
  }
  private async getMonthlyTurnoverReport(month?: string) {
    const zone = 'Europe/Copenhagen';

    const targetMonth = month
      ? DateTime.fromFormat(month, 'yyyy-MM', { zone }).startOf('month')
      : DateTime.now().setZone(zone).startOf('month');

    const previousMonth = targetMonth.minus({ months: 1 });

    const [currentRequests, previousRequests] = await Promise.all([
      this.db.serviceRequest.findMany({
        where: {
          status: $Enums.RequestStatus.COMPLETED,
          updatedAt: {
            gte: targetMonth.toJSDate(),
            lt: targetMonth.plus({ months: 1 }).toJSDate(),
          },
        },
        include: {
          tasks: true,
        },
      }),
      this.db.serviceRequest.findMany({
        where: {
          status: $Enums.RequestStatus.COMPLETED,
          updatedAt: {
            gte: previousMonth.toJSDate(),
            lt: targetMonth.toJSDate(),
          },
        },
        include: {
          tasks: true,
        },
      }),
    ]);

    const sumTurnover = (requests: any[]) =>
      requests.reduce((total, req) => {
        const taskTotal = req.tasks.reduce(
          (sum, task) => sum + (task.price || 0),
          0,
        );
        return total + req.basePrice + taskTotal;
      }, 0);

    const currentTurnover = sumTurnover(currentRequests);
    const previousTurnover = sumTurnover(previousRequests);

    const progressRate =
      ((currentTurnover - previousTurnover) / Math.max(previousTurnover, 1)) *
      100;

    return {
      targetMonth: targetMonth.toFormat('yyyy-MM'),
      currentTurnover,
      previousTurnover,
      progressRate: Number(progressRate.toFixed(2)), // as percent
    };
  }

  private async getTaskTypeStatistics() {
    // Fetch all available task types
    const taskTypes = await this.db.taskType.findMany();

    // For each task type, count the number of service requests
    const data = await Promise.all(
      taskTypes.map(async (type) => {
        const count = await this.db.serviceRequest.count({
          where: { taskTypeId: type.id },
        });
        return { label: type.name, count };
      }),
    );

    return data;
  }

  private async statusCount() {
    const statusCounts = await this.db.serviceRequest.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    return statusCounts;
  }

  private async averageRating() {
    const averageRating = await this.db.serviceRequest.aggregate({
      _avg: {
        rating: true,
      },
    });
    const firstThreeReviews = await this.db.serviceRequest.findMany({
      where: {
        review: {
          not: null, // or not: '' if you're storing empty strings
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        review: true,
        rating: true,
        createdAt: true,
      },
      take: 3,
    });

    return {
      averageRating: averageRating._avg.rating,
      firstThreeReviews,
    }
  }
}
