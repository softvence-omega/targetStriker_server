import { Global, Module } from '@nestjs/common';
import { LibService } from './lib/lib.service';
import { EmailService } from './email/email.service';
import { DbService } from './db/db.service';
import { FileService } from './file/file.service';
import { FileController } from './file/file.controller';
import { CacheService } from './cache/cache.service';
import { EventService } from './event/event.service';
import { MulterService } from './lib/multer.service';


@Global()
@Module({
  providers: [LibService, EmailService, DbService, FileService, CacheService, EventService, MulterService],
  exports:[LibService, EmailService, DbService, FileService, CacheService, EventService],
  controllers: [FileController]
})
export class UtilsModule {}
