import { ContractNoBody, initContract } from '@ts-rest/core';
import { z } from 'zod';

import type { ContractEntity } from './contract.entity';
import type { BaseEntity } from 'spec/base/base.entity';
import type { CrudSearchRequest } from 'src';
import type { PaginationOffsetRequestDto } from 'src/lib/dto';
import type { DeepPartial } from 'typeorm';

const c = initContract();

export const contractContract = c.router(
    {
        readMany: {
            method: 'GET',
            path: '/',
            query: c.type<PaginationOffsetRequestDto>(),
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
        search: {
            method: 'POST',
            path: '/search',
            body: c.type<CrudSearchRequest<ContractEntity>>(),
            responses: {
                200: c.type<{
                    metadata: { total: number; nextCursor: string; page: number; pages: number; offset: number };
                    data: ContractEntity[];
                }>(),
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
        delete: {
            method: 'DELETE',
            path: '/:_id',
            responses: {
                200: c.type<ContractEntity>(),
                404: ContractNoBody,
            },
        },

        recover: {
            method: 'PATCH',
            path: '/:_id/recover',
            responses: { 200: ContractNoBody },
            body: ContractNoBody,
        },

        upsert: {
            method: 'PUT',
            path: '/:_id/upsert',
            responses: {
                200: c.type<ContractEntity>(),
            },
            body: c.type<DeepPartial<Omit<ContractEntity, '_id'> & { _id: string }>>(),
            pathParams: z.object({ _id: z.string().optional() }),
        },
    },
    {
        pathPrefix: '/contract',
    },
);
