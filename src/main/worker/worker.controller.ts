import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { MainService } from './services/main.service';
import { SetPriceDto } from './dto/setPrice.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/guard/role.guard';
import { Roles } from 'src/decorator/roles.decorator';

@Controller('worker')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles("WORKER")
export class WorkerController {
    constructor(
        private readonly mainService: MainService
    ) {}

    @Post('set-price')
    async setPrice(@Body() data: SetPriceDto) {
        return this.mainService.setPrice(data)
    }
}
