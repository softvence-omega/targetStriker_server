import { Injectable } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';

@Injectable()
export class CommonService {
    constructor(
        private readonly dbService: DbService,
    ) {}

    async getAllWithCustomStatus() {
        const requests = await this.dbService.serviceRequest.findMany({
            include: {
                WorkerProfile: {
                    select: {
                        id: true,
                        userName: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const now = new Date();

        return requests.map((req) => {
            let customStatus: 'assigned' | 'pending' | 'completed' | 'late';

            if (req.status === 'ASSIGNED' && req.WorkerProfile) {
                customStatus = 'assigned';
            } else if (req.status === 'PENDING' && !req.WorkerProfile) {
                // Check if createdAt is in the past (i.e., overdue)
                if (req.createdAt && new Date(req.createdAt) < now) {
                    customStatus = 'late';
                } else {
                    customStatus = 'pending';
                }
            } else if (req.status === 'COMPLETED') {
                customStatus = 'completed';
            } else {
                customStatus = 'pending'; // fallback
            }

            return {
                id: req.id,
                createdAt: req.createdAt,
                propertyName: req.name || 'N/A',
                location: req.city,
                worker: req.WorkerProfile
                    ? {
                        id: req.WorkerProfile.userName,
                        name: req.WorkerProfile.userName,
                    }
                    : null,
                status: customStatus,
            };
        });
    }
}
