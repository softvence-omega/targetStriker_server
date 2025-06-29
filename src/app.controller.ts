import { Controller, Get, Head } from '@nestjs/common';
import { AppService } from './app.service';
import { CacheService } from './utils/cache/cache.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly cacheManager: CacheService
  ) {}

  @Get()
  async getHello() {
    return this.cacheManager.getAllUsersConnectionInfo();
  }

  @Head()
  handleHead(): void {
    // Responds with 200 OK and no body
  }
}
