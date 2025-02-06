// src/app.service.ts
import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

@Injectable()
export class AppService {
  constructor(
    @InjectMetric('custom_requests_total')
    private readonly counter: Counter<string>,
  ) {}

  handleRequest() {
    // Incrementa a métrica customizada a cada requisição
    this.counter.inc();
  }
}
