import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // allows only properties that are defined in the DTO
      forbidNonWhitelisted: true, // throws an error if non-whitelisted properties are present
      transform: true, // automatically transforms payloads to be objects typed according to their DTO classes "123" -> 123
      transformOptions: {
        enableImplicitConversion: true, // allows primitive types to be automatically converted based on the DTO type definitions
      },
    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(process.env.PORT ?? 9000);
}
bootstrap();
