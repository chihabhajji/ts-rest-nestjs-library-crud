import { ContractNoBody, initContract } from '@ts-rest/core';
import { z } from 'zod';

import type { ContractEntity } from './contract.entity';
import type { BaseEntity } from 'spec/base/base.entity';
import type { CrudReadManyRequest } from 'src/lib/request';
import type { DeepPartial } from 'typeorm';

const c = initContract();
type NonFunctionPropertyNames<T> = {
    // eslint-disable-next-line @typescript-eslint/ban-types
    [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;
export const contractContract = c.router(
    {
        readMany: {
            method: 'GET',
            path: '/',
            query: c.type<NonFunctionProperties<CrudReadManyRequest<ContractEntity>>>(),
            responses: {
                200: c.type<{
                    data: ContractEntity[];
                    metadata: { total: number; nextCursor: string; page: number; pages: number; offset: number };
                }>(),
                404: ContractNoBody,
            },
        },
        readOne: {
            method: 'GET',
            path: '/:_id',
            pathParams: z.object({ _id: z.string() }),
            responses: {
                200: c.type<ContractEntity>(),
            },
        },
        create: {
            method: 'POST',
            path: '/',
            body: c.type<Omit<ContractEntity, '_id' | keyof BaseEntity>>(),
            responses: {
                400: c.type<{ message: string }>(),
                201: c.type<ContractEntity>(),
            },
        },
        update: {
            method: 'PATCH',
            path: '/:_id',
            pathParams: z.object({ _id: z.string() }),
            body: c.type<DeepPartial<Omit<ContractEntity, '_id' | keyof BaseEntity>>>(),
            responses: {
                200: c.type<ContractEntity>(),
                400: ContractNoBody,
            },
        },
    },
    {
        pathPrefix: '/base',
    },
);
