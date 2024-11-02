import { Injectable } from '@nestjs/common';
import * as Minio from 'minio';

@Injectable()
export class MinioClientProvider {
  public readonly client: Minio.Client;

  constructor() {
    this.client = new Minio.Client({
      endPoint: '195.200.7.68',
      port: 9000,
      useSSL: false,
      accessKey: 'admin',
      secretKey: 'adminadmin',
    });
  }
}
