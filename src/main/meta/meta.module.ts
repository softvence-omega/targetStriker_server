import { Module } from '@nestjs/common';
import { MetaController } from './meta.controller';
import { WorkerSpecialistService } from './services/worker-specialist.service';
import { TaskTypeService } from './services/task-type.service';

@Module({
  controllers: [MetaController],
  providers: [WorkerSpecialistService, TaskTypeService]
})
export class MetaModule {}
