import { Controller, forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Crud, CrudController, CrudOptions } from '../../src';
import { BaseEntity } from '../base/base.entity';
import { BaseService } from '../base/base.service';
import { TestHelper } from '../test.helper';

export function PaginationModule(crudOptions?: CrudOptions['routes']) {
    function offsetController() {
        @Crud({ entity: BaseEntity, routes: crudOptions, logging: true })
        @Controller()
        class OffsetController implements CrudController<BaseEntity> {
            constructor(public readonly crudService: BaseService) {}
        }
        return OffsetController;
    }

    function getModule() {
        @Module({
            imports: [forwardRef(() => TestHelper.getTypeOrmMysqlModule([BaseEntity])), TypeOrmModule.forFeature([BaseEntity])],
            controllers: [offsetController()],
            providers: [BaseService],
        })
        class BaseModule {}
        return BaseModule;
    }

    return getModule();
}
