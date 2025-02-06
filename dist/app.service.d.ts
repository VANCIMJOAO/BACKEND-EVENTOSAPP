import { Counter } from 'prom-client';
export declare class AppService {
    private readonly counter;
    constructor(counter: Counter<string>);
    handleRequest(): void;
}
