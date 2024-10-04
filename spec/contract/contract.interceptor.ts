import { mixin } from '@nestjs/common';

import { CrudLogger, RequestAbstractInterceptor } from '../../src';

import type { CallHandler, ExecutionContext, NestInterceptor, Type } from '@nestjs/common';
import type { Observable } from 'rxjs';

export function CreateRequestInterceptor(): Type<NestInterceptor> {
    class MixinInterceptor extends RequestAbstractInterceptor implements NestInterceptor {
        constructor() {
            super(new CrudLogger());
        }

        async intercept(context: ExecutionContext, next: CallHandler<unknown>): Promise<Observable<unknown>> {
            return next.handle();
        }
    }

    return mixin(MixinInterceptor);
}
