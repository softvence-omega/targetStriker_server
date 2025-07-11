import { Injectable } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';
import { AddTaskDto } from '../dto/addTask.dto';

@Injectable()
export class AddTaskService {
  constructor(private readonly dbService: DbService) {}
  async addTask(addTaskDto: AddTaskDto, workerProfileId: string) {
    const { serviceRequestId, name, price } = addTaskDto;

    const serviceRequest = await this.dbService.serviceRequest.findUnique({
      where: { id: serviceRequestId },
      include: { ClientProfile: true },
    });

    if (!serviceRequest || !serviceRequest.clientProfileId) {
      throw new Error(
        'Service request not found or client profile ID is missing',
      );
    }

    const task = await this.dbService.task.create({
      data: {
        name,
        price,
        serviceRequestId,
        clientId: serviceRequest.clientProfileId,
        workerId: workerProfileId,
      },
    });

    return task;
  }
}
