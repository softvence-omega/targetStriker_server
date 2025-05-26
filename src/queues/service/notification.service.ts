import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';

@Processor('notification')
export class NotificationService extends WorkerHost {
    async process(job) {
        console.log(job);
    }
}
