import { BadRequestException, Injectable } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';
import { SetPriceDto } from '../dto/setPrice.dto';
import { CommonService } from 'src/main/service-request/services/common.service';
import { ApiResponse } from 'src/common/types/apiResponse';
import { NotificationGateway } from 'src/main/notification/notification.gateway';

@Injectable()
export class MainService {
  constructor(
    private readonly db: DbService,
    private readonly commonService: CommonService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  public async setPrice({ id, price }: SetPriceDto): Promise<ApiResponse<any>> {
    const isExist = await this.commonService.findServiceRequest({ id });
  if (!isExist) {
    throw new BadRequestException('Service request not found');
  }

  const serviceRequest = await this.db.serviceRequest.update({
    where: { id },
    data: {
      basePrice: price,
    },
    include: {
      ClientProfile: {
        select: {
          userId: true,
        },
      },
      WorkerProfile:{
        select: {
          profilePic: true,
          userName: true,
        },
      }
    },
  });

  // ✅ Send notification to client
  const clientUserId = serviceRequest.ClientProfile?.userId;

  if (clientUserId) {
    await this.notificationGateway.notifyUser(clientUserId, {
      type: 'PRICE_SET',
      serviceRequestName: serviceRequest.name,
      message: `The worker has set a price for your service request.`,
      serviceRequestId: id,
      workerProfile: serviceRequest.WorkerProfile?.profilePic,
      workerName: serviceRequest.WorkerProfile?.userName,
      price,
    });
  }

  return {
    data: serviceRequest,
    message: 'Price set successfully',
    success: true,
  }
}
}
