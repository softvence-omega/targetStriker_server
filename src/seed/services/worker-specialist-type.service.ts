import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { DbService } from 'src/utils/db/db.service';

@Injectable()
export class WorkerSpecialistTypeService implements OnModuleInit {
  private logger = new Logger(WorkerSpecialistTypeService.name);

  constructor(private readonly db: DbService) {}

  private async sanitize() {
    const tasks = await this.db.workerSpecialist.findMany()
    await tasks.forEach(async (task) => {
     if(task.name.includes("_") || task.name === task.name.toUpperCase()) {
      await this.db.workerSpecialist.delete({
        where: { id: task.id },
      });
     }
    });
    this.logger.log('Sanitization of TaskType names completed');
  }

  private async seed() {
    const data: Prisma.WorkerSpecialistCreateManyInput[] = [
      { name: 'Schimmel Inspecties Behandelingen' },
      { name: 'Inspecties Huurwoningen Nazorg' },
      { name: 'Vochtbeheersing' },
      { name: 'Stucwerk' },
      { name: 'Schilderen Coating' },
      { name: 'Nicotinevlekken Verwijdering' },
      { name: 'Reddersteam Nooddienst 24 7' },
    ];

    await this.db.workerSpecialist.createMany({
      data,
      skipDuplicates: true,
    });

    await this.sanitize();

    this.logger.log(`Seeded ${data.length} WorkerSpecialist records`);
  }

  async onModuleInit() {
    await this.seed();
  }
}
