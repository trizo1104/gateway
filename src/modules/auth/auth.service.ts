import {
  Inject,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type {
  LoginRequest,
  LoginResponse,
} from '@trizo1104/proto-contracts/gen/ts/auth/auth_message';

import type { AuthServiceClient } from '@trizo1104/proto-contracts/gen/ts/auth/service';

import { AUTH_GRPC_CLIENT } from '@grpc/auth.grpc';

@Injectable()
export class AuthService implements OnModuleInit {
  private authServiceClient!: AuthServiceClient;

  constructor(
    @Inject(AUTH_GRPC_CLIENT)
    private client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.authServiceClient =
      this.client.getService<AuthServiceClient>('AuthService');
  }

  async login(loginRequest: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await firstValueFrom(
        this.authServiceClient.login(loginRequest),
      );

      return response;
    } catch (error: any) {
      if (error.code === 16) {
        throw new UnauthorizedException(error.details);
      }

      throw new InternalServerErrorException(
        error.details || 'Auth service error',
      );
    }
  }
}
