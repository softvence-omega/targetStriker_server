import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';

@Injectable()
export class SettingService implements OnModuleInit {
    private logger = new Logger(SettingService.name);

    constructor(
        private readonly db: DbService
    ){}

    private async createBankInfoInstance(){
        const isExist = await this.db.bankInfo.findFirst()
        if(!isExist){
            await this.db.bankInfo.create({
                data: {
                    bankName: 'N/A',
                    IBAN: 'N/A',
                    BIC_or_SWIFT: 'N/A',
                }
            })
            this.logger.log('Bank info instance created')
        }
        this.logger.log('Bank info instance already exist')
    }

    private async createPaymentTermInstance(){
        const isExist = await this.db.paymentTerm.findFirst()
        if(!isExist){
            await this.db.paymentTerm.create({
                data:{}
            })
            this.logger.log('Payment Term instance created')
        }
        this.logger.log('Payment Term instance already exist')
    }

    async onModuleInit() {
        await this.createBankInfoInstance()
        await this.createPaymentTermInstance()
    }

}
