import { Injectable } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';
import { UserSearchQueryDto } from '../dto/userSearch.dto';

@Injectable()
export class UserManagementService {
    constructor(private readonly dbService:DbService) {}

    async getAllUser(query: UserSearchQueryDto) {
    const { email, name, location } = query;

    const filters: any[] = [];

    if (email) {
        filters.push({ email: { contains: email, mode: 'insensitive' } });
    }

    if (name) {
        filters.push({ name: { contains: name, mode: 'insensitive' } });
    }

    if (location) {
        filters.push({
        OR: [
            { clientProfile: { location: { contains: location, mode: 'insensitive' } } },
            // Note: `location` is JSON in workerProfile; use exact string match or adjust as needed
            { workerProfile: { location: { equals: location } } },
        ],
        });
    }

    return this.dbService.user.findMany({
        where: filters.length > 0 ? { OR: filters } : undefined,
        include: {
        clientProfile: true,
        workerProfile: true,
        },
    });
}

}
