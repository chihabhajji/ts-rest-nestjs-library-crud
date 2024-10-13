import { Controller } from '@nestjs/common';
import { ContractNoBody } from '@ts-rest/core';

import { Crud } from '../../src/lib/crud.decorator';
import { CrudController } from '../../src/lib/interface';
import { BaseEntity } from '../base/base.entity';
import { BaseService } from '../base/base.service';

@Crud({
    entity: BaseEntity,
    routes: { readMany: { sort: 'DESC', path: '/base', method: 'GET', responses: { 200: ContractNoBody } } },
    logging: true,
})
@Controller('sort-desc')
export class SortDescController implements CrudController<BaseEntity> {
    constructor(public readonly crudService: BaseService) {}
}
