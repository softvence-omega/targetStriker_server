import { Injectable } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';
import { InvoiceStatusDto } from '../dto/invoiceStatus.dto';
import { ApiResponse } from 'src/common/types/apiResponse';

@Injectable()
export class ChangeInvoiceStatusService {
    constructor(
        private readonly db: DbService,
    ) {}

    public async changeInvoiceStatus(
       {
        id,
        status,
       }:InvoiceStatusDto
    ): Promise<ApiResponse<any>> {
        const updatedInvoice = await this.db.invoice.update({
            where: { id },
            data: { 
                invoiceStatus: status, // Assuming invoiceStatus is the field to update
             },
        });

        return {
            data: updatedInvoice,
            message: 'Invoice status updated successfully',
            success: true,
        };
    }
}
