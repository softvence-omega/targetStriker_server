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
      WorkerProfile: {
        select: {
          profilePic: true,
          userName: true,
        },
      },
    },
  });

  const clientUserId = serviceRequest.ClientProfile?.userId;

  const notificationPayload = {
    type: 'PRICE_SET',
    serviceRequestId: id,
    serviceRequestName: serviceRequest.name,
    price,
    workerProfile: serviceRequest.WorkerProfile?.profilePic,
    workerName: serviceRequest.WorkerProfile?.userName,
    message: `The worker has set a price for your service request.`,
  };

  if (clientUserId) {
    try {
      // ✅ Send real-time notification
      await this.notificationGateway.notifyUser(clientUserId, notificationPayload);

      // ✅ Persist notification in DB
      await this.db.notification.create({
        data: {
          userId: clientUserId,
          title: 'Price Set for Service Request',
          body: `The worker has set a price of ₹${price} for your request.`,
          data: notificationPayload,
        },
      });
    } catch (error) {
      console.error('Failed to notify client about price set:', error);
    }
  }

  return {
    data: serviceRequest,
    message: 'Price set successfully',
    success: true,
  };
}
}
