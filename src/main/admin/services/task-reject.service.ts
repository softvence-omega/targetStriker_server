import { Injectable } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';

@Injectable()
export class TaskRejectService {
  // This service can be used to handle task rejection logic
  // For example, it can interact with the database to update task status
  // or notify users about the rejection.
  constructor(
    private readonly dbService: DbService, // Assuming DbService is used for database operations
  ) {}

  async rejectTask(taskId: string) {
    const task = await this.dbService.serviceRequest.findUnique({
      where: { id: taskId },
    });
    if (!task) {
      throw new Error('Task not found');
    }
    if (task?.status !== 'PENDING') {
      throw new Error('Task can only be rejected if it is in PENDING status');
    }

    const result = await this.dbService.serviceRequest.update({
      where: { id: taskId },
      data: {
        status: 'REJECT', // Assuming 'REJECTED' is a valid status
      },
    });
    return {
      message: 'Task rejected successfully',
      task: result,
    };
  }
}
