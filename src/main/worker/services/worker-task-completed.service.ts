import { Injectable } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';
import { CompletedTaskDto, CompletedTaskNoteDto } from '../dto/taskStatus.dto';

@Injectable()
export class WorkerTaskCompletedService {
    constructor(private readonly dbService:DbService) {
        
    }
    async taskCompleted(id: CompletedTaskDto, note: CompletedTaskNoteDto){
        return await this.dbService.serviceRequest.update({
            data: {
                status: "COMPLETED",
                note: note?.note || null,
            },
            where: {
                id:id.id
            }
        })
    }
}
