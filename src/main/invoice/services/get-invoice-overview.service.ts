import { Injectable } from '@nestjs/common';
import { InvoiceStatus } from 'generated/prisma';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ApiResponse } from 'src/common/types/apiResponse';
import { DbService } from 'src/utils/db/db.service';

@Injectable()
export class GetInvoiceOverviewService {
  constructor(private readonly db: DbService) {}

  async getInvoiceOverview() {
    const now = new Date();

    // Total amount received
    const totalReceived = await this.db.invoice.aggregate({
      _sum: { totalAmount: true },
      where: { invoiceStatus: InvoiceStatus.CONFIRMED },
    });

    // Pending payments
    const pendingAmount = await this.db.invoice.aggregate({
      _sum: { totalAmount: true },
      where: {
        invoiceStatus: InvoiceStatus.IN_PROGRESS,
        duaDate: { gt: now },
      },
    });

    // Late payments
    const latePayments = await this.db.invoice.aggregate({
      _sum: { totalAmount: true },
      where: {
        invoiceStatus: InvoiceStatus.IN_PROGRESS,
        duaDate: { lt: now },
      },
    });

    // Count of confirmed invoices
    const confirmedCount = await this.db.invoice.count({
      where: { invoiceStatus: InvoiceStatus.CONFIRMED },
    });

    return {
      totalAmountReceived: totalReceived._sum.totalAmount ?? 0,
      pendingPayments: pendingAmount._sum.totalAmount ?? 0,
      latePayments: latePayments._sum.totalAmount ?? 0,
      confirmedInvoicesCount: confirmedCount,
    };
  }

  private async getAllInvoices({ skip, take }: PaginationDto) {
    return await this.db.invoice.findMany({
      take,
      skip,
      orderBy: {
        duaDate: 'asc',
      },
      include: {
        ClientProfile: {
          select: {
            User: {
              select: {
                name: true,
              },
            },
          },
        },
        WorkerProfile: true,
        serviceRequest: {
          select: {
            TaskType: {
              select: {
                name: true,
              },
            },
            status:true,
          },
        },
      },
    });
  }

  public async getInvoicesOverviewWithPagination(
    pagination: PaginationDto,
  ): Promise<ApiResponse<any>> {
    const totalInvoices = await this.getInvoiceOverview();
    const invoices = await this.getAllInvoices(pagination);

    return {
      data: {
        totalInvoices,
        invoices,
      },
      message: 'Invoices fetched successfully',
      success: true,
    };
  }
}
