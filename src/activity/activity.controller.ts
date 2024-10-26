import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { CurrentUser } from 'src/main/decorators/current-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ActivityService } from './activity.service';
import { Language } from '@prisma/client';

@ApiBearerAuth()
@ApiTags('activity')
@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('/:course/:id')
  async findOne(@Param('course') courseName: string, @Param('id') id: string) {
    return await this.activityService.getActivityByCourse(courseName as Language, id);
  }
}
