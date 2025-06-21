import { Injectable } from '@nestjs/common';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ApiResponse } from 'src/common/types/apiResponse';
import { DbService } from 'src/utils/db/db.service';
import { FilterWorkerDto } from '../dto/filterWroker.dto';

@Injectable()
export class EmployeeService {
  constructor(private readonly db: DbService) {}

  public async getAllWorkerProfiles({
    skip,
    take
  }: PaginationDto): Promise<ApiResponse<any>> {
    const data = await this.db.workerProfile.findMany({
      include: {
        User:{
            select:{
                name: true
            }
        }, // this pulls the full user object
      },
      skip,
      take
    });

    return {
      data,
      message: 'Worker profiles fetched successfully',
      success: true,
    };
  }

  public async searOrFilterWorkerProfiles({
    search,
    workerTypeId
  }: FilterWorkerDto): Promise<ApiResponse<any>> {
      const data = await this.db.workerProfile.findMany({
        where: {
          OR: [
            {
              User: {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
            {
              WorkerSpecialist: {
                id: workerTypeId,
              },
            },
          ],
        },
      })

      return {
          data,
          message: 'Worker profiles fetched successfully',
          success: true
      }
  } 
}
