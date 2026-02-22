import { Module } from '@nestjs/common';
import { SharedAuthModule } from '@saas-platform/auth';
import { AuthController } from './auth.controller';

@Module({
  imports: [SharedAuthModule],
  controllers: [AuthController],
})
export class AppModule {}
