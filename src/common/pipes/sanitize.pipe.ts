// src/common/pipes/sanitize.pipe.ts
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import * as DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

@Injectable()
export class SanitizePipe implements PipeTransform {
  private window = new JSDOM('').window;
  private domPurify = DOMPurify(this.window as any);

  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === 'string') {
      return this.domPurify.sanitize(value);
    }

    if (typeof value === 'object' && value !== null) {
      for (const key in value) {
        if (typeof value[key] === 'string') {
          value[key] = this.domPurify.sanitize(value[key]);
        }
      }
    }
    return value;
  }
}
