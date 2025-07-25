import { BadRequestException, Body, Controller, Get, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorator/roles.decorator';
import { HomeDataService } from './services/home-data.service';
import { TaskManagementService } from './services/task-management.service';
import { EmployeeService } from './services/employee.service';
import { FilterWorkerDto } from './dto/filterWroker.dto';
import { WorkerDetailsService } from './services/worker-details.service';
import { IdDto } from 'src/common/dto/id.dto';
import { ReportAnalysesService } from './services/report-analyses.service';
import { FilterTaskDto } from './dto/filtertask.dto';
import { TaskOverviewService } from './services/task-overview.service';
import { CommonService } from './services/common.service';
import { EmployeeManagementService } from './services/employee-management.service';
import { TaskRejectService } from './services/task-reject.service';
import { GetReportAnalysesDto } from './dto/getReportQuery.dto';
import { UserManagementService } from './services/user-management.service';
import { UserSearchQueryDto } from './dto/userSearch.dto';
import { CreateServiceRequestWithAssignDTO } from './dto/createServiceWithAssign.dto';
import { AuthenticatedRequest } from 'src/common/types/AuthenticatedRequest';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileType, MulterService } from 'src/utils/lib/multer.service';
import { ServiceRequestWithAssignService } from './services/service-request-with-assign.service';

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
    private readonly taskRejectService: TaskRejectService, // Assuming TaskRejectService is imported correctly
    private readonly userManagemetService: UserManagementService,
    private readonly serviceRequestWithAssignService: ServiceRequestWithAssignService,
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
        take: PaginationDto.take,
      },
      {
        location: PaginationDto.location,
        taskTypeId: PaginationDto.taskTypeId,
        status: PaginationDto.status,
        search: PaginationDto.search,
      },
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
  async getReportAnalyses(@Query() query: GetReportAnalysesDto) {
    return this.reportAnalysesService.getReport(query.query);
  }

  @Get('task-overview')
  async getTaskOverview() {
    return await this.taskOverviewService.getTaskOverview();
  }

  @Get('all-tasks')
  async getAllTasks() {
    return await this.commonService.getAllWithCustomStatus();
  }

  @Patch('reject-task')
  async rejectTask(@Query() id: IdDto) {
    return await this.taskRejectService.rejectTask(id.id);
  }

  @Get('all-user')
async getAllUser(@Query() query: UserSearchQueryDto) {
  return await this.userManagemetService.getAllUser(query);
}

  @Post('service-request/assign-task')
  @Roles('ADMIN')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
      FileInterceptor(
        'reqPhoto',
        new MulterService().createMulterOptions('./temp', 'temp', FileType.IMAGE),
      ),
    )
  async createServiceWithAssign(
      @UploadedFile() reqPhoto: Express.Multer.File,
      @Body() body: CreateServiceRequestWithAssignDTO,
      @Req() req: AuthenticatedRequest) { 
        if (!req.user.profileId) {
              throw new BadRequestException('Profile not Created');
            }
        
            // Validate file upload
            if (!reqPhoto) {
              throw new BadRequestException('reqPhoto is required');
            }
        
            body.reqPhoto = reqPhoto;
            return this.serviceRequestWithAssignService.createServiceWithAssign(body,{id:req.user.profileId});
  }
}
