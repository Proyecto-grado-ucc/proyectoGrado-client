import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModulo } from './app.modulo';
import { LoggerJson } from './core/logger/logger-json';

async function arrancar() {
  const logger = new LoggerJson();
  const app = await NestFactory.create(AppModulo, { logger });

  app.use(helmet());

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') ?? 'http://localhost:3000',
    credentials: true,
  });

  const configuracionSwagger = new DocumentBuilder()
    .setTitle('Sistema CAL — API')
    .setDescription('Cambridge Academy of Languages — API REST')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const documento = SwaggerModule.createDocument(app, configuracionSwagger);
  SwaggerModule.setup('api/docs', app, documento);

  const puerto = process.env.PORT ?? 3000;
  await app.listen(puerto);
  logger.log(`Servidor en http://localhost:${puerto}/api`, 'Bootstrap');
  logger.log(`Documentación en http://localhost:${puerto}/api/docs`, 'Bootstrap');
}

arrancar();
