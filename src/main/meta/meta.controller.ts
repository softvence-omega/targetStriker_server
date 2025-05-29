import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WorkerSpecialistService } from './services/worker-specialist.service';
import { TaskTypeService } from './services/task-type.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('meta')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class MetaController {
    constructor(
        private readonly workerSpecialistService: WorkerSpecialistService,
        private readonly taskTypeService: TaskTypeService
    ) {}

    @Get('worker-specialist-type')
    async getWorkerSpecialist() {
        return await this.workerSpecialistService.getWorkerSpecialist()
    }

    @Get('task-type')
    async getTaskType() {
        return await this.taskTypeService.getTaskType()
    }
}
