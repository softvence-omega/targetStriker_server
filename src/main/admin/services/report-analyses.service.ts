import { Injectable } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';
import { DateTime } from 'luxon';
import { $Enums, InvoiceStatus, RequestStatus } from 'generated/prisma';

export interface WeeklyRevenue {
  weekStart: Date;
  weekEnd: Date;
  totalAmount: number;
  invoiceCount: number;
}

export interface RevenueResponse {
  totalRevenue: number;
  weeklyBreakdown: WeeklyRevenue[];
  invoiceCount: number;
  period: {
    from: Date;
    to: Date;
  };
}
@Injectable()
export class ReportAnalysesService {
  constructor(private readonly db: DbService) {}

  public async getReport(query?: 'lastMonth' | 'thisMonth') {
  const zone = 'Europe/Copenhagen';
  const now = DateTime.now().setZone(zone).startOf('month');
  let month: string | undefined;

  if (query === 'lastMonth') {
    month = now.minus({ months: 1 }).toFormat('yyyy-MM');
  } else if (query === 'thisMonth') {
    month = now.toFormat('yyyy-MM');
  }

  return {
    monthlyTurnoverReport: await this.getMonthlyTurnoverReport(month),
    monthlyCompletionRate: await this.getMonthlyCompletionRate(month),
    pendingServiceRequestsCount: await this.getPendingServiceRequestsCount(),
    totalWorkerCount: await this.getTotalWorkerCount(),
    confirmedInvoicesLineChartData: await this.getLast5WeeksRevenue(),
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

  // For each task type, count and sum basePrice from service requests
  const data = await Promise.all(
    taskTypes.map(async (type) => {
      const [count, amountResult] = await Promise.all([
        this.db.serviceRequest.count({
          where: { taskTypeId: type.id },
        }),
        this.db.serviceRequest.aggregate({
          where: { taskTypeId: type.id },
          _sum: { basePrice: true },
        }),
      ]);

      return {
        label: type.name,
        count,
        amount: amountResult._sum.basePrice ?? 0,
      };
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
  // Get the average rating
  const averageRatingResult = await this.db.serviceRequest.aggregate({
    _avg: {
      rating: true,
    },
  });

  // Get the first 3 latest reviews
  const firstThreeReviews = await this.db.serviceRequest.findMany({
    where: {
      review: {
        not: null,
      },
      rating: {
        not: 0,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {

      review: true,
      rating: true,
      createdAt: true,
      ClientProfile:{
        include:{
          profilePic:true,
          User:{
            select:{
              name:true,
            }
          }
        }
      },
    },
    take: 3,
  });

  // Count total reviews and how many are positive (rating >= 4)
  const [totalCount, positiveCount] = await Promise.all([
    this.db.serviceRequest.count({
      where: {
        rating: {
          not: 0,
        },
      },
    }),
    this.db.serviceRequest.count({
      where: {
        rating: {
          gte: 4,
        },
      },
    }),
  ]);

  const positivePercentage =
    totalCount > 0 ? Number(((positiveCount / totalCount) * 100).toFixed(2)) : 0;

  return {
    averageRating: averageRatingResult._avg.rating,
    firstThreeReviews,
    totalCount,
    positiveCount,
    positivePercentage, // e.g., 66.67
  };
}

  async getLast5WeeksRevenue(includeStatuses?: InvoiceStatus[]): Promise<RevenueResponse> {
    const fiveWeeksAgo = new Date();
    fiveWeeksAgo.setDate(fiveWeeksAgo.getDate() - 35); // 5 weeks = 35 days
    fiveWeeksAgo.setHours(0, 0, 0, 0); // Start of day

    const now = new Date();
    now.setHours(23, 59, 59, 999); // End of day

    // Build where clause
    const whereClause: any = {
      dateIssued: {
        gte: fiveWeeksAgo,
        lte: now,
      },
    };

    // Add status filter if provided
    if (includeStatuses && includeStatuses.length > 0) {
      whereClause.invoiceStatus = {
        in: includeStatuses,
      };
    }

    // Get all invoices from the last 5 weeks
    const invoices = await this.db.invoice.findMany({
      where: whereClause,
      select: {
        id: true,
        totalAmount: true,
        dateIssued: true,
        invoiceStatus: true,
      },
      orderBy: {
        dateIssued: 'desc',
      },
    });

    // Calculate total revenue
    const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);

    // Group by week for detailed breakdown
    const weeklyRevenue = this.groupInvoicesByWeek(invoices);

    return {
      totalRevenue,
      weeklyBreakdown: weeklyRevenue,
      invoiceCount: invoices.length,
      period: {
        from: fiveWeeksAgo,
        to: now,
      },
    };
  }

  async getLast5WeeksRevenueSimple(includeStatuses?: InvoiceStatus[]): Promise<{ totalRevenue: number; invoiceCount: number }> {
    const fiveWeeksAgo = new Date();
    fiveWeeksAgo.setDate(fiveWeeksAgo.getDate() - 35);
    fiveWeeksAgo.setHours(0, 0, 0, 0);

    const whereClause: any = {
      dateIssued: {
        gte: fiveWeeksAgo,
      },
    };

    if (includeStatuses && includeStatuses.length > 0) {
      whereClause.invoiceStatus = {
        in: includeStatuses,
      };
    }

    const result = await this.db.invoice.aggregate({
      where: whereClause,
      _sum: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
    });

    return {
      totalRevenue: result._sum.totalAmount || 0,
      invoiceCount: result._count.id,
    };
  }

  async getRevenueByDateRange(startDate: Date, endDate: Date, includeStatuses?: InvoiceStatus[]): Promise<RevenueResponse> {
    const whereClause: any = {
      dateIssued: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (includeStatuses && includeStatuses.length > 0) {
      whereClause.invoiceStatus = {
        in: includeStatuses,
      };
    }

    const invoices = await this.db.invoice.findMany({
      where: whereClause,
      select: {
        id: true,
        totalAmount: true,
        dateIssued: true,
        invoiceStatus: true,
      },
      orderBy: {
        dateIssued: 'desc',
      },
    });

    const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const weeklyRevenue = this.groupInvoicesByWeek(invoices);

    return {
      totalRevenue,
      weeklyBreakdown: weeklyRevenue,
      invoiceCount: invoices.length,
      period: {
        from: startDate,
        to: endDate,
      },
    };
  }

  private groupInvoicesByWeek(invoices: any[]): WeeklyRevenue[] {
    const weeklyRevenue: { [key: string]: WeeklyRevenue } = {};

    invoices.forEach((invoice) => {
      const weekStart = this.getWeekStart(invoice.dateIssued);
      const weekEnd = this.getWeekEnd(weekStart);
      const weekKey = weekStart.toISOString().split('T')[0]; // YYYY-MM-DD format

      if (!weeklyRevenue[weekKey]) {
        weeklyRevenue[weekKey] = {
          weekStart,
          weekEnd,
          totalAmount: 0,
          invoiceCount: 0,
        };
      }

      weeklyRevenue[weekKey].totalAmount += invoice.totalAmount;
      weeklyRevenue[weekKey].invoiceCount++;
    });

    // Sort by week start date (most recent first)
    return Object.values(weeklyRevenue).sort(
      (a, b) => b.weekStart.getTime() - a.weekStart.getTime()
    );
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const weekStart = new Date(d.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }

  private getWeekEnd(weekStart: Date): Date {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return weekEnd;
  }

  // Helper method to get revenue for completed invoices only
  async getLast5WeeksCompletedRevenue(): Promise<RevenueResponse> {
    // Adjust these status values based on your actual InvoiceStatus enum
    return this.getLast5WeeksRevenue([
      // InvoiceStatus.COMPLETED,
      // InvoiceStatus.PAID,
      // Add other "completed" statuses as needed
    ]);
  }

  // Helper method to get monthly revenue comparison
  async getMonthlyRevenueComparison(): Promise<{
    currentMonth: number;
    lastMonth: number;
    percentageChange: number;
  }> {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const [currentMonth, lastMonth] = await Promise.all([
      this.db.invoice.aggregate({
        where: {
          dateIssued: {
            gte: currentMonthStart,
          },
        },
        _sum: { totalAmount: true },
      }),
      this.db.invoice.aggregate({
        where: {
          dateIssued: {
            gte: lastMonthStart,
            lte: lastMonthEnd,
          },
        },
        _sum: { totalAmount: true },
      }),
    ]);

    const currentTotal = currentMonth._sum.totalAmount || 0;
    const lastTotal = lastMonth._sum.totalAmount || 0;
    const percentageChange = lastTotal > 0 ? ((currentTotal - lastTotal) / lastTotal) * 100 : 0;

    return {
      currentMonth: currentTotal,
      lastMonth: lastTotal,
      percentageChange: Math.round(percentageChange * 100) / 100,
    };
  }

  async getPendingServiceRequestsCount(): Promise<number> {
   const pendingCount = await this.db.serviceRequest.count({
        where: {
          status: 'PENDING'
        }
      });
    return pendingCount;
  }

  async getTotalWorkerCount(): Promise<number> {
    const workerCount = await this.db.workerProfile.count();
    return workerCount;
  }
}
