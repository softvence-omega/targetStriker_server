import { BadRequestException, Injectable } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';
import { SetPriceDto } from '../dto/setPrice.dto';
import { CommonService } from 'src/main/service-request/services/common.service';
import { ApiResponse } from 'src/common/types/apiResponse';

@Injectable()
export class MainService {
    constructor(
        private readonly db: DbService,
        private readonly commonService: CommonService
    ) {}

    public async setPrice({
        id,
        price
    }:SetPriceDto):Promise<ApiResponse<any>> {
        const isExist = await this.commonService.findServiceRequest({id})
        if (!isExist) {
            throw new BadRequestException('Service request not found')
        }
       const data = await this.db.serviceRequest.updateMany({
          where:{
            id
          },
          data:{
            basePrice: price
          }
        })
        return {
            data,
            message: 'Price set successfully',
            success: true
        }
    }
}
