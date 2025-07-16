import { Injectable } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';
import { CompletedTaskDto } from '../dto/taskStatus.dto';

@Injectable()
export class WorkerTaskCompletedService {
    constructor(private readonly dbService:DbService) {
        
    }
    async taskCompleted(id:CompletedTaskDto){
        return await this.dbService.serviceRequest.update({
            data: {
                status: "COMPLETED"
            },
            where: {
                id:id.id
            }
        })
    }
}
