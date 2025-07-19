import { Injectable } from '@nestjs/common';
import { IdDto } from 'src/common/dto/id.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ApiResponse } from 'src/common/types/apiResponse';
import { DbService } from 'src/utils/db/db.service';
import { ViewAllDto } from '../dto/viewAll.dot';

@Injectable()
export class CommonService {
  constructor(private readonly db: DbService) {}

  public async findServiceRequest({ id }: IdDto) {
    return await this.db.serviceRequest.findUnique({
      where: {
        id: id,
      },
      include:{
        ClientProfile:true,
        WorkerProfile:true,
        AdminProfile:{
          include:{
            User:true
          }
        },
        tasks:true,
        afterPhoto:true,
        beforePhoto:true,
        Invoice:true,
        Reviews:true,
        signature:true,
        TaskType:{
          select: {
            name: true,
          }
        },
        reqPhoto:{
          select: {
            url: true,
          },
        }
      }
    });
  }

  public async getServiceRequestList({
    skip,
    take,
  }: PaginationDto): Promise<ApiResponse<any>> {
    const data = await this.db.serviceRequest.findMany({
      take,
      skip,
      select: {
        id: true,
        name: true,
        createdAt: true,
        locationDescription: true,
        city: true,
        status: true,
        TaskType:true,
        reqPhoto: true,
        ClientProfile: true,
        
      },
      where: {
        status: 'PENDING',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      data,
      message: 'Service requests fetched successfully',
      success: true,
    };
  }

  public async getMyServiceRequest(
    { id: profileId }: IdDto,
    { skip, take }: PaginationDto,
  ): Promise<ApiResponse<any>> {
    const data = await this.db.serviceRequest.findMany({
      take,
      skip,
      where: {
        ClientProfile: {
          id: profileId,
        },
      },
      // select: {
      //   id: true,
      //   locationDescription: true,
      //   city: true,
      //   name: true,
      // },
    });

    return {
      data,
      message: 'Service requests fetched successfully',
      success: true,
    };
  }

  public async getMyRequestOverview({ id }: IdDto): Promise<ApiResponse<any>> {
    const data = await this.db.$transaction(async (tx) => {
      const requested = await tx.serviceRequest.findMany({
        where: {
          status: 'PENDING',
          clientProfileId: id,
        },
        select:{
          TaskType:{
            select: {
              id: true,
              name: true,
            }
          }
        },
        take: 3,
      });
      const confirmed = await tx.serviceRequest.findMany({
        where: {
          status: 'CONFIRMED',
          clientProfileId: id,
        },
        select:{
          TaskType:{
            select: {
              id: true,
              name: true,
            }
          }
        },
        take: 3,
      });
      const completed = await tx.serviceRequest.findMany({
        where: {
          status: 'COMPLETED',
          clientProfileId: id,
        },
        select:{
          TaskType:{
            select: {
              id: true,
              name: true,
            }
          }
        },
        take: 3,
      });

      return {
        requested,
        confirmed,
        completed,
      };
    });
    return {
      data,
      message: 'Service requests fetched successfully',
      success: true,
    };
  }

  public async getViewServiceRequest(
    id: IdDto,
    { taskType, skip, take }: ViewAllDto,
  ):Promise<ApiResponse<any>> {
    const data = await this.db.serviceRequest.findMany({
      where: {
        status: taskType,
        clientProfileId: id.id,
      },
      take,
      skip,
    });

    return {
      data,
      message: 'Service requests fetched successfully',
      success: true,
    }
  }

   public async getMyRequestOverviewByWorker({ id }: IdDto): Promise<ApiResponse<any>> {
    const data = await this.db.$transaction(async (tx) => {
      const setPrice = await tx.serviceRequest.findMany({
        where: {
          status: 'ASSIGNED',
          clientProfileId: id,
        },
        take: 3,
      });
      const confirmed = await tx.serviceRequest.findMany({
        where: {
          status: 'CONFIRMED',
          clientProfileId: id,
        },
        take: 3,
      });
      const completed = await tx.serviceRequest.findMany({
        where: {
          status: 'COMPLETED',
          clientProfileId: id,
        },
        take: 3,
      });

      return {
        setPrice,
        confirmed,
        completed,
      };
    });
    return {
      data,
      message: 'Service requests fetched successfully',
      success: true,
    };
  }
}
