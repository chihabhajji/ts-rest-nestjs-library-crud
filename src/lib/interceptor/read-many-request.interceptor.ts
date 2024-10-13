import { mixin, UnprocessableEntityException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import _ from 'lodash';

import { RequestAbstractInterceptor } from '../abstract';
import { CRUD_ROUTE_ARGS, CUSTOM_REQUEST_OPTIONS } from '../constants';
import { CRUD_POLICY } from '../crud.policy';
import { Method, Sort, GROUP } from '../interface';
import { PaginationHelper } from '../provider';
import { CrudReadManyRequest } from '../request';

import type { ReadManyRouteOption } from '../contract';
import type { CustomReadManyRequestOptions } from './custom-request.interceptor';
import type { CrudOptions, FactoryOption, EntityType } from '../interface';
import type { CallHandler, ExecutionContext, NestInterceptor, Type } from '@nestjs/common';
import type { ClassConstructor } from 'class-transformer';
import type { Request } from 'express';
import type { Observable } from 'rxjs';
import type { FindOptionsWhere } from 'typeorm';

const method = Method.READ_MANY;
export function ReadManyRequestInterceptor(crudOptions: CrudOptions, factoryOption: FactoryOption): Type<NestInterceptor> {
    class MixinInterceptor extends RequestAbstractInterceptor implements NestInterceptor {
        constructor() {
            super(factoryOption.logger);
        }

        async intercept(context: ExecutionContext, next: CallHandler<unknown>): Promise<Observable<unknown>> {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const req: Record<string, any> = context.switchToHttp().getRequest<Request>();
            const readManyOptions: Omit<ReadManyRouteOption, 'path' | 'responses' | 'method'> = crudOptions.routes?.[method] ?? {};

            const customReadManyRequestOptions: CustomReadManyRequestOptions = req[CUSTOM_REQUEST_OPTIONS];

            if (Object.keys(req.params ?? {}).length > 0) {
                Object.assign(req.query, req.params);
            }

            const pagination = PaginationHelper.getPaginationRequest(req.query);

            const withDeleted = _.isBoolean(customReadManyRequestOptions?.softDeleted)
                ? customReadManyRequestOptions.softDeleted
                : (crudOptions.routes?.[method]?.softDelete ?? CRUD_POLICY[method].default.softDeleted);

            const query = await (async () => {
                if (PaginationHelper.isNextPage(pagination)) {
                    const isQueryValid = pagination.setQuery(pagination.query);
                    if (isQueryValid) {
                        return {};
                    }
                }
                const query = await this.validateQuery(req.query);
                pagination.setWhere(PaginationHelper.serialize(query));
                return query;
            })();
            const paginationKeys = readManyOptions.paginationKeys ?? factoryOption.primaryKeys.map(({ name }) => name);
            const numberOfTake = pagination.limit ?? readManyOptions.numberOfTake ?? CRUD_POLICY[method].default.numberOfTake;
            const sort = readManyOptions.sort ? Sort[readManyOptions.sort] : CRUD_POLICY[method].default.sort;

            const crudReadManyRequest: CrudReadManyRequest<typeof crudOptions.entity> = new CrudReadManyRequest<typeof crudOptions.entity>()
                .setPaginationKeys(paginationKeys)
                .setExcludeColumn(readManyOptions.exclude)
                .setPagination(pagination)
                .setWithDeleted(withDeleted)
                .setWhere(query)
                .setTake(numberOfTake)
                .setSort(sort)
                .setRelations(this.getRelations(customReadManyRequestOptions))
                .setDeserialize(this.deserialize)
                .generate();

            this.crudLogger.logRequest(req, crudReadManyRequest.toString());
            req[CRUD_ROUTE_ARGS] = crudReadManyRequest;

            return next.handle();
        }

        async validateQuery(query: Record<string, unknown>) {
            if (_.isNil(query)) {
                return {};
            }

            if ('limit' in query) {
                delete query.limit;
            }
            if ('offset' in query) {
                delete query.offset;
            }
            if ('nextCursor' in query) {
                delete query.nextCursor;
            }

            const transformed = plainToInstance(crudOptions.entity as ClassConstructor<EntityType>, query, {
                groups: [GROUP.READ_MANY],
            });
            const errorList = await validate(transformed, {
                groups: [GROUP.READ_MANY],
                whitelist: true,
                forbidNonWhitelisted: true,
                stopAtFirstError: true,
                forbidUnknownValues: false,
            });

            if (errorList.length > 0) {
                this.crudLogger.log(errorList, 'ValidationError');
                throw new UnprocessableEntityException(errorList);
            }
            return transformed;
        }

        getRelations(customReadManyRequestOptions: CustomReadManyRequestOptions): string[] {
            if (Array.isArray(customReadManyRequestOptions?.relations)) {
                return customReadManyRequestOptions.relations;
            }
            if (crudOptions.routes?.[method]?.relations === false) {
                return [];
            }
            if (crudOptions.routes?.[method] && Array.isArray(crudOptions.routes?.[method]?.relations)) {
                return crudOptions.routes[method].relations;
            }
            return factoryOption.relations;
        }

        deserialize<T>({ pagination }: CrudReadManyRequest<T>): FindOptionsWhere<T> {
            return PaginationHelper.deserialize(pagination.where);
        }
    }

    return mixin(MixinInterceptor);
}

function deserialize<T>({ pagination }: CrudReadManyRequest<T>): FindOptionsWhere<T> {
    return PaginationHelper.deserialize(pagination.where);
}
async function validateQuery<T>(query: Record<string, unknown>, entity: T) {
    if (_.isNil(query)) {
        return {};
    }

    if ('limit' in query) {
        delete query.limit;
    }
    if ('offset' in query) {
        delete query.offset;
    }
    if ('nextCursor' in query) {
        delete query.nextCursor;
    }

    const transformed = plainToInstance(entity as ClassConstructor<EntityType>, query, {
        groups: [GROUP.READ_MANY],
    });
    const errorList = await validate(transformed, {
        groups: [GROUP.READ_MANY],
        whitelist: true,
        forbidNonWhitelisted: true,
        stopAtFirstError: true,
        forbidUnknownValues: false,
    });

    if (errorList.length > 0) {
        throw new UnprocessableEntityException(errorList);
    }
    return transformed;
}

function getRelations(
    customReadManyRequestOptions: CustomReadManyRequestOptions,
    crudOptions: CrudOptions,
    factoryOption: FactoryOption,
): string[] {
    if (Array.isArray(customReadManyRequestOptions?.relations)) {
        return customReadManyRequestOptions.relations;
    }
    if (crudOptions.routes?.[method]?.relations === false) {
        return [];
    }
    if (crudOptions.routes?.[method] && Array.isArray(crudOptions.routes?.[method]?.relations)) {
        return crudOptions.routes[method].relations;
    }
    return factoryOption.relations;
}

export async function doStuff<T extends EntityType>(
    req: Record<string, any>,
    crudOptions: CrudOptions,
    factoryOption: FactoryOption,
): Promise<CrudReadManyRequest<T>> {
    const readManyOptions: Omit<ReadManyRouteOption, 'path' | 'responses' | 'method'> = crudOptions.routes?.[method] ?? {};

    const customReadManyRequestOptions: CustomReadManyRequestOptions = req[CUSTOM_REQUEST_OPTIONS];

    if (Object.keys(req.params ?? {}).length > 0) {
        Object.assign(req.query, req.params);
    }

    const pagination = PaginationHelper.getPaginationRequest(req.query);

    const withDeleted = _.isBoolean(customReadManyRequestOptions?.softDeleted)
        ? customReadManyRequestOptions.softDeleted
        : (crudOptions.routes?.[method]?.softDelete ?? CRUD_POLICY[method].default.softDeleted);

    const query = await (async () => {
        if (PaginationHelper.isNextPage(pagination)) {
            const isQueryValid = pagination.setQuery(pagination.query);
            if (isQueryValid) {
                return {};
            }
        }
        const query = await validateQuery(req.query, crudOptions.entity);
        pagination.setWhere(PaginationHelper.serialize(query));
        return query;
    })();
    const paginationKeys = readManyOptions.paginationKeys ?? factoryOption.primaryKeys.map(({ name }) => name);
    const numberOfTake = pagination.limit ?? readManyOptions.numberOfTake ?? CRUD_POLICY[method].default.numberOfTake;
    const sort = readManyOptions.sort ? Sort[readManyOptions.sort] : CRUD_POLICY[method].default.sort;

    const crudReadManyRequest: CrudReadManyRequest<T> = new CrudReadManyRequest<T>()
        .setPaginationKeys(paginationKeys)
        .setExcludeColumn(readManyOptions.exclude)
        .setPagination(pagination)
        .setWithDeleted(withDeleted)
        .setWhere(query as FindOptionsWhere<T> & Partial<T>)
        .setTake(numberOfTake)
        .setSort(sort)
        .setRelations(getRelations(customReadManyRequestOptions, crudOptions, factoryOption))
        .setDeserialize(deserialize)
        .generate();

    req[CRUD_ROUTE_ARGS] = crudReadManyRequest;

    return crudReadManyRequest;
}
