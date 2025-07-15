import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { FilterTaskDto } from 'src/main/admin/dto/filtertask.dto';
import { DbService } from 'src/utils/db/db.service';

@Injectable()
export class NonpriceSetTaskListService {
    constructor(private readonly dbService: DbService) {}

    async getNonPriceTask ({ skip, take }: PaginationDto,
        { location, taskTypeId, status, search }: FilterTaskDto,
        id: string,) {
         const where: Prisma.ServiceRequestWhereInput = {};
         
             const orConditions: Prisma.ServiceRequestWhereInput[] = [];
         
             where.workerProfileId = id;
         
             if (location) {
               orConditions.push({
                 city: {
                   contains: location,
                   mode: 'insensitive',
                 },
               });
             }
         
             if (search) {
               orConditions.push({
                 name: {
                   contains: search,
                   mode: 'insensitive',
                 },
               });
             }
         
             if (orConditions.length > 0) {
               where.OR = orConditions;
             }
         
             if (taskTypeId) {
               where.taskTypeId = taskTypeId;
             }
         
             if (status) {
               where.status = status;
             }
         
             const taskRequests = await this.dbService.serviceRequest.findMany({
                where:{
                basePrice:0
                },
               include: {
                 WorkerProfile:true,
                 ClientProfile:true,
               },
               take,
               skip,
               // where: Object.keys(where).length ? where : undefined,
             });   

             return taskRequests;
    }
}
