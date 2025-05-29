import { Injectable } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';

@Injectable()
export class TaskTypeService {
    constructor(private readonly db: DbService) {}

    getTaskType() {
        return this.db.taskType.findMany()
    }
}
