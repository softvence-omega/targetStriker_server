import {
  Body,
  Controller,
  Get,
  Patch,
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
import { UpdateTaskService } from './services/update-task.service';
import { UpdateTaskDto } from './dto/updateTask.dto';
import { PaymentPendingService } from './services/payment-pending.service';
import { NonpriceSetTaskListService } from './services/nonprice-set-task-list.service';

@Controller('worker')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('WORKER')
export class WorkerController {
  constructor(
    private readonly mainService: MainService,
    private readonly getMyTasksService: MyTaskService, // Assuming MyTaskService is imported correctly
    private readonly addTaskService: AddTaskService, // Assuming AddTaskService is imported correctly
    private readonly updateTaskService: UpdateTaskService, // Assuming UpdateTaskService is imported correctly
    private readonly paymentPendingTask: PaymentPendingService,
    private readonly nonPriceTask: NonpriceSetTaskListService
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


  @Get('my-payment-pending')
  async getMyPaymentPendingTask(
    @Query() PaginationDto: FilterTaskDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.paymentPendingTask.getPaymentPendingTask(
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
      message: 'Payment Pending Task successfully',
      success: true,
    };
  }

  @Get('non-price-task')
  async getNonPriceTask(@Query() PaginationDto: FilterTaskDto,
    @Req() req: AuthenticatedRequest,){
      const result = await this.nonPriceTask.getNonPriceTask(
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
      message: 'Non Price Task successfully',
      success: true,
    };
    }

  @Post('add-task')
  async addTask(@Body() dto: AddTaskDto, @Req() req: AuthenticatedRequest) {
    const workerProfileId = req.user.profileId;
    const result = await this.addTaskService.addTask(dto, workerProfileId);
    return {
      data: result,
      message: 'Task Added successfully',
      success: true,
    };
  }

  @Patch('update-task')
  async updateTask(
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const workerProfileId = req.user.sub;
    const result = await this.updateTaskService.updateTask(
      updateTaskDto,
      workerProfileId,
    );
    return {
      data: result,
      message: 'Task updated successfully',
      success: true,
    };
  }
}
