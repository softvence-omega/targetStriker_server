import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';

@Injectable()
export class TaskTypeService implements OnModuleInit {
  private logger = new Logger(TaskTypeService.name)
  
  constructor(private readonly db: DbService) {}

  private async seed() {
    const data = [
      { name: 'SCHIMMEL_INSPECTIE' },
      { name: 'HUURWONING_INSPECTIE' },
      { name: 'VOCHT_CONTROLE' },
      { name: 'STUC_REPARATIE' },
      { name: 'SCHILDER_WERK' },
      { name: 'NICOTINE_REINIGING' },
      { name: 'NOOD_INTERVENTIE' }
    ];

    await this.db.taskType.createMany({
      data,
      skipDuplicates: true
    });

    this.logger.log(`Seeded ${data.length} TaskType records`);
  }

  async onModuleInit() {
    await this.seed();
  }
}