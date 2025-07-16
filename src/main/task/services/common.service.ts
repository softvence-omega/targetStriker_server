import { Injectable, NotFoundException } from '@nestjs/common';
import { ReportPhoto } from 'generated/prisma';
import { IdDto } from 'src/common/dto/id.dto';
import { ApiResponse } from 'src/common/types/apiResponse';
import { DbService } from 'src/utils/db/db.service';

@Injectable()
export class CommonService {
    constructor(
        private readonly db: DbService  
    ) {}


    public async getTaskDetails({id:serviceRequestId}:IdDto):Promise<ApiResponse<any>>{
        const data = await this.db.serviceRequest.findUnique({
            where: {
              id: serviceRequestId,
            },
            include: {
             tasks:true,
             ClientProfile:true,
             WorkerProfile:true,
             reportPhoto:true,
             afterPhoto:true,
             beforePhoto:true,
             Invoice:true,
             TaskType:true,
             signature:true,
             reqPhoto:true,
             Reviews:true,
             },
        }) 

        // let prevPhoto:ReportPhoto[] = []
        // let afterPhoto:ReportPhoto[] = []

        // if (!data) {
        //     throw new NotFoundException('Service request not found');
        // }

        // await data.reportPhoto.map((photo)=>{
        //     if(photo.isPrev){
        //         prevPhoto.push(photo)
        //     }else{
        //         afterPhoto.push(photo)
        //     }
        // })

        return {
            data,
            message: 'Task details fetched successfully',
            success: true
        }
    }

}
