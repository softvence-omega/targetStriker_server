import { Global, Module } from '@nestjs/common';
import { LibService } from './lib/lib.service';
import { EmailService } from './email/email.service';
import { DbService } from './db/db.service';
import { FileService } from './file/file.service';
import { FileController } from './file/file.controller';


@Global()
@Module({
  providers: [LibService, EmailService, DbService, FileService],
  exports:[LibService, EmailService, DbService],
  controllers: [FileController]
})
export class UtilsModule {}
