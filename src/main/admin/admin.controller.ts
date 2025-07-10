import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorator/roles.decorator';
import { HomeDataService } from './services/home-data.service';
import { TaskManagementService } from './services/task-management.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { EmployeeService } from './services/employee.service';
import { FilterWorkerDto } from './dto/filterWroker.dto';
import { WorkerDetailsService } from './services/worker-details.service';
import { IdDto } from 'src/common/dto/id.dto';
import { WorkerAssignedTaskDto } from './dto/workerAssignedTask.dto';
import { ReportAnalysesService } from './services/report-analyses.service';
import { FilterTaskDto } from './dto/filtertask.dto';
import { TaskOverviewService } from './services/task-overview.service';
import { CommonService } from './services/common.service';
import { EmployeeManagementService } from './services/employee-management.service';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(AuthGuard('jwt'))
@Roles('ADMIN')
@ApiBearerAuth()
export class AdminController {
  constructor(
    private readonly homeDataService: HomeDataService,
    private readonly taskManagementService: TaskManagementService,
    private readonly employeeService: EmployeeService,
    private readonly workerDetailsService: WorkerDetailsService,
    private readonly reportAnalysesService: ReportAnalysesService,
    private readonly taskOverviewService: TaskOverviewService,
    private readonly commonService: CommonService,
    private readonly employeeManagementService: EmployeeManagementService,
  ) {}

  @Get('home-data')
  async getHomeData() {
    return await this.homeDataService.getHomeData();
  }

  @Get('task-management/get-tasks')
  async getServiceRequestsWithStatusLabel(
    @Query() PaginationDto: FilterTaskDto,
  ) {
    return await this.taskManagementService.getServiceRequestsWithStatusLabel(
    {
      skip: PaginationDto.skip,
      take: PaginationDto.take
    },
    {
      location: PaginationDto.location,
      taskTypeId: PaginationDto.taskTypeId,
      status: PaginationDto.status,
      search: PaginationDto.search
    }
    );
  }

  @Get('employees')
  async getEmployees(@Query() PaginationDto: FilterWorkerDto) {
    return await this.employeeService.getAllWorkerProfiles(PaginationDto);
  }

  @Get('employee-overview')
  async getEmployeeManagement() {
    return await this.employeeManagementService.getEmployeeOverview();
  }

  @Get('worker-details')
  async getWorkerDetails(@Query() id: IdDto) {
    return await this.workerDetailsService.getWorkerDetails(id);
  }

  @Get('report-analyses')
  async getReportAnalyses() {
    return await this.reportAnalysesService.getReport();
  }

  @Get('task-overview')
  async getTaskOverview() {
    return await this.taskOverviewService.getTaskOverview();
  }

  @Get("all-tasks")
  async getAllTasks() {
    return await this.commonService.getAllWithCustomStatus();
  }

}
