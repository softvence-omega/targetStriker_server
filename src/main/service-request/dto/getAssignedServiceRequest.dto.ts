import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString } from "class-validator";
import { PaginationDto } from "src/common/dto/pagination.dto";

export class GetAssignedServiceRequestDto extends PaginationDto {
    
    @ApiPropertyOptional({
        description: 'Date for filtering service requests',
        example: '2024-12-25T10:00:00Z',
        type: String,
        format: 'date-time',
      })
      @IsDateString()
      date?: string;
    
}