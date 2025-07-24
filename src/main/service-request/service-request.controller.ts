import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/guard/role.guard';
import { MainService } from './services/main.service';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileType, MulterService } from 'src/utils/lib/multer.service';
import { CreateServiceRequestDTO } from './dto/serviceRequest.sto';
import { AuthenticatedRequest } from 'src/common/types/AuthenticatedRequest';
import { Roles } from 'src/decorator/roles.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CommonService } from './services/common.service';
import { IdDto } from 'src/common/dto/id.dto';
import { AssignTaskService } from './services/assign-task.service';
import { AssignTaskDto } from './dto/assignTask.dto';
import { GetAssignedServiceRequestDto } from './dto/getAssignedServiceRequest.dto';
import { ViewAllDto } from './dto/viewAll.dot';

@Controller('service-request')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class ServiceRequestController {
  constructor(
    private readonly mainService: MainService,
    private readonly commonService: CommonService,
    private readonly assignTaskService: AssignTaskService,
  ) {}

  @ApiTags('Client')
  @Patch('cancel/:id')
  @Roles("CLIENT")
  async cancleServiceRequest (@Param() id:IdDto,@Req() req:AuthenticatedRequest){
    return await this.mainService.cancelServiceRequest(id,req.user.profileId)
  }

  @ApiTags('Client', 'Admin', 'Worker')
  @Post('create')
  @Roles('CLIENT','ADMIN', 'WORKER')
  @ApiConsumes('multipart/form-data')
   @UseInterceptors(
    FileInterceptor(
      'reqPhoto',
      new MulterService().createMulterOptions('./temp', 'temp', FileType.IMAGE),
    ),
  )
  create(
    @UploadedFile() reqPhoto: Express.Multer.File,
    @Body() body: CreateServiceRequestDTO,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!req.user.profileId) {
      throw new BadRequestException('Profile not Created');
    }

    // Validate file upload
    if (!reqPhoto) {
      throw new BadRequestException('reqPhoto is required');
    }

    body.reqPhoto = reqPhoto;

    return this.mainService.createServiceRequest(body, {
      id: req.user.profileId,
    });
  }

  @ApiTags('Admin')
  @Get('list')
  @Roles('ADMIN')
  list(@Query() rawDate: PaginationDto) {
    return this.commonService.getServiceRequestList(rawDate);
  }

  @Get('get/:id')
  get(@Param() id: IdDto) {
    return this.commonService.findServiceRequest(id);
  }

  @ApiTags('Admin')
  @Post('assign-task')
  @Roles('ADMIN')
  assignTask(@Body() body: AssignTaskDto) {
    return this.assignTaskService.assignTask(body);
  }

  @Get('get-assign-service-request')
  @Roles('WORKER')
  @ApiTags('Worker')
  getAssignedServiceRequest(
    @Req() Req: AuthenticatedRequest,
    @Query() rawData: GetAssignedServiceRequestDto,
  ) {
    if (!Req.user.profileId) {
      throw new BadRequestException('Profile not Created');
    }
    return this.assignTaskService.getAssignedServiceRequest(
      { id: Req.user.profileId },
      rawData,
    );
  }

  @ApiTags('Client')
  @Get('get-my-service-request')
  @Roles('CLIENT')
  @ApiTags('Client')
  getRequest(
    @Req() Req: AuthenticatedRequest,
    @Query() rawData: GetAssignedServiceRequestDto,
  ) {
    if (!Req.user.profileId) {
      throw new BadRequestException('Profile not Created');
    }
    return this.commonService.getMyServiceRequest(
      { id: Req.user.profileId },
      rawData,
    );
  }

  @ApiTags('Client')
  @Get('get-client-service-request-overview')
  @Roles('CLIENT')
  @ApiTags('Client')
  getServiceRequestOverview(@Req() Req: AuthenticatedRequest) {
    if (!Req.user.profileId) {
      throw new BadRequestException('Profile not Created');
    }
    return this.commonService.getMyRequestOverview({ id: Req.user.profileId });
  }

  @Get('get-worker-service-request-overview')
  @Roles('WORKER')
  @ApiTags('Worker')
  getWorkerServiceRequestOverview(@Req() Req: AuthenticatedRequest) {
    if (!Req.user.profileId) {
      throw new BadRequestException('Profile not Created');
    }
    return this.commonService.getMyRequestOverviewByWorker({
      id: Req.user.profileId,
    });
  }

  @Get('get-all-client-service-request')
  @Roles('CLIENT',)
  @ApiTags('Client')
  getClientServiceRequestOverview(
    @Req() Req: AuthenticatedRequest,
    @Query() data: ViewAllDto,
  ) {
    if (!Req.user.profileId) {
      throw new BadRequestException('Profile not Created');
    }
    return this.commonService.getViewServiceRequest(
      { id: Req.user.profileId },
      data,
    );
  }

  @Post('confirm-service-request/:id')
  @Roles('CLIENT')
  @ApiTags('Client')
  @ApiOperation({ summary: 'Confirm Service Request' })
  confirmServiceRequest(@Req() req: AuthenticatedRequest, @Param() id: IdDto) {
    if (!req.user.profileId) {
      throw new BadRequestException('Profile not Created');
    }
    return this.assignTaskService.confirmServiceRequest(
      { id: req.user.profileId },
      id.id,
    );
  }
}
