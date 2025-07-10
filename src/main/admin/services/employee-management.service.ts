import { Injectable } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';

@Injectable()
export class EmployeeManagementService {
  constructor(private readonly dbService: DbService) {}
  public async getEmployeeOverview() {
    const [activeWorkers, inactiveWorkers, totalWorkers] = await Promise.all([
      this.getAllWorkers(),
      this.getInactiveWorkers(),
      this.getTotalWorkers(),
    ]);
    const firstThreeWorkers = await this.getFirstThreePendingTasks();

    return {
      activeWorkers,
      inactiveWorkers,
      totalWorkers,
      firstThreeWorkers,
    };
  }

  //  // Get first three workers
  private async getFirstThreePendingTasks() {
    const workers = await this.dbService.workerProfile.findMany({
      orderBy: {
        User: {
          createdAt: 'desc',
        },
      },
      include: {
        profilePic: true,
        User: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            createdAt: true,
          },
        },
      },
      take: 3,
    });
    return workers;
  }

  // active workers
  private async getAllWorkers() {
    return await this.dbService.workerProfile.count({
      where: {
        isActive: 'ACTIVE',
      },
    });
  }
  // inactive workers
  private async getInactiveWorkers() {
    return await this.dbService.workerProfile.count({
      where: {
        isActive: 'INACTIVE',
      },
    });
  }

  // Total number of workers
  private async getTotalWorkers() {
    const totalWorkers = await this.dbService.workerProfile.count();
    return totalWorkers;
  }
}
