import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { assertTokenSecrets } from './infra/cryptography/token-type';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  assertTokenSecrets();
  const config = new DocumentBuilder()
    .setTitle('CodeX API')
    .setDescription('API do CodeX')
    .setVersion('1.0')
    .addBearerAuth()
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
