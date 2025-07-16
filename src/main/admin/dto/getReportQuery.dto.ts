// src/report/dto/get-report-analyses.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsIn } from 'class-validator';

export class GetReportAnalysesDto {
  @ApiPropertyOptional({
    description: 'Specify the month filter for the report',
    enum: ['lastMonth', 'thisMonth'],
    example: 'thisMonth',
  })
  @IsOptional()
  @IsIn(['lastMonth', 'thisMonth'])
  query?: 'lastMonth' | 'thisMonth';
}