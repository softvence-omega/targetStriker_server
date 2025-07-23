import { Injectable } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';
import { AddServicePriceBreakDownServiceDto } from '../dto/addServiceBreakDown.dto';

@Injectable()
export class AddServicePriceBreakDownService {
    constructor(private readonly dbService: DbService){}

    async addServicePriceBreakDown(dto: AddServicePriceBreakDownServiceDto) {
        const serviceRequest = await this.dbService.serviceRequest.findUnique({
            where: { id: dto.serviceRequestId },
        });

        if (!serviceRequest) {
            throw new Error('Service request not found');
        }

        const serviceDetails = await this.dbService.serviceDetails.create({
            data: dto,
        });

        await this.dbService.serviceRequest.update({
            where: { id: dto.serviceRequestId },
            data: {
                serviceDetails: {
                    connect: { id: serviceDetails.id },
                },
                basePrice: {
                    increment: dto.servicePrice
                }
            },
        });

        return serviceDetails;
    }
}
