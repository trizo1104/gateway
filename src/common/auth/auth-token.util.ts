import { Metadata } from '@grpc/grpc-js';
import { UnauthorizedException } from '@nestjs/common';
import type { AuthenticatedRequest } from '@common/interfaces/authenticated-request.interface';

export function extractAuthToken(request: AuthenticatedRequest): string {
  const cookieToken = request.cookies?.token;
  if (cookieToken) {
    return cookieToken;
  }

  const authorization = request.headers.authorization;
  if (!authorization) {
    throw new UnauthorizedException('Authentication token is required');
  }

  const [scheme, token] = authorization.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    throw new UnauthorizedException('Authentication token is invalid');
  }

  return token;
}

export function extractOptionalAuthToken(
  request: AuthenticatedRequest,
): string | undefined {
  try {
    return extractAuthToken(request);
  } catch {
    return undefined;
  }
}

export function createAuthMetadata(token: string): Metadata {
  const metadata = new Metadata();
  metadata.set('authorization', `Bearer ${token}`);
  return metadata;
}
