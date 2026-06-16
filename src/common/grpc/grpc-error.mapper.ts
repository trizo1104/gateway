import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { status } from '@grpc/grpc-js';

interface GrpcError {
  code?: number;
  details?: string;
  message?: string;
}

export function mapGrpcError(error: unknown): Error {
  const grpcError = error as GrpcError;
  const message =
    grpcError.details || grpcError.message || 'Auth service error';

  switch (grpcError.code) {
    case status.INVALID_ARGUMENT:
      return new BadRequestException(message);
    case status.NOT_FOUND:
      return new NotFoundException(message);
    case status.ALREADY_EXISTS:
      return new ConflictException(message);
    case status.UNAUTHENTICATED:
      return new UnauthorizedException(message);
    case status.PERMISSION_DENIED:
      return new ForbiddenException(message);
    case status.UNAVAILABLE:
      return new ServiceUnavailableException('Auth service is unavailable');
    default:
      return new InternalServerErrorException(message);
  }
}
