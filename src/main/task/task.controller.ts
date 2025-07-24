import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { IdDto } from 'src/common/dto/id.dto';
import { Roles } from 'src/decorator/roles.decorator';
import { RolesGuard } from 'src/guard/role.guard';
import { CommonService } from './services/common.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileType, MulterService } from 'src/utils/lib/multer.service';
import { SubmitDto } from './dto/submit.dto';
import { SubmitService } from './services/submit.service';
import { ReportPhotosDto, TaskPhotoDto } from './dto/taskPhoto.dto';
import { TaskPhotoService } from './services/task-photo.service';
import { BooleanDto } from 'src/common/dto/boolean.dto';

@Controller('task')
@ApiBearerAuth()
export class TaskController {
  constructor(
    private readonly commonService: CommonService,
    private readonly submitService: SubmitService,
    private readonly taskPhotoService: TaskPhotoService,
  ) {}

  @ApiTags('Client')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('CLIENT','WORKER',"ADMIN")
  @Get('details')
  getTasks(@Query() id: IdDto) {
    return this.commonService.getTaskDetails(id);
  }

  @ApiTags('Client')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('CLIENT')
  @Post('submit')
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(
    FileInterceptor(
      'signature',
      new MulterService().createMulterOptions('./temp', 'temp', FileType.IMAGE),
    ),
  )
  submit(
    @UploadedFile() signature: Express.Multer.File,
    @Body() body: SubmitDto,
    @Query() id: IdDto,
  ) {
    const submitDto: SubmitDto = {
      rating: body.rating,
      review: body.review,
      signature,
    };
    return this.submitService.submit(submitDto, id);
  }

  @ApiTags('Worker')
  @UseGuards(AuthGuard('jwt'))
  @Post('taskPhoto-create/:id')
  @UseInterceptors(
    FileInterceptor(
      'pic',
      new MulterService().createMulterOptions('./temp', 'temp', FileType.IMAGE),
    ),
  )
  @ApiConsumes('multipart/form-data', 'application/json')
  uploadTaskPhoto(
    @UploadedFile() pic: Express.Multer.File,
    @Body() body: TaskPhotoDto,
    @Param() id: IdDto,
  ) {
    const taskPhotoDto: TaskPhotoDto = {
      pic,
      isPrev: body.isPrev,
      caption: body.caption,
    };
    return this.taskPhotoService.create(id, taskPhotoDto);
  }

  @ApiTags('Worker')
  @UseGuards(AuthGuard('jwt'))
  @Get('taskPhoto/:id')
  async getTaskPhotos(@Param() id: IdDto, @Query() isPrev: BooleanDto) {
    return await this.taskPhotoService.get(id, isPrev);
  }
}
