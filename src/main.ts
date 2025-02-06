// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { join } from 'path';
import * as express from 'express';
import helmet from 'helmet';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('exit', (code) => {
  console.log(`Processo encerrado com o código: ${code}`);
});

async function bootstrap() {
  console.log('=== Inicializando a aplicação NestJS ===');

  const logger = WinstonModule.createLogger({
    level: 'debug',
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
          }),
        ),
      }),
    ],
  });

  logger.debug('Inicializando o NestFactory...');
  console.log('Criando a aplicação com o módulo principal.');

  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });

    console.log('Configurando segurança com Helmet...');
    app.use(helmet());

    console.log('Habilitando o parser de cookies...');
    app.use(cookieParser());

    console.log('Aplicando validações globais...');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    console.log('Configurando rota estática para uploads...');
    app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

    // Removemos a configuração do Swagger

    // Como o TypeOrmModule já gerencia a conexão automaticamente,
    // não há necessidade de realizar verificação manual do DataSource.

    const port = process.env.PORT || 3000;
    console.log(`Iniciando o servidor na porta ${port}...`);
    await app.listen(port);
    console.log(`Servidor rodando na porta ${port}`);
    logger.log('info', `Servidor rodando na porta ${port}`);
  } catch (error) {
    console.error('Erro ao inicializar a aplicação:', error);
    logger.error('Erro ao inicializar:', error);
    process.exit(1);
  }
}

bootstrap();
