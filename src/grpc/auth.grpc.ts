import { join } from 'path';
import { ClientProviderOptions, Transport } from '@nestjs/microservices'; //gRPC client/server

export const AUTH_GRPC_CLIENT = 'AUTH_GRPC_CLIENT';

const PROTO_ROOT = join(
  process.cwd(),
  'node_modules/@trizo1104/proto-contracts/proto',
);

export const authGrpcProvider: ClientProviderOptions = {
  //ClientProviderOptions is an interface that defines the options for a gRPC client provider in NestJS. GRPC, RBMQ, REDIS, MQTT, NATS, KAFKA, etc. are supported.
  name: AUTH_GRPC_CLIENT,
  transport: Transport.GRPC,
  options: {
    package: 'auth',
    protoPath: join(PROTO_ROOT, 'auth/service.proto'),
    url: 'localhost:5001',
    loader: {
      includeDirs: [PROTO_ROOT],
    },
  },
};
