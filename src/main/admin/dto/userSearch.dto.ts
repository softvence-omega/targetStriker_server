import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UserSearchQueryDto {
  @ApiPropertyOptional({ description: 'Search by email' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Search by name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Search by location (client or worker)' })
  @IsOptional()
  @IsString()
  location?: string;
}