import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MainService } from './services/main.service';
import { SetPriceDto } from './dto/setPrice.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/guard/role.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { AuthenticatedRequest } from 'src/common/types/AuthenticatedRequest';
import { MyTaskService } from './services/my-task.service';
import { FilterTaskDto } from '../admin/dto/filtertask.dto';
import { AddTaskDto } from './dto/addTask.dto';
import { AddTaskService } from './services/add-task.service';

@Controller('worker')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('WORKER')
export class WorkerController {
  constructor(
    private readonly mainService: MainService,
    private readonly getMyTasksService: MyTaskService, // Assuming MyTaskService is imported correctly
    private readonly addTaskService: AddTaskService, // Assuming AddTaskService is imported correctly
  ) {}

  @Post('set-price')
  async setPrice(@Body() data: SetPriceDto) {
    return this.mainService.setPrice(data);
  }

  @Get('my-tasks')
  async getMyTasks(
    @Query() PaginationDto: FilterTaskDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.getMyTasksService.getMyTask(
      {
        skip: PaginationDto.skip,
        take: PaginationDto.take,
      },
      {
        location: PaginationDto.location,
        taskTypeId: PaginationDto.taskTypeId,
        status: PaginationDto.status,
        search: PaginationDto.search,
      },
      req?.user?.profileId,
    );
    return {
      data: result,
      message: 'Service requests fetched successfully',
      success: true,
    };
  }
  @Post('add-task')
  async addTask(@Body() dto: AddTaskDto, @Req() req: AuthenticatedRequest) {
    const workerProfileId = req.user.profileId;
    return await this.addTaskService.addTask(dto, workerProfileId);
  }
}
