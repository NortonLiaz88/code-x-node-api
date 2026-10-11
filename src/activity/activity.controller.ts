import { Controller, Get, Param } from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ActivityService } from './activity.service';
import { Language } from '@prisma/client';

@ApiBearerAuth()
@ApiTags('activities')
@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('/:course/:id')
  async findOne(@Param('course') courseName: string, @Param('id') id: string) {
    return await this.activityService.getActivityByCourse(
      courseName as Language,
      id,
    );
  }
}
