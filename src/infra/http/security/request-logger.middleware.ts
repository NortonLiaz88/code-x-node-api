import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

/**
 * One line per request: method, path (no query string), status, duration and
 * user id. Never bodies or headers, so no passwords or tokens reach the logs.
 * Successful health checks are skipped: the uptime monitor calls it often.
 */
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const started = process.hrtime.bigint();
    res.on('finish', () => {
      const path = req.originalUrl.split('?')[0];
      if (path === '/health' && res.statusCode < 400) return;
      const ms = Number(process.hrtime.bigint() - started) / 1e6;
      const user = (req as Request & { user?: { payload?: { id?: string } } })
        .user?.payload?.id;
      this.logger.log(
        `${req.method} ${path} ${res.statusCode} ${Math.round(ms)}ms user=${user ?? '-'}`,
      );
    });
    next();
  }
}
