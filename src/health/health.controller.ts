import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Response } from 'express';

import { Public } from 'src/main/usecases/auth/auth.guard';
import { HealthReport, HealthService } from './health.service';

@ApiTags('health')
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  /** 200 when the API can serve (status ok or degraded), 503 when it can't. */
  @Public()
  @Get()
  async check(
    @Res({ passthrough: true }) res: Response,
  ): Promise<HealthReport> {
    const report = await this.health.check();
    if (report.status === 'down') res.status(HttpStatus.SERVICE_UNAVAILABLE);
    return report;
  }
}
