import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { MainService } from './services/main.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateInvoiceDto } from './dto/createInvoice.dto';
import { IdDto } from 'src/common/dto/id.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('invoice')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class InvoiceController {
    constructor(
        private readonly mainService: MainService,
    ) {}

    @Post("create")
    async createInvoice(@Body() body: CreateInvoiceDto) {
        return this.mainService.createInvoice(body)
    }

    @Get("get/:id")
    async getInvoiceById(@Param() id: IdDto) {
        return this.mainService.getInvoiceById(id)
    }
}
