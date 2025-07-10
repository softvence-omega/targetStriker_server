import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangeAdminPassChangeDto {
  @ApiProperty({
    description: 'Admin Current Password',
    example: 'StrongPassword123!',
  })
  @IsString()
  @MinLength(6)
  password: string;
  @ApiProperty({
    description: 'Admin Set New Password',
    example: 'NewPassword123!',
  })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
