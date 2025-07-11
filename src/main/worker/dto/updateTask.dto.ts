import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class UpdateTaskDto {
  @ApiProperty({
    example: 'bfc9b9a3-2f49-4d02-8b76-123456789abc',
    description: 'UUID of the related ServiceRequest',
  })
  @IsString()
  serviceRequestId: string;
  @ApiProperty({
    example: 'fafadfaa-asdf-4d02-8b76-123456789abc',
    description: 'UUID of the Task to be updated',
  })
  @IsString()
  taskId: string;
  @ApiProperty({
    example: true,
    description: 'Indicates whether the task is done or not',
  })
  @IsBoolean()
  done: boolean;
}
