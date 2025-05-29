import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { TaskType } from 'generated/prisma';

export class CreateWorkerProfileDto {
  @ApiProperty({ description: 'representing the location' })
  @IsString()
  location: string; // You can use Record<string, any> if you want better typing

  @ApiProperty({ description: 'Unique username of the user' })
  @IsString()
  userName: string;

  @ApiProperty({
    description: 'Avatar image for the event preference',
    type: 'string',
    format: 'binary',
  })
  profilePic: Express.Multer.File;

  @ApiProperty({ description: 'Unique workerId of the user' })
  @IsString()
  workerId: string;

  @ApiProperty({
    description: 'Type of task/service being requested',
    enum: TaskType,
    example: TaskType.SCHIMMEL_INSPECTIES_BEHANDELINGEN,
    enumName: 'TaskType',
  })
  @IsEnum(TaskType)
  taskType: TaskType;
}
