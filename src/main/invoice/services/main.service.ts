import { Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';
import { CommonService } from './common.service';
import { IdStrategy } from '../dto/invoiceId.dto';
import { CreateInvoiceDto } from '../dto/createInvoice.dto';
import { ApiResponse } from 'src/common/types/apiResponse';
import { IdDto } from 'src/common/dto/id.dto';

@Injectable()
export class MainService {
  constructor(
    private readonly db: DbService,
    private readonly commonService: CommonService,
  ) {}

  async createInvoice({
  serviceRequestId,
  clientId,
  workerId,
}: CreateInvoiceDto): Promise<ApiResponse<any>> {
  // Fetch the service request with tasks
  const serviceRequest = await this.db.serviceRequest.findUnique({
    where: { id: serviceRequestId },
    include: { tasks: true },
  });

  const companyInfo = await this.db.companyDetails.findFirst();
  if (!companyInfo) {
    throw new NotFoundException('Company info not found');
  }

  const bankInfo = await this.db.bankInfo.findFirst();
  if (!bankInfo) {
    throw new NotFoundException('Bank info not found');
  }

  if (!serviceRequest) {
    throw new NotFoundException('Service Request not found');
  }

  const base = serviceRequest.basePrice ?? 0;
  const taskTotal = serviceRequest.tasks.reduce(
    (sum, task) => sum + task.price,
    0,
  );
  const totalAmount = base + taskTotal;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);

  const invoice = await this.db.invoice.create({
    data: {
      invoiceNumber: this.commonService.generateId({
        strategy: IdStrategy.TIMESTAMP,
      }),
      serviceRequest: {
        connect: {
          id: serviceRequestId,
        },
      },
      ClientProfile: {
        connect: {
          id: clientId,
        },
      },
      WorkerProfile: {
        connect: {
          id: workerId,
        },
      },
      BankInfo: {
        connect: {
          id: bankInfo.id,
        },
      },
      duaDate: dueDate,
      totalAmount,
    },
    include: {
      BankInfo: true,
      ClientProfile: {
        include: {
          User: true,
        },
      },
      WorkerProfile: {
        include: {
          User: true,
        },
      },
      serviceRequest: {
        include: {
          tasks: true,
        },
      },
    },
  });

  return {
    data: {
      clientInfo: {
        name: invoice?.ClientProfile?.User?.name,
        email: invoice?.ClientProfile?.User?.email,
        phone: invoice?.ClientProfile?.User?.phone,
        location: invoice?.ClientProfile?.location,
        postalCode: invoice?.serviceRequest?.postalCode,
      },
      workerInfo: {
        name: invoice?.WorkerProfile?.User?.name,
        email: invoice?.WorkerProfile?.User?.email,
        phone: invoice?.WorkerProfile?.User?.phone,
      },
      companyInfo,
      serviceDetail: [
        {
          taskName: invoice?.serviceRequest?.name,
          taskPrice: invoice?.serviceRequest?.basePrice,
        },
        ...(invoice?.serviceRequest?.tasks || []).map((task) => ({
          taskName: task.name,
          taskPrice: task.price,
        })),
      ],
      serviceRequestDetails: {
        locationDescription: invoice?.serviceRequest?.locationDescription,
        paymentType: invoice?.serviceRequest?.paymentType,
        postalCode: invoice?.serviceRequest?.postalCode,
        preferredDate: invoice?.serviceRequest?.preferredDate,
        preferredTime: invoice?.serviceRequest?.preferredTime,
        problemDescription: invoice?.serviceRequest?.problemDescription,
        phoneNumber: invoice?.serviceRequest?.phoneNumber,
        updatedAt: invoice?.serviceRequest?.updatedAt,
        finishedAt: invoice?.serviceRequest?.updatedAt ?? null,
      },
      bankInfo: {
        bankName: invoice?.BankInfo?.bankName,
        IBAN: invoice?.BankInfo?.IBAN,
        BIC_or_SWIFT: invoice?.BankInfo?.BIC_or_SWIFT,
      },
      invoiceNumber: invoice.invoiceNumber,
    },
    message: 'Invoice created successfully',
    success: true,
  };
}

  public async getInvoiceById(id: IdDto): Promise<ApiResponse<any>> {
  const invoice = await this.db.invoice.findUnique({
    where: id,
    include: {
      BankInfo: true,
      ClientProfile: {
        include: {
          User: true,
        },
      },
      WorkerProfile: {
        include: {
          User: true,
        },
      },
      serviceRequest: {
        include: {
          tasks: true,
        },
      },
    },
  });

  if (!invoice) {
    throw new NotFoundException('Invoice not found');
  }

  const companyDetails = await this.db.companyDetails.findFirst();

  return {
    data: {
      clientInfo: {
        name: invoice?.ClientProfile?.User?.name,
        email: invoice?.ClientProfile?.User?.email,
        phone: invoice?.ClientProfile?.User?.phone,
        location: invoice?.ClientProfile?.location,
        postalCode: invoice?.serviceRequest?.postalCode,
      },
      workerInfo: {
        name: invoice?.WorkerProfile?.User?.name,
        email: invoice?.WorkerProfile?.User?.email,
        phone: invoice?.WorkerProfile?.User?.phone,
      },
      companyInfo: companyDetails,
      serviceDetail: [
        {
          taskName: invoice?.serviceRequest?.name,
          taskPrice: invoice?.serviceRequest?.basePrice,
        },
        ...(invoice?.serviceRequest?.tasks || []).map((task) => ({
          taskName: task.name,
          taskPrice: task.price,
        })),
      ],
      serviceRequestDetails: {
        locationDescription: invoice?.serviceRequest?.locationDescription,
        paymentType: invoice?.serviceRequest?.paymentType,
        postalCode: invoice?.serviceRequest?.postalCode,
        preferredDate: invoice?.serviceRequest?.preferredDate,
        preferredTime: invoice?.serviceRequest?.preferredTime,
        problemDescription: invoice?.serviceRequest?.problemDescription,
        phoneNumber: invoice?.serviceRequest?.phoneNumber,
        updatedAt: invoice?.serviceRequest?.updatedAt,
        finishedAt: invoice?.serviceRequest?.updatedAt ?? null, // optional, depending on schema
      },
      bankInfo: {
        bankName: invoice?.BankInfo?.bankName,
        IBAN: invoice?.BankInfo?.IBAN,
        BIC_or_SWIFT: invoice?.BankInfo?.BIC_or_SWIFT,
      },
      invoiceNumber: invoice.invoiceNumber,
    },
    message: 'Invoice fetched successfully',
    success: true,
  };
}
}
