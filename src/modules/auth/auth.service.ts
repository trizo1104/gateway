import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { Metadata } from '@grpc/grpc-js';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type { Observable } from 'rxjs';
import type {
  LoginRequest,
  LoginResponse,
  MeRequest,
  MeResponse,
} from '@trizo1104/proto-contracts/gen/ts/auth/auth_message';
import type {
  AssignRoleToUserRequest,
  AssignRoleToUserResponse,
  ListRolesResponse,
  RemoveRoleFromUserRequest,
  RemoveRoleFromUserResponse,
} from '@trizo1104/proto-contracts/gen/ts/auth/role_message';
import type {
  CreateUserRequest,
  DeleteUserRequest,
  DeleteUserResponse,
  GetUserByIdRequest,
  ListUsersRequest,
  ListUsersResponse,
  UpdateUserRequest,
  UserResponse,
} from '@trizo1104/proto-contracts/gen/ts/auth/user_message';
import type {
  GetUserPermissionsRequest,
  GetUserPermissionsResponse,
  ListPermissionsResponse,
} from '@trizo1104/proto-contracts/gen/ts/auth/permission_message';

import type { AuthServiceClient } from '@trizo1104/proto-contracts/gen/ts/auth/service';

import { AUTH_GRPC_CLIENT } from '@grpc/auth.grpc';
import { createAuthMetadata } from '@common/auth/auth-token.util';
import { mapGrpcError } from '@common/grpc/grpc-error.mapper';

type GrpcMethodWithMetadata<TRequest, TResponse> = (
  request: TRequest,
  metadata?: Metadata,
) => Observable<TResponse>;

type AuthServiceClientWithMetadata = {
  [K in keyof AuthServiceClient]: AuthServiceClient[K] extends (
    request: infer TRequest,
  ) => Observable<infer TResponse>
    ? GrpcMethodWithMetadata<TRequest, TResponse>
    : AuthServiceClient[K];
};

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

  private async callGrpc<T>(call: () => Observable<T>): Promise<T> {
    try {
      return await firstValueFrom(call());
    } catch (error: unknown) {
      throw mapGrpcError(error);
    }
  }

  private withMetadata(): AuthServiceClientWithMetadata {
    return this.authServiceClient as unknown as AuthServiceClientWithMetadata;
  }

  private createMetadata(token: string): Metadata {
    return createAuthMetadata(token);
  }

  async login(loginRequest: LoginRequest): Promise<LoginResponse> {
    return await this.callGrpc(() =>
      this.authServiceClient.login(loginRequest),
    );
  }

  async me(token: string): Promise<MeResponse> {
    return this.callGrpc(() =>
      this.withMetadata().me({}, this.createMetadata(token)),
    );
  }

  async createUser(
    request: CreateUserRequest,
    token: string,
  ): Promise<UserResponse> {
    return this.callGrpc(() =>
      this.withMetadata().createUser(request, this.createMetadata(token)),
    );
  }

  async getUserById(
    request: GetUserByIdRequest,
    token: string,
  ): Promise<UserResponse> {
    return this.callGrpc(() =>
      this.withMetadata().getUserById(request, this.createMetadata(token)),
    );
  }

  async updateUser(
    request: UpdateUserRequest,
    token: string,
  ): Promise<UserResponse> {
    return this.callGrpc(() =>
      this.withMetadata().updateUser(request, this.createMetadata(token)),
    );
  }

  async deleteUser(
    request: DeleteUserRequest,
    token: string,
  ): Promise<DeleteUserResponse> {
    return this.callGrpc(() =>
      this.withMetadata().deleteUser(request, this.createMetadata(token)),
    );
  }

  async listUsers(
    request: ListUsersRequest,
    token: string,
  ): Promise<ListUsersResponse> {
    return this.callGrpc(() =>
      this.withMetadata().listUsers(request, this.createMetadata(token)),
    );
  }

  async listRoles(token: string): Promise<ListRolesResponse> {
    return this.callGrpc(() =>
      this.withMetadata().listRoles({}, this.createMetadata(token)),
    );
  }

  async assignRoleToUser(
    request: AssignRoleToUserRequest,
    token: string,
  ): Promise<AssignRoleToUserResponse> {
    return this.callGrpc(() =>
      this.withMetadata().assignRoleToUser(request, this.createMetadata(token)),
    );
  }

  async removeRoleFromUser(
    request: RemoveRoleFromUserRequest,
    token: string,
  ): Promise<RemoveRoleFromUserResponse> {
    return this.callGrpc(() =>
      this.withMetadata().removeRoleFromUser(
        request,
        this.createMetadata(token),
      ),
    );
  }

  async listPermissions(token: string): Promise<ListPermissionsResponse> {
    return this.callGrpc(() =>
      this.withMetadata().listPermissions({}, this.createMetadata(token)),
    );
  }

  async getUserPermissions(
    request: GetUserPermissionsRequest,
    token: string,
  ): Promise<GetUserPermissionsResponse> {
    return this.callGrpc(() =>
      this.withMetadata().getUserPermissions(
        request,
        this.createMetadata(token),
      ),
    );
  }
}
