import { Module } from '@nestjs/common';
import { SharedAuthModule } from '@saas-platform/auth';
import { AppController } from './app.controller';

@Module({
  imports: [SharedAuthModule],
  controllers: [AppController],
})
export class AppModule {}
