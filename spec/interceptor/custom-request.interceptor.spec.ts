import { of } from 'rxjs';

import { CustomRequestInterceptor } from '../../src/lib/interceptor/custom-request.interceptor';
import { CUSTOM_REQUEST_OPTIONS } from '../../src/lib/constants';
import { ExecutionContextHost } from '../../src/lib/provider';

import type { CallHandler } from '@nestjs/common';

describe('CustomRequestInterceptor', () => {
    it('should intercept', async () => {
        const handler: CallHandler = {
            handle: () => of('test'),
        };
        const interceptor: CustomRequestInterceptor = new CustomRequestInterceptor();

        const context = new ExecutionContextHost([{}]);

        await interceptor.intercept(context, handler);
        expect(context.switchToHttp().getRequest()).toHaveProperty(CUSTOM_REQUEST_OPTIONS);
    });
});
