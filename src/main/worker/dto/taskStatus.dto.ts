import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

  export class CompletedTaskDto {
    @ApiProperty({
    example: 'bfc9b9a3-2f49-4d02-8b76-123456789abc',
    description: 'UUID of the related ServiceRequest',
  })
  @IsString()
  id: string;
  }

  export class CompletedTaskNoteDto {
    @ApiProperty({
      description: 'Optional note for the completed task',
      example: 'Task completed successfully',
    })
    @IsOptional()
    @IsString()
    note?: string;
  }