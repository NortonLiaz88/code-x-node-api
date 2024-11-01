import { Module } from '@nestjs/common';
import { MinioService } from './minio.service';
import { MinioClientProvider } from './minio.provider';
import { FileController } from './files.controller';

@Module({
  exports: [MinioService],
  controllers: [FileController],
  providers: [MinioClientProvider, MinioService],
})
export class FileModule {}
