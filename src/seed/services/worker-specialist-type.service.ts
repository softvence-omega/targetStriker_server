import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { DbService } from 'src/utils/db/db.service';

@Injectable()
export class WorkerSpecialistTypeService implements OnModuleInit {
  private logger = new Logger(WorkerSpecialistTypeService.name);

  constructor(private readonly db: DbService) {}

  private async seed() {
    const data: Prisma.WorkerSpecialistCreateManyInput[] = [
      { name: 'SCHIMMEL_INSPECTIES_BEHANDELINGEN' },
      { name: 'INSPECTIES_HUURWONINGEN_NAZORG' },
      { name: 'VOCHTBEHEERSING' },
      { name: 'STUCWERK' },
      { name: 'SCHILDEREN_COATING' },
      { name: 'NICOTINEVLEKKEN_VERWIJDERING' },
      { name: 'REDDERSTEAM_NOODDIENST_24_7' },
    ];

    await this.db.workerSpecialist.createMany({
      data,
      skipDuplicates: true,
    });

    this.logger.log(`Seeded ${data.length} WorkerSpecialist records`);
  }

  async onModuleInit() {
    await this.seed();
  }
}
