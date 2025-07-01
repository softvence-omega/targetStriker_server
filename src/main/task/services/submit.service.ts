import { Injectable } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';
import { SubmitDto } from 'src/main/task/dto/submit.dto';
import { FileService } from 'src/utils/file/file.service';
import { FileInstance } from 'generated/prisma';
import { IdDto } from 'src/common/dto/id.dto';
import { ApiResponse } from 'src/common/types/apiResponse';

@Injectable()
export class SubmitService {
  constructor(
    private readonly db: DbService,
    private readonly file: FileService,
  ) {}

  public async submit(
    submitDto: SubmitDto,
    { id }: IdDto,
  ): Promise<ApiResponse<any>> {
    const { signature } = submitDto;

    let fileInstance: FileInstance | null = null;

    if (signature)
      fileInstance = await this.file.processUploadedFile(signature);

    const taskSubmission = await this.db.serviceRequest.update({
      where: { id },
      data: {
        rating: submitDto.rating,
        review: submitDto.review,
        ...(fileInstance && {
          signature: { connect: { id: fileInstance.id } },
        }),
      },
      include:{
        tasks: {
          select: {
            name: true,
          }
        },
        signature:{
          select: {
            url: true
          }
        },

      }
    });

    return {
      data: taskSubmission,
      message: 'Task submitted successfully',
      success: true,
    };
  }
}
