import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { assertTokenSecrets } from './infra/cryptography/token-type';
import { FieldValidationPipe } from './main/dto/error/field-errors';
import { corsOrigins, trustProxy } from './infra/http/security/http-options';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  assertTokenSecrets();
  app.set('trust proxy', trustProxy());
  // The API serves JSON only; CSP is off so the Swagger page at /docs works.
  app.use(helmet({ contentSecurityPolicy: false }));
  // The app doesn't need CORS; browsers only get in from CORS_ORIGINS.
  const origins = corsOrigins();
  if (origins.length) app.enableCors({ origin: origins });
  const config = new DocumentBuilder()
    .setTitle('CodeX API')
    .setDescription('API do CodeX')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  app.useGlobalPipes(new FieldValidationPipe());
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
