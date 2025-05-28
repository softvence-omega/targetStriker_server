import { Injectable } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';
import { FileService } from 'src/utils/file/file.service';

@Injectable()
export class MainService {
  constructor(
    private readonly db: DbService,
    private readonly file: FileService,
  ) {}

  createServiceRequest() {}
}
