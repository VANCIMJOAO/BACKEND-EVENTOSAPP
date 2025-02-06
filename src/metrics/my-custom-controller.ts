// src/metrics/my-custom-controller.ts
import { Controller, Get, Res } from '@nestjs/common';
import { PrometheusController } from '@willsoto/nestjs-prometheus';
import { Response } from 'express';

@Controller('metrics')
export class MyCustomController extends PrometheusController {
  @Get()
  async index(@Res({ passthrough: true }) response: Response): Promise<string> {
    // Você pode incluir lógica extra aqui, se desejar
    return super.index(response);
  }
}
