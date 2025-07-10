import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { $Enums, UserType } from 'generated/prisma';
import { EmailDto } from 'src/common/dto/email.dto';
import { IdDto } from 'src/common/dto/id.dto';
import { ApiResponse } from 'src/common/types/apiResponse';
import { DbService } from 'src/utils/db/db.service';

@Injectable()
export class CommonService {
  constructor(
    private readonly db: DbService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async getProfile(id: IdDto, profileType: UserType) {
    switch (profileType) {
      case UserType.ADMIN:
        return await this.db.adminProfile.findUnique({
          where: {
            id: id.id,
          },
        });
      case UserType.CLIENT:
        return await this.db.clientProfile.findUnique({
          where: {
            id: id.id,
          },
        });
      case UserType.WORKER:
        return await this.db.workerProfile.findUnique({
          where: {
            id: id.id,
          },
        });
    }
  }

  public async isUserExit(id: IdDto) {
    const data = await this.db.user.findUnique({
      where: {
        id: id.id,
      },
    });
    
    return data && this.db.exclude(data, ['password']);
  }

  public async isUserExistByEmail(email: EmailDto) {
    return await this.db.user.findUnique({
      where: {
        email: email.email,
      },
      include: {
        adminProfile:{
          include: {
            profilePic: {
              select: {
                url: true,
              },
            },
          },
        },
        clientProfile: {
          include:{
            profilePic:{
              select:{
                url: true
              }
            }
          }
        },
        workerProfile: {
          include:{
            profilePic:{
              select:{
                url: true
              }
            }
          }
        },
      },
    });
  }

  public async isUserExistByEmailOrPhone({
    email,
    phone,
  }: {
    email?: string;
    phone?: string;
  }) {
    return await this.db.user.findFirst({
      where: {
        OR: [
          {
            email: email,
          },
          {
            phone: phone,
          },
        ],
      },
    });
  }

  public async generateToken(user: {
    id: string;
    email: string;
    roles: $Enums.UserType;
    isVerified: boolean;
    profileId: string | null;
  }) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.roles,
      isVerified: user.isVerified,
      profileId: user.profileId,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow('JWT_SECRET'),
      expiresIn: '7d',
    });
  }

  public async deleteUser(id: IdDto):Promise<ApiResponse<any>> {
    const data = await this.db.user.deleteMany({
      where: {
        id: id.id,
      },
    });

    return  {
      data,
      message: 'User deleted successfully',
      success: true
    }
  }

  public checkProfileCreated(userType: UserType, profile: any): boolean {
    if (!profile) {
      return false;
    }

    switch (userType) {
      case 'CLIENT':
        // Check if essential client profile fields are present
        return !!(
          profile.location &&
          profile.userName
        );
      
      case 'WORKER':
        // Check if essential worker profile fields are present
        return !!(
          profile.location &&
          profile.userName &&
          profile.workerId &&
          profile.workerSpecialistId
        );
      
      case 'ADMIN':
        // Admin profile exists, so it's considered created
        return true;
      
      default:
        return false;
    }
  }
}
