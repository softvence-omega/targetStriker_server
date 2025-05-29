import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString } from "class-validator";
import { PaginationDto } from "src/common/dto/pagination.dto";

export class GetAssignedServiceRequestDto extends PaginationDto {
    
}