import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';


@Injectable()
export class LibService {
    constructor(){}
    public hashPassword({
        password,
        round = 6
    }: {
        password: string,
        round?: number
    }): Promise<string> {
        return bcrypt.hash(password, round);
    }

    public comparePassword({
        hashedPassword,
        password
    }: {
        password: string,
        hashedPassword: string
    }): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }

    public formatRelativeDate(date: Date): string {
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHr = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHr / 24);

      if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
      if (diffHr > 0) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
      if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
      return 'just now';
    }

}
