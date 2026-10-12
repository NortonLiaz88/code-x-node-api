import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  TutorMetricsDto,
  TutorMetricsQuery,
} from 'src/main/dto/chat/tutor-metrics/tutor-metrics.dto';
import { Roles } from 'src/main/usecases/auth/roles.guard';
import { TutorMetricsService } from 'src/service/chat/tutor-metrics.service';

@ApiBearerAuth()
@ApiTags('admin')
@Roles('ADMIN')
@Controller('admin/tutor-metrics')
export class TutorMetricsController {
  constructor(private readonly metrics: TutorMetricsService) {}

  @Get()
  @ApiResponse({ type: TutorMetricsDto, status: 200 })
  async daily(
    @Query(new ValidationPipe()) query: TutorMetricsQuery,
  ): Promise<TutorMetricsDto> {
    return this.metrics.daily(query.date);
  }
}
