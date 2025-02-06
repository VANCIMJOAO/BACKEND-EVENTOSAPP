import { ThrottlerGuard as BaseThrottlerGuard } from '@nestjs/throttler';
export declare class ThrottlerBehindProxyGuard extends BaseThrottlerGuard {
    protected getTracker(req: Record<string, any>): Promise<string>;
}
export declare class AppModule {
}
