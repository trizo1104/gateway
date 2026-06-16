import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { extractOptionalAuthToken } from '@common/auth/auth-token.util';
import { IS_PUBLIC_KEY } from '@common/decorators/public.decorator';
import type { AuthenticatedRequest } from '@common/interfaces/authenticated-request.interface';
import type { JwtPayload } from '@common/interfaces/jwt-payload.interface';
import { AuthService } from '@modules/auth/auth.service';
import type { User } from '@trizo1104/proto-contracts/gen/ts/auth/user_message';

@Injectable()
export class JwtAuthGuard implements CanActivate {
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

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractOptionalAuthToken(request);

    if (!token) {
      throw new UnauthorizedException('Authentication token is required');
    }

    const { user } = await this.authService.me(token);
    if (!user) {
      throw new UnauthorizedException('Authentication token payload is invalid');
    }

    request.user = this.normalizeUser(user);
    return true;
  }

  private normalizeUser(user: User): JwtPayload {
    if (!user.id || !user.username || !user.email) {
      throw new UnauthorizedException(
        'Authentication token payload is invalid',
      );
    }

    return {
      sub: user.id,
      username: user.username,
      email: user.email,
    };
  }
}
