import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { $Enums } from "generated/prisma";
import { PaginationDto } from "src/common/dto/pagination.dto";

export class ViewAllDto extends PaginationDto{
    @ApiProperty(
        {
            enum: $Enums.RequestStatus,
            default: $Enums.RequestStatus.PENDING,
            description: 'Status of the Service Request'
        }
    )
    @IsEnum($Enums.RequestStatus)
    taskType: $Enums.RequestStatus
}