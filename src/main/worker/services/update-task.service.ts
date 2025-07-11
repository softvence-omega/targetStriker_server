import { Injectable } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';
import { UpdateTaskDto } from '../dto/updateTask.dto';

@Injectable()
export class UpdateTaskService {
  constructor(private readonly dbService: DbService) {}
  async updateTask(updateTaskDto: UpdateTaskDto, workerProfileId: string) {
    const { serviceRequestId, taskId, done } = updateTaskDto;

    const serviceRequest = await this.dbService.serviceRequest.findUnique({
      where: { id: serviceRequestId },
      include: { ClientProfile: true },
    });

    if (!serviceRequest || !serviceRequest.clientProfileId) {
      throw new Error(
        'Service request not found or client profile ID is missing',
      );
    }

    const task = await this.dbService.task.update({
      where: { id: taskId, workerId: workerProfileId, serviceRequestId },
      data: {
        done,
      },
    });

    return task;
  }
}
