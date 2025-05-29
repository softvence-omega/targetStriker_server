import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
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
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
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

@Controller('service-request')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class ServiceRequestController {
  constructor(
    private readonly mainService: MainService,
    private readonly commonService: CommonService,
    private readonly assignTaskService: AssignTaskService
  ) {}

  @Post('create')
  @Roles("CLIENT")
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

  @Get('list')
  @Roles("ADMIN")
  list(@Query() rawDate: PaginationDto) {
   return this.commonService.getServiceRequestList(rawDate)
  }

  @Get('get/:id')
  get(@Param() id: IdDto) {
    return this.commonService.findServiceRequest(id)
  }

  @Post("assign-task")
  @Roles("ADMIN")
  assignTask(@Body() body: AssignTaskDto) {
    return this.assignTaskService.assignTask(body)
  }

  @Get("get-assign-service-request")
  @Roles("WORKER")
  getAssignedServiceRequest(
    @Req() Req: AuthenticatedRequest, 
    @Query() pagination: PaginationDto,
  ) {
    if (!Req.user.profileId) {
      throw new BadRequestException('Profile not Created');
      
    }
    return this.assignTaskService.getAssignedServiceRequest({id: Req.user.profileId}, pagination)
  }
}
