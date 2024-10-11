import { RequestMethod } from '@nestjs/common';

import { ReadOneRequestInterceptor, CreateRequestInterceptor } from './interceptor';
import { DeleteRequestInterceptor } from './interceptor/delete-request.interceptor';
import { ReadManyRequestInterceptor } from './interceptor/read-many-request.interceptor';
import { RecoverRequestInterceptor } from './interceptor/recover-request.interceptor';
import { SearchRequestInterceptor } from './interceptor/search-request.interceptor';
import { UpdateRequestInterceptor } from './interceptor/update-request.interceptor';
import { UpsertRequestInterceptor } from './interceptor/upsert-request.interceptor';
import { Method, Sort } from './interface';

import type { CrudOptions, FactoryOption } from './interface';
import type { NestInterceptor, Type } from '@nestjs/common';

type CrudMethodPolicy = {
    [Method.READ_ONE]: MethodPolicy<Method.READ_ONE>;
    [Method.SEARCH]: MethodPolicy<Method.SEARCH>;
    [Method.READ_MANY]: MethodPolicy<Method.READ_MANY>;
    [Method.CREATE]: MethodPolicy<Method.CREATE>;
    [Method.UPDATE]: MethodPolicy<Method.UPDATE>;
    [Method.DELETE]: MethodPolicy<Method.DELETE>;
    [Method.UPSERT]: MethodPolicy<Method.UPSERT>;
    [Method.RECOVER]: MethodPolicy<Method.RECOVER>;
};
type MethodPolicy<T extends Method> = {
    method: RequestMethod; // Method (Get, Post, Patch ...)
    useBody: boolean; // included body
    interceptor: (crudOptions: CrudOptions, factoryOption: FactoryOption) => Type<NestInterceptor>;
    default: T extends Method.READ_ONE | Method.DELETE
        ? DefaultOptionsReadOne
        : T extends Method.READ_MANY | Method.SEARCH
          ? DefaultOptionsReadMany
          : DefaultOptions;
};
interface DefaultOptions {}
interface DefaultOptionsReadOne extends DefaultOptions {
    softDeleted: boolean;
}
interface DefaultOptionsReadMany extends DefaultOptionsReadOne {
    numberOfTake: number;
    sort: Sort;
}
/**
 * Basic Policy by method
 */
export const CRUD_POLICY: CrudMethodPolicy = {
    [Method.READ_ONE]: {
        method: RequestMethod.GET,
        useBody: false,
        interceptor: (crudOptions: CrudOptions, factoryOption: FactoryOption) => ReadOneRequestInterceptor(crudOptions, factoryOption),
        default: {
            softDeleted: false,
        },
    },
    [Method.SEARCH]: {
        method: RequestMethod.POST,
        useBody: true,
        interceptor: (crudOptions: CrudOptions, factoryOption: FactoryOption) => SearchRequestInterceptor(crudOptions, factoryOption),

        default: {
            numberOfTake: 20,
            softDeleted: false,
            sort: Sort.DESC,
        },
    },
    [Method.READ_MANY]: {
        method: RequestMethod.GET,
        useBody: false,
        interceptor: (crudOptions: CrudOptions, factoryOption: FactoryOption) => ReadManyRequestInterceptor(crudOptions, factoryOption),
        default: {
            numberOfTake: 20,
            sort: Sort.DESC,
            softDeleted: false,
        },
    },
    [Method.CREATE]: {
        method: RequestMethod.POST,
        useBody: true,
        interceptor: (crudOptions: CrudOptions, factoryOption: FactoryOption) => CreateRequestInterceptor(crudOptions, factoryOption),
        default: {},
    },
    [Method.UPSERT]: {
        method: RequestMethod.PUT,
        useBody: true,
        interceptor: (crudOptions: CrudOptions, factoryOption: FactoryOption) => UpsertRequestInterceptor(crudOptions, factoryOption),
        default: {},
    },
    [Method.UPDATE]: {
        method: RequestMethod.PATCH,
        useBody: true,
        interceptor: (crudOptions: CrudOptions, factoryOption: FactoryOption) => UpdateRequestInterceptor(crudOptions, factoryOption),

        default: {},
    },
    [Method.DELETE]: {
        method: RequestMethod.DELETE,
        useBody: false,
        interceptor: (crudOptions: CrudOptions, factoryOption: FactoryOption) => DeleteRequestInterceptor(crudOptions, factoryOption),
        default: {
            softDeleted: true,
        },
    },
    [Method.RECOVER]: {
        method: RequestMethod.POST,
        useBody: false,
        interceptor: (crudOptions: CrudOptions, factoryOption: FactoryOption) => RecoverRequestInterceptor(crudOptions, factoryOption),
        default: {},
    },
};
