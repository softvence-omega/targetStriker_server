import {
  Body,
  Controller,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { IdDto } from 'src/common/dto/id.dto';
import { Roles } from 'src/decorator/roles.decorator';
import { RolesGuard } from 'src/guard/role.guard';
import { CommonService } from './services/common.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileType, MulterService } from 'src/utils/lib/multer.service';
import { SubmitDto } from './dto/submit.dto';
import { SubmitService } from './services/submit.service';

@Controller('task')
@ApiBearerAuth()
export class TaskController {
  constructor(
    private readonly commonService: CommonService,
    private readonly submitService: SubmitService
) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('CLIENT')
  @Post('details')
  getTasks(@Query() id: IdDto) {
    return this.commonService.getTaskDetails(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('CLIENT')
  @Post('submit')
  @UseInterceptors(
    FileInterceptor(
      'signature',
      new MulterService().createMulterOptions('./temp', 'temp', FileType.ANY),
    ),
  )
  submit(@UploadedFile() signature: Express.Multer.File, @Body() body: SubmitDto, @Query() id: IdDto) {
    const submitDto:SubmitDto = { 
      rating: body.rating,
      review: body.review,
      signature
     };
    return this.submitService.submit(submitDto, id);
  }
}
