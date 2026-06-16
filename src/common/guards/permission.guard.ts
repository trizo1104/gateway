import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@common/decorators/public.decorator';
import { REQUIRED_PERMISSIONS_KEY } from '@common/decorators/require-permissions.decorator';
import type { AuthenticatedRequest } from '@common/interfaces/authenticated-request.interface';
import { extractAuthToken } from '@common/auth/auth-token.util';
import { AuthService } from '@modules/auth/auth.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      REQUIRED_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user?.sub;

    if (!userId) {
      throw new UnauthorizedException(
        'Authentication token payload is invalid',
      );
    }

    const { permissions } = await this.authService.getUserPermissions(
      {
        userId,
      },
      extractAuthToken(request),
    );
    const userPermissions = new Set(permissions);
    const hasPermissions = requiredPermissions.every((permission) =>
      userPermissions.has(permission),
    );

    if (!hasPermissions) {
      throw new ForbiddenException('No permission');
    }

    return true;
  }
}
