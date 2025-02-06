"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const cookieParser = require("cookie-parser");
const path_1 = require("path");
const express = require("express");
const helmet_1 = require("helmet");
const nest_winston_1 = require("nest-winston");
const winston = require("winston");
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
    const logger = nest_winston_1.WinstonModule.createLogger({
        level: 'debug',
        transports: [
            new winston.transports.Console({
                format: winston.format.combine(winston.format.timestamp(), winston.format.printf(({ timestamp, level, message }) => {
                    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
                })),
            }),
        ],
    });
    logger.debug('Inicializando o NestFactory...');
    console.log('Criando a aplicação com o módulo principal.');
    try {
        const app = await core_1.NestFactory.create(app_module_1.AppModule, {
            logger: ['log', 'error', 'warn', 'debug', 'verbose'],
        });
        console.log('Configurando segurança com Helmet...');
        app.use((0, helmet_1.default)());
        console.log('Habilitando o parser de cookies...');
        app.use(cookieParser());
        console.log('Aplicando validações globais...');
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }));
        console.log('Configurando rota estática para uploads...');
        app.use('/uploads', express.static((0, path_1.join)(__dirname, '..', 'uploads')));
        const port = process.env.PORT || 3000;
        console.log(`Iniciando o servidor na porta ${port}...`);
        await app.listen(port);
        console.log(`Servidor rodando na porta ${port}`);
        logger.log('info', `Servidor rodando na porta ${port}`);
    }
    catch (error) {
        console.error('Erro ao inicializar a aplicação:', error);
        logger.error('Erro ao inicializar:', error);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map