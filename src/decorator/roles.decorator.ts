import { SetMetadata } from '@nestjs/common';
import { $Enums } from 'generated/prisma';

export const Roles = (...roles: $Enums.UserType[]) => 
  SetMetadata('roles', roles);