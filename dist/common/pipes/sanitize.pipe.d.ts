import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
export declare class SanitizePipe implements PipeTransform {
    private window;
    private domPurify;
    transform(value: any, metadata: ArgumentMetadata): any;
}
