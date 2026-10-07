import { Controller, Put, Headers, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateScheduleDto } from 'src/main/dto/schedule/update-schedule/update-schedule.dto';
import { AuthService } from 'src/main/usecases/auth/auth.service';
import { ScheduleService } from 'src/service/schedule/schedule.service';

@ApiBearerAuth()
@ApiTags('schedules')
@Controller('schedules')
export class UpdateScheduleController {
  constructor(
    private readonly authService: AuthService,
    private readonly scheduleService: ScheduleService,
  ) {}

  @Put()
  async update(
    @Headers('Authorization') header,
    @Body() schedule: UpdateScheduleDto,
  ): Promise<any> {
    const token = header.split('Bearer ')[1];

    const userData = (await this.authService.getUserByToken(token)).payload;

    await this.scheduleService.update(userData.id, schedule);

    return {
        ...schedule,
        userId: userData.id,
    }
  }
}
