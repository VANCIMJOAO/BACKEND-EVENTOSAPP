import { PrometheusController } from '@willsoto/nestjs-prometheus';
import { Response } from 'express';
export declare class MyCustomController extends PrometheusController {
    index(response: Response): Promise<string>;
}
