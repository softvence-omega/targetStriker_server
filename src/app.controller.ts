import { Controller, Get, Head } from '@nestjs/common';
import { CacheService } from './utils/cache/cache.service';

@Controller()
export class AppController {
  constructor(
    private readonly cacheManager: CacheService,
  ) {}

  // Root GET route for health checks and default route
  @Get()
  getRoot() {
    return { status: 'ok', message: 'API is running' };
  }

  // Your original method moved to a dedicated route to avoid conflict with root GET
  @Get('users-connection')
  async getAllUsersConnectionInfo() {
    return this.cacheManager.getAllUsersConnectionInfo();
  }

  // HEAD handler for root, responds with 200 and no body
  @Head()
  handleHead(): void {}
}
