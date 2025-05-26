import { Global, Module } from '@nestjs/common';
import { LibService } from './lib/lib.service';
import { EmailService } from './email/email.service';
import { DbService } from './db/db.service';
import { FileService } from './file/file.service';
import { FileController } from './file/file.controller';
import { CacheService } from './cache/cache.service';


@Global()
@Module({
  providers: [LibService, EmailService, DbService, FileService, CacheService],
  exports:[LibService, EmailService, DbService, FileService, CacheService],
  controllers: [FileController]
})
export class UtilsModule {}
