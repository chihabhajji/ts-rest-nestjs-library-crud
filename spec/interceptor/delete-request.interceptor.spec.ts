import { of } from 'rxjs';
import { BaseEntity } from 'typeorm';

import { DeleteRequestInterceptor } from '../../src/lib/interceptor/delete-request.interceptor';
import { CRUD_ROUTE_ARGS } from '../../src/lib/constants';
import { ExecutionContextHost } from '../../src/lib/provider';
import { CrudLogger } from '../../src/lib/provider/crud-logger';

import type { CallHandler } from '@nestjs/common';

describe('DeleteRequestInterceptor', () => {
    it('should intercept', async () => {
        class BodyDto extends BaseEntity {
            col1: string;
        }
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const Interceptor = DeleteRequestInterceptor({ entity: BodyDto }, { relations: [], logger: new CrudLogger(), primaryKeys: [] });
        const interceptor = new Interceptor();

        const handler: CallHandler = {
            handle: () => of('test'),
        };
        const context = new ExecutionContextHost([{}]);
        await interceptor.intercept(context, handler);
        expect(context.switchToHttp().getRequest()).toHaveProperty(CRUD_ROUTE_ARGS);
    });
});
