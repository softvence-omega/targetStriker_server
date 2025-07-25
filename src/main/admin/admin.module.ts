import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { CommonService } from './services/common.service';
import { HomeDataService } from './services/home-data.service';
import { TaskManagementService } from './services/task-management.service';
import { EmployeeService } from './services/employee.service';
import { WorkerDetailsService } from './services/worker-details.service';
import { ReportAnalysesService } from './services/report-analyses.service';
import { TaskOverviewService } from './services/task-overview.service';
import { EmployeeManagementService } from './services/employee-management.service';
import { TaskRejectService } from './services/task-reject.service';
import { UserManagementService } from './services/user-management.service';
import { ServiceRequestWithAssignService } from './services/service-request-with-assign.service';

@Module({
  controllers: [AdminController],
  providers: [
    CommonService,
    HomeDataService,
    TaskManagementService,
    EmployeeService,
    WorkerDetailsService,
    ReportAnalysesService,
    TaskOverviewService,
    EmployeeManagementService,
    TaskRejectService,
    UserManagementService,
    ServiceRequestWithAssignService
  ],
})
export class AdminModule {}
