import { BadRequestException, Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CurrentUser } from 'src/main/decorators/current-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateCourseDto } from 'src/courses/dto/update-course.dto';
import { UpdateScheduleDto } from 'src/main/dto/schedule/update-schedule/update-schedule.dto';
import { UpdateScheduleFormDTO } from './dto/update-schedule.dto';
import { UpdateAccountDTO } from './dto/update-account.dto';

@ApiBearerAuth()
@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('/me')
  async findActiveUserCourses(@CurrentUser() user: any) {
    return this.profileService.getProfile(user.payload.id);
  }

  @Get('/schedule')
  async findActiveUserSchedule(@CurrentUser() user: any) {
    return await this.profileService.getUserSchedule(user.payload.id);
  }

  @Put('/user-preference')
  async updateUserPreference(
    @CurrentUser() user: any,
    @Body() data: UpdateAccountDTO,
  ) {
    console.log('EDIT DATA', data);

    if(!data?.password) {
      throw new BadRequestException('Password is required');
    }
    return await this.profileService.updateUserAccount(
      user.payload.id,
      data,
    );
  }

  @Put('/schedule/:id')
  async updateActiveUserSchedule(
    @CurrentUser() user: any,
    @Param('id') id: number,
    @Body() data: UpdateScheduleFormDTO,
  ) {
    return await this.profileService.updateUserSchedule(
      id,
      data,
    );
  }

}
