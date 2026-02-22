import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://127.0.0.1:4200', 'http://localhost:4200'],
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    credentials: true,
  });
  app.setGlobalPrefix('api');
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`🚀 file-service: http://localhost:${port}/api`);
}
bootstrap();
