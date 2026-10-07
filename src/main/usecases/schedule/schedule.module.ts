import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "src/infra/orm/prisma/prisma.module";
import { ScheduleService } from "src/service/schedule/schedule.service";
import { makeDbUpdateSchedule } from "src/main/factory/schedule/update-schedule";
import { UpdateScheduleController } from "src/presentation/controllers/schedule/update-schedule/update-schedule.controller";

@Module({
    imports: [AuthModule, PrismaModule],
    controllers: [UpdateScheduleController],
    providers: [
        {
            provide: ScheduleService,
            useFactory: () => {
                const dbUpdateSchedule = makeDbUpdateSchedule();
                
                return new ScheduleService(dbUpdateSchedule);
            }
        }
    ]
})
export class ScheduleModule {}