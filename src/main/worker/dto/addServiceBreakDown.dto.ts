// src/task/dto/create-task.dto.ts
import { IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddServicePriceBreakDownServiceDto {
  @ApiProperty({
    example: 'Cleaning Service',
    description: 'Name of the service',
  })
  @IsString()
  serviceName: string;

  @ApiProperty({
    example: 150,
    description:
      'Price of the task in integer format (e.g., cents or whole units)',
  })
  @IsInt()
  servicePrice: number;

  @ApiProperty({
    example: 'bfc9b9a3-2f49-4d02-8b76-123456789abc',
    description: 'UUID of the related ServiceRequest',
  })
  @IsString()
  serviceRequestId: string;
}
