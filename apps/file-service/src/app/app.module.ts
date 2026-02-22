import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { SharedAuthModule } from '@saas-platform/auth';
import { AppController } from './app.controller';

@Module({
  imports: [
    SharedAuthModule,
    MulterModule.register({
      storage: diskStorage({ destination: '/tmp/uploads' }),
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
