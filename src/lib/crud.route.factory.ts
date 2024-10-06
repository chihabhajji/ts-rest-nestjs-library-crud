/* eslint-disable @typescript-eslint/ban-types, @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any */
import { HttpStatus, UnprocessableEntityException } from '@nestjs/common';
import {
    CUSTOM_ROUTE_ARGS_METADATA,
    HTTP_CODE_METADATA,
    INTERCEPTORS_METADATA,
    METHOD_METADATA,
    PARAMTYPES_METADATA,
    PATH_METADATA,
    ROUTE_ARGS_METADATA,
} from '@nestjs/common/constants';
import { getMetadataArgsStorage, DefaultNamingStrategy } from 'typeorm';
import { MetadataUtils } from 'typeorm/metadata-builder/MetadataUtils';

import { capitalizeFirstLetter } from './capitalize-first-letter';
import { CRUD_ROUTE_ARGS } from './constants';
import { CRUD_POLICY } from './crud.policy';
import { Method } from './interface';
import { CrudLogger } from './provider/crud-logger';

import type {
    Column,
    CrudCreateRequest,
    CrudDeleteOneRequest,
    CrudOptions,
    CrudReadOneRequest,
    CrudRecoverRequest,
    CrudUpdateOneRequest,
    FactoryOption,
    PrimaryKey,
    EntityType,
} from './interface';
import type { CrudReadManyRequest } from './request';
import type { ExecutionContext } from '@nestjs/common';

export class CrudRouteFactory {
    private crudLogger: CrudLogger;
    private entity: {
        tableName: string;
        relations?: string[];
        primaryKeys?: PrimaryKey[];
        columns?: Column[];
    } = {
        tableName: '',
    };

    constructor(
        protected target: any,
        protected crudOptions: CrudOptions,
    ) {
        this.entityInformation(crudOptions.entity);

        this.crudLogger = new CrudLogger(crudOptions.logging);
    }

    init(): void {
        for (const method of Object.values(Method)) {
            if (!this.enabledMethod(method)) {
                continue;
            }
            this.createMethod(method);
        }
    }

    private entityInformation(entity: EntityType): void {
        const tableName = (() => {
            const table = getMetadataArgsStorage().tables.find(({ target }) => target === entity);

            if (!table) {
                throw new Error('Cannot find Table from TypeORM');
            }

            const namingStrategy = (tableName: string | undefined) => new DefaultNamingStrategy().tableName(entity.name, tableName);

            if (!table.name && table.type === 'entity-child') {
                const discriminatorValue = getMetadataArgsStorage().discriminatorValues.find(({ target }) => target === entity)?.value;
                return namingStrategy(typeof discriminatorValue === 'string' ? discriminatorValue : discriminatorValue?.name);
            }

            return namingStrategy(table.name);
        })();
        this.entity.tableName = tableName;

        const inheritanceTree = MetadataUtils.getInheritanceTree(entity as Function);
        const columnList = getMetadataArgsStorage().columns.filter(({ target }) => inheritanceTree.includes(target as Function));

        const entityColumns = columnList.map(({ propertyName, options }) => ({
            name: propertyName,
            type: options.type,
            isPrimary: Boolean(options.primary),
        }));

        this.entity.columns = entityColumns;

        const primaryKeys = entityColumns.filter(({ isPrimary }) => isPrimary);
        if (!(primaryKeys.length === 1 && primaryKeys[0].name === 'id')) {
            this.entity.primaryKeys = primaryKeys;
        }

        this.entity.relations = getMetadataArgsStorage().relations.flatMap(({ target, propertyName }) =>
            inheritanceTree.includes(target as Function) ? [propertyName] : [],
        );
    }

    protected get tableName(): string {
        return this.entity.tableName;
    }

    protected get targetPrototype() {
        return this.target.prototype;
    }

    protected readOne<T>(controllerMethodName: string): void {
        this.targetPrototype[controllerMethodName] = function reservedReadOne(crudReadOneRequest: CrudReadOneRequest<T>) {
            return this.crudService.reservedReadOne(crudReadOneRequest);
        };
    }

    protected readMany<T>(controllerMethodName: string): void {
        this.targetPrototype[controllerMethodName] = function reservedReadMany(crudReadManyRequest: CrudReadManyRequest<T>) {
            return this.crudService.reservedReadMany(crudReadManyRequest);
        };
    }

    protected search<T>(controllerMethodName: string): void {
        this.targetPrototype[controllerMethodName] = function reservedSearch(crudReadManyRequest: CrudReadManyRequest<T>) {
            return this.crudService.reservedReadMany(crudReadManyRequest);
        };
    }

    protected create<T>(controllerMethodName: string): void {
        this.targetPrototype[controllerMethodName] = function reservedCreate(crudCreateRequest: CrudCreateRequest<T>) {
            return this.crudService.reservedCreate(crudCreateRequest);
        };
    }

    protected upsert<T>(controllerMethodName: string): void {
        this.targetPrototype[controllerMethodName] = function reservedUpsert(crudCreateRequest: CrudCreateRequest<T>) {
            return this.crudService.reservedUpsert(crudCreateRequest);
        };
    }

    protected update<T>(controllerMethodName: string): void {
        this.targetPrototype[controllerMethodName] = function reservedUpdate(crudUpdateOneRequest: CrudUpdateOneRequest<T>) {
            return this.crudService.reservedUpdate(crudUpdateOneRequest);
        };
    }

    protected delete<T>(controllerMethodName: string): void {
        this.targetPrototype[controllerMethodName] = function reservedDelete(crudDeleteOneRequest: CrudDeleteOneRequest<T>) {
            return this.crudService.reservedDelete(crudDeleteOneRequest);
        };
    }

    protected recover<T>(controllerMethodName: string): void {
        this.targetPrototype[controllerMethodName] = function reservedRecover(crudRecoverRequest: CrudRecoverRequest<T>) {
            return this.crudService.reservedRecover(crudRecoverRequest);
        };
    }

    private createMethod(crudMethod: Method): void {
        if (crudMethod === Method.RECOVER) {
            const entityHasSoftDelete = this.entity.columns?.some(
                (column) => (column.name === 'deleted_at' || column.name === 'deletedAt') && column.type === 'timestamp',
            );
            if (!entityHasSoftDelete) {
                return;
            }
        }

        const methodName = this.writeMethodOnController(crudMethod);

        const targetMethod = this.targetPrototype[methodName];
        const path = this.crudOptions.routes?.[crudMethod]?.path;
        const methodNameOnController = this.controllerMethodName(crudMethod);
        const factoryOption: FactoryOption = {
            columns: this.entity.columns,
            relations: this.entity.relations ?? [],
            primaryKeys: this.entity.primaryKeys ?? [{ name: 'id', type: 'number' }],
            logger: this.crudLogger,
        };

        const needPagination = crudMethod === Method.READ_MANY || crudMethod === Method.SEARCH;

        if (needPagination) {
            this.validatePaginationKeys(this.crudOptions.routes?.[crudMethod]?.paginationKeys);
        }

        Reflect.defineMetadata(
            INTERCEPTORS_METADATA,
            [
                ...(this.crudOptions.routes?.[crudMethod]?.interceptors ?? []),
                CRUD_POLICY[crudMethod].interceptor(this.crudOptions, factoryOption),
            ].filter(Boolean),
            targetMethod,
        );

        const requestArg = this.createCrudRouteArg();
        Reflect.defineMetadata(ROUTE_ARGS_METADATA, requestArg, this.target, methodNameOnController);
        Reflect.defineMetadata(PARAMTYPES_METADATA, [Object], this.targetPrototype, methodNameOnController);

        if (crudMethod === Method.SEARCH) {
            Reflect.defineMetadata(HTTP_CODE_METADATA, HttpStatus.OK, targetMethod);
        }

        const customDecorators = this.crudOptions.routes?.[crudMethod]?.decorators ?? [];

        if (customDecorators.length > 0) {
            for (const decorator of customDecorators) {
                const descriptor = Reflect.getOwnPropertyDescriptor(targetMethod, methodNameOnController);
                (decorator as MethodDecorator | PropertyDecorator)(
                    targetMethod,
                    methodNameOnController,
                    descriptor ?? { value: targetMethod },
                );
            }
        }

        Reflect.defineMetadata(PATH_METADATA, path, targetMethod);
        Reflect.defineMetadata(METHOD_METADATA, CRUD_POLICY[crudMethod].method, targetMethod);
    }

    private validatePaginationKeys(paginationKeys: string[] | undefined) {
        if (!paginationKeys) {
            return;
        }

        for (const key of paginationKeys) {
            if (!this.entity.columns?.some((column) => column.name === key)) {
                throw new UnprocessableEntityException(`pagination key ${key} is unknown`);
            }
        }
    }

    private enabledMethod(crudMethod: Method): boolean {
        if (!this.crudOptions.routes) {
            return false;
        }
        return Object.keys(this.crudOptions.routes).includes(crudMethod);
    }

    private controllerMethodName(crudMethod: Method): string {
        return `reserved${capitalizeFirstLetter(crudMethod)}`;
    }

    private writeMethodOnController(crudMethod: Method): string {
        const entity = this.crudOptions.entity;
        const controllerMethodName: string = this.controllerMethodName(crudMethod);

        if (this.targetPrototype[controllerMethodName]) {
            throw new Error(`${controllerMethodName} is a reserved word. cannot use`);
        }
        this[crudMethod]<typeof entity>(controllerMethodName);
        return controllerMethodName;
    }

    private createCrudRouteArg(
        index = 0,
        /* istanbul ignore next */
        pipes: unknown[] = [],
        data = undefined,
    ) {
        return {
            [`${CRUD_ROUTE_ARGS}${CUSTOM_ROUTE_ARGS_METADATA}:${index}`]: {
                index,
                factory: (_: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest()[CRUD_ROUTE_ARGS],
                data,
                pipes,
            },
        };
    }
}
