// src/app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    // Se desejar, pode chamar handleRequest() aqui, mas como handleRequest() não retorna nada, pode fazer outra lógica.
    this.appService.handleRequest();
    return 'Request handled, metric incremented!';
  }
}
