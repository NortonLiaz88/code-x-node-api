import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioClientProvider {
  public readonly client: Minio.Client;

  constructor(private readonly configService: ConfigService) {
    this.client = new Minio.Client({
      endPoint: this.configService.getOrThrow('MINIO_ENDPOINT'),
      port: Number(this.configService.get('MINIO_PORT', 9000)),
      useSSL: this.configService.get('MINIO_USE_SSL', 'false') === 'true',
      accessKey: this.configService.getOrThrow('MINIO_ACCESS_KEY'),
      secretKey: this.configService.getOrThrow('MINIO_SECRET_KEY'),
    });
  }
}
