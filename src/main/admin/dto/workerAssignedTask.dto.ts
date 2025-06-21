import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class WorkerAssignedTaskDto extends PaginationDto {
  @ApiProperty({
    description: 'Unique identifier (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'ID must be a valid UUID (version 4).' })
  workerId: string;
}
