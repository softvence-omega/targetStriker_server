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
  const { signature, rating, review } = submitDto;

  let fileInstance: FileInstance | null = null;

  if (signature) {
    fileInstance = await this.file.processUploadedFile(signature);
  }

  // Find the service request to get related client and worker
  const serviceRequest = await this.db.serviceRequest.findUnique({
    where: { id },
    select: {
      id: true,
      clientProfileId: true,
      workerProfileId: true,
    },
  });

  if (!serviceRequest) {
    throw new Error('Service Request not found');
  }

  // Update ServiceRequest
  const taskSubmission = await this.db.serviceRequest.update({
    where: { id },
    data: {
      rating,
      review,
      ...(fileInstance && {
        signature: { connect: { id: fileInstance.id } },
      }),
    },
    include: {
      tasks: { select: { name: true } },
      signature: { select: { url: true } },
    },
  });

  // Create Review entry in Reviews table
  await this.db.reviews.create({
    data: {
      rating,
      review,
      serviceRequestId: id,
      clientProfileId: serviceRequest.clientProfileId ?? undefined,
      workerProfileId: serviceRequest.workerProfileId ?? undefined,
    },
  });

  return {
    data: taskSubmission,
    message: 'Task submitted and review saved successfully',
    success: true,
  };
}
}
