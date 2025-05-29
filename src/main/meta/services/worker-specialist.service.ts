import { Injectable } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';

@Injectable()
export class WorkerSpecialistService {
    constructor(
        private readonly db: DbService
    ) {}

    public async getWorkerSpecialist() {
        return await this.db.workerSpecialist.findMany({
            select:{
                id: true,
                name: true
            } 
        })
    }
}
