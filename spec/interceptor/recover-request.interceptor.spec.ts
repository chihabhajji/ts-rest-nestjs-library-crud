import { of } from 'rxjs';
import { BaseEntity } from 'typeorm';

import { RecoverRequestInterceptor } from '../../src/lib/interceptor/recover-request.interceptor';
import { CRUD_ROUTE_ARGS } from '../../src/lib/constants';
import { ExecutionContextHost } from '../../src/lib/provider';
import { CrudLogger } from '../../src/lib/provider/crud-logger';

import type { CallHandler } from '@nestjs/common';

describe('RecoverRequestInterceptor', () => {
    it('should intercept', async () => {
        class BodyDto extends BaseEntity {
            col1: string;
        }
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const Interceptor = RecoverRequestInterceptor({ entity: BodyDto }, { relations: [], logger: new CrudLogger(), primaryKeys: [] });
        const interceptor = new Interceptor();
        const handler: CallHandler = {
            handle: () => of('test'),
        };
        const context = new ExecutionContextHost([{}]);
        await interceptor.intercept(context, handler);
        expect(context.switchToHttp().getRequest()).toHaveProperty(CRUD_ROUTE_ARGS);
    });
});
