import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';

@Injectable()
export class TaskTypeService implements OnModuleInit {
  private logger = new Logger(TaskTypeService.name);

  constructor(private readonly db: DbService) {}

  private async sanitize() {
    const tasks = await this.db.taskType.findMany()
    await tasks.forEach(async (task) => {
     if(task.name.includes("_")|| task.name === task.name.toUpperCase()) {
      await this.db.taskType.delete({
        where: { id: task.id },
      });
     }
    });
    this.logger.log('Sanitization of TaskType names completed');
  }

  private async seed() {
    const data = [
      { name: 'Schimmel Inspectie' },
      { name: 'Huurwoning Inspectie' },
      { name: 'Vocht Controle' },
      { name: 'Stuc Reparatie' },
      { name: 'Schilder Werk' },
      { name: 'Nicotine Reiniging' },
      { name: 'Nood Interventie' },
    ];

    await this.db.taskType.createMany({
      data,
      skipDuplicates: true,
    });

    await this.sanitize();

    this.logger.log(`Seeded ${data.length} TaskType records`);
  }

  async onModuleInit() {
    await this.seed();
  }
}
