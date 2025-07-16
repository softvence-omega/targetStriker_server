import { Injectable } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';
import { CompletedTaskDto } from '../dto/taskStatus.dto';
import { RequestStatus } from 'generated/prisma'; // ✅ Import enum from Prisma

@Injectable()
export class WorkerTaskPuseService {
  constructor(private readonly dbService: DbService) {}

  async taskPuse(id: CompletedTaskDto) {
    return await this.dbService.serviceRequest.update({
        where: {
          id: id.id,
        },
      data: {
        status: RequestStatus.PUSE, 
      },
    });
  }
}
