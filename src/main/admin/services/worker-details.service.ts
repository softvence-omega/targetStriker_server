import { Injectable } from '@nestjs/common';
import { IdDto } from 'src/common/dto/id.dto';
import { ApiResponse } from 'src/common/types/apiResponse';
import { DbService } from 'src/utils/db/db.service';

@Injectable()
export class WorkerDetailsService {
  constructor(private readonly db: DbService) {}

  public async getWorkerDetails(id: IdDto): Promise<ApiResponse<any>> {
    const getWorkerDetails = await this.db.workerProfile.findUnique({
      where: {
        id: id.id,
      },
      include: {
        User: {
          select: {
            id: true,
            email: true,
            phone: true,
          },
        },
        WorkerSpecialist: {
          select: {
            name: true,
          },
        },
        assignedService: true,
      },
    });

    const totalAssigned: number = getWorkerDetails?.assignedService.length ?? 0;
    const totalCompleted: number =
      getWorkerDetails?.assignedService.filter(
        (item) => item.status === 'COMPLETED',
      ).length ?? 0;
    const totalPending: number =
      getWorkerDetails?.assignedService.filter(
        (item) => item.status === 'PENDING',
      ).length ?? 0;
    const averageRating: number = getWorkerDetails?.assignedService?.length
      ? getWorkerDetails.assignedService.reduce(
          (acc, item) => acc + item.rating,
          0,
        ) / getWorkerDetails.assignedService.length
      : 0;

      return {
        success: true,
        message: 'Worker details fetched successfully',
        data: {
          ...getWorkerDetails,
          totalAssigned,
          totalCompleted,
          totalPending,
          averageRating,
        },
      }
  }
}
