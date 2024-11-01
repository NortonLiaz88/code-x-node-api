import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MinioClientProvider } from './minio.provider';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MinioService {
  constructor(
    private readonly configService: ConfigService,
    private readonly minioClientProvider: MinioClientProvider,
  ) {}

  public getClient() {
    return this.minioClientProvider.client;
  }

  async ensureBucketExists(bucketName: string): Promise<void> {
    const client = this.getClient();

    const exists = await client.bucketExists(bucketName);
    if (!exists) {
      try {
        await client.makeBucket(bucketName, '');
        console.log(`Bucket "${bucketName}" created successfully.`);
      } catch (error) {
        throw new HttpException(
          `Error creating bucket: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async addObject(
    file: any,
    baseFilePath?: string,
  ): Promise<void> {
    const client = await this.getClient();
    const bucket = await this.configService.getOrThrow('MINIO_BUCKET');

    try {
      await client.putObject(
        bucket,
        baseFilePath,
        file.buffer as unknown as string,
        file.size,
      );
    } catch (error) {
      new HttpException(
        'File could not be uploaded to storage',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async checkConnection(): Promise<boolean> {
    const client = await this.getClient();
    try {
      await client.listBuckets();
      return true;
    } catch (error) {
      return false;
    }
  }

  async getObject(filePath: string): Promise<any> {
    const client = await this.getClient();
    const bucket = await this.configService.getOrThrow('MINIO_BUCKET');
    try {
      const presignedUrl = await client.presignedGetObject(bucket, filePath);

      return {
        url: presignedUrl,
      };
    } catch (error) {
      throw new HttpException(
        'Could not generate pre-signed URL for file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getObjectStream(filePath: string): Promise<any> {
    const client = this.getClient();
    try {
        const stream = await client.getObject('codex', filePath);
        return stream;
    } catch (error) {
        throw new HttpException(
            'Could not retrieve file from storage',
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
}

}
