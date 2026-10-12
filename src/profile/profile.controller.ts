import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Put,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CurrentUser } from 'src/main/decorators/current-user.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FieldErrorsDto } from 'src/main/dto/error/field-errors';
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

  @Patch('/me')
  @ApiOperation({
    summary: 'Change username, email or phone',
    description: 'Fields left out are kept.',
  })
  @ApiResponse({ status: 200, description: 'The updated account' })
  @ApiResponse({ status: 400, type: FieldErrorsDto })
  @ApiResponse({
    status: 409,
    type: FieldErrorsDto,
    description: 'A value is taken; `fields` names each one',
  })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() data: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(user.payload.id, data);
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

    if (!data?.password) {
      throw new BadRequestException('Password is required');
    }
    return await this.profileService.updateUserAccount(user.payload.id, data);
  }

  @Put('/schedule/:id')
  async updateActiveUserSchedule(
    @CurrentUser() user: any,
    @Param('id') id: number,
    @Body() data: UpdateScheduleFormDTO,
  ) {
    return await this.profileService.updateUserSchedule(
      user.payload.id,
      id,
      data,
    );
  }
}
