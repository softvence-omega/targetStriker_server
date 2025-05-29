import { BadRequestException, Injectable } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';
import { AssignTaskDto } from '../dto/assignTask.dto';
import { CommonService } from './common.service';
import { ApiResponse } from 'src/common/types/apiResponse';
import { IdDto } from 'src/common/dto/id.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class AssignTaskService {
    constructor(
        private readonly db: DbService,
        private readonly commonService: CommonService
    ) {}

    public async assignTask({
        taskId,
        workerId
    }:AssignTaskDto): Promise<ApiResponse<any>> {
        const isExist = this.commonService.findServiceRequest({id: taskId})
        if(!isExist){
            throw new BadRequestException('Service request not found')
        }

        const data = await this.db.serviceRequest.update({
            where: {
                id: taskId
            },
            data: {
                WorkerProfile:{
                    connect: {
                        id: workerId
                    }
                }
            }
        })
        return {
            data,
            message: 'Task assigned successfully',
            success: true
        }
    }

    public async getAssignedServiceRequest({ id }: IdDto, pagination:PaginationDto): Promise<ApiResponse<any>> {
        const isUserExist = await this.db.user.findFirst({
            where: {
                workerProfile:{
                    userId: id
                }
            },
        })

        if(!isUserExist){
            throw new BadRequestException('User not found')
        }

        const data = await this.db.serviceRequest.findMany({
            where: {
                WorkerProfile: {
                    userId: id
                }
            },
            ...pagination
        })

        return {
            data,
            message: 'Service requests fetched successfully',
            success: true
        }

    }
}
