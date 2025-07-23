import { Injectable } from '@nestjs/common';
import { RequestStatus } from 'generated/prisma';
import { ApiResponse } from 'src/common/types/apiResponse';
import { DbService } from 'src/utils/db/db.service';
import { LibService } from 'src/utils/lib/lib.service';

@Injectable()
export class TaskOverviewService {
  constructor(
    private readonly db: DbService,
    private readonly lib: LibService, // Assuming lib is used for some utility functions
  ) {}

  public async getTaskOverview(): Promise<ApiResponse<any>> {
    const taskCounts = await this.getTaskCounts();
    const firstThreePendingTasks = await this.getFirstThreePendingTasks();

    return {
      data: {
        ...taskCounts,
        firstThreePendingTasks,
      },
      message: 'Task overview fetched successfully',
      success: true,
    };
  }

  private async getTaskCounts() {
    const [assigned,unAssigned, inProgress, completed, late, inTotal] = await Promise.all([
      this.db.serviceRequest.count({
        where: { status: RequestStatus.ASSIGNED },
      }),
      this.db.serviceRequest.count({
        where:{ status: RequestStatus.PENDING}
      }),
      this.db.serviceRequest.count({
        where: { status: RequestStatus.CONFIRMED },
      }),
      this.db.serviceRequest.count({
        where: { status: RequestStatus.COMPLETED },
      }),
      this.db.serviceRequest.count({
        where: {
          status: RequestStatus.PENDING,
          preferredTime: { lt: new Date() },
        },
      }),
      this.db.serviceRequest.count(), // total tasks
    ]);

    return {
      totalAssigned: assigned,
      totalUnAssigned:unAssigned,
      totalInProgress: inProgress,
      totalCompleted: completed,
      totalLate: late,
      totalTasks: inTotal,
    };
  }

  private async getFirstThreePendingTasks() {
    const tasks = await this.db.serviceRequest.findMany({
      where: { status: RequestStatus.PENDING },
      orderBy: { createdAt: 'asc' },
      take: 3,
      select: {
        name: true,
        preferredTime: true,
        locationDescription:true,
        city:true,
        createdAt: true,
        ClientProfile: {
          include:{
            User:true,
            profilePic:true,
          },
          // select: {
          //   userName: true,

          // },
        },
      },
    });

    return tasks.map((task) => ({
      name: task.name,
      time: task.preferredTime,
      location:task.locationDescription,
      city:task.city,
      clientUserName: task.ClientProfile?.userName || '',
      createdTime: this.lib.formatRelativeDate(new Date(task.createdAt)),
      clientProfile: task.ClientProfile?.profilePic
    }));
  }
}
