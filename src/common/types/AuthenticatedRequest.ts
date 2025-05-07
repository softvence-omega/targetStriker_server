import { Request } from 'express';
import { $Enums } from 'generated/prisma';

export interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    email: string;
    roles: $Enums.UserType;
    isVerified: boolean;
    profileId?: string;
  };
}