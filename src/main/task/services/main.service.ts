import { Injectable } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';

@Injectable()
export class MainService {
    constructor(
        private readonly db: DbService
    ) {}

    
}
