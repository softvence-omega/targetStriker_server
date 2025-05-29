import { Injectable } from '@nestjs/common';
import { IdDto } from 'src/common/dto/id.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { DbService } from 'src/utils/db/db.service';

@Injectable()
export class CommonService {
    constructor(
        private readonly db: DbService
    ) {}

    public async findServiceRequest({id}: IdDto) {
        return await this.db.serviceRequest.findUnique({
            where: {
                id: id
            }
        })
    }

    public async getServiceRequestList({
        skip,
        take
    }:PaginationDto) {
        return await this.db.serviceRequest.findMany({
            take,
            skip,
            select:{
                name:true,
                createdAt:true,
                ClientProfile:{
                    select:{
                        User:{
                            select:{
                                name:true
                            },
                        },
                        userName:true
                    }
                }
            }
        });
    }
}
