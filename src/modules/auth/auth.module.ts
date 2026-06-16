import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ClientsModule } from '@nestjs/microservices/module/clients.module';
import { authGrpcProvider } from '@grpc/auth.grpc';
import { AuthCookieConfig } from './utils/auth-cookie.options';

@Module({
  imports: [ClientsModule.register([authGrpcProvider])],
  controllers: [AuthController],
  providers: [AuthService, AuthCookieConfig],
  exports: [AuthService],
})
export class AuthModule {}
