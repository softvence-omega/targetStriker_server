import { Request } from 'express';
import { $Enums } from 'generated/prisma';

export interface AuthenticatedRequest extends Request {
  user: {
    [x: string]: any;
    id: string;
    sub: string;
    email: string;
    roles: $Enums.UserType;
    isVerified: boolean;
    profileId?: string;
  };
}
