import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { $Enums } from 'generated/prisma';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class FilterTaskDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search keyword' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Search keyword' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'UUID of the task type' })
  @IsOptional()
  @IsUUID('4', { message: 'ID must be a valid UUID (version 4).' })
  taskTypeId?: string;

  @ApiPropertyOptional({
    enum: $Enums.RequestStatus,
    description: 'Filter tasks by request status',
  })
  @IsOptional()
  @IsEnum($Enums.RequestStatus, {
    message: `Status must be one of: ${Object.values($Enums.RequestStatus).join(', ')}`,
  })
  status?: $Enums.RequestStatus;
}
