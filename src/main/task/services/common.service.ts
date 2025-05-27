import { Injectable } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';

@Injectable()
export class CommonService {
    constructor(
        private readonly db: DbService  
    ) {}


}
