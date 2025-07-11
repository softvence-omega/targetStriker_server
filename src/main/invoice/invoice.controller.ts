import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MainService } from 'src/main/invoice/services/main.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateInvoiceDto } from 'src/main/invoice/dto/createInvoice.dto';
import { IdDto } from 'src/common/dto/id.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetInvoiceOverviewService } from 'src/main/invoice/services/get-invoice-overview.service';
import { Roles } from 'src/decorator/roles.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { InvoiceStatusDto } from './dto/invoiceStatus.dto';
import { ChangeInvoiceStatusService } from './services/change-invoice-status.service';

@Controller('invoice')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class InvoiceController {
  constructor(
    private readonly mainService: MainService,
    private readonly getInvoiceOverviewService: GetInvoiceOverviewService,
    private readonly changeInvoiceStatusService: ChangeInvoiceStatusService,
  ) {}

  @Post('create')
  async createInvoice(@Body() body: CreateInvoiceDto) {
    return this.mainService.createInvoice(body);
  }

  @Get('get/:id')
  async getInvoiceById(@Param() id: IdDto) {
    return this.mainService.getInvoiceById(id);
  }

  @ApiTags('Admin')
  @Get('get-overview')
  @Roles('ADMIN')
  async getInvoiceOverview(@Query() pagination: PaginationDto) {
    return this.getInvoiceOverviewService.getInvoicesOverviewWithPagination(
      pagination,
    );
  }

  @ApiTags('Admin')
  @Patch('change-status')
  async changeInvoiceStatus(@Body() rawData: InvoiceStatusDto) {
    return this.changeInvoiceStatusService.changeInvoiceStatus(rawData);
  }
}
