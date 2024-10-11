import { ContractNoBody, initContract } from '@ts-rest/core';
import { z } from 'zod';

import type { CrudSearchRequest } from 'src';
import type { PaginationOffsetRequestDto } from 'src/lib/dto';
import type { BaseEntity, DeepPartial } from 'typeorm';

const c = initContract();

export const baseContract = c.router({
    readMany: {
        method: 'GET',
        path: '/',
        query: c.type<PaginationOffsetRequestDto>(),
        responses: {
            200: c.type<{
                data: BaseEntity[];
                metadata: { total: number; nextCursor: string; page: number; pages: number; offset: number };
            }>(),
            404: ContractNoBody,
        },
    },
    readOne: {
        method: 'GET',
        path: '/:id',
        pathParams: z.object({ id: z.string() }),
        responses: {
            200: c.type<BaseEntity>(),
        },
    },
    search: {
        method: 'POST',
        path: '/search',
        body: c.type<CrudSearchRequest<BaseEntity>>(),
        responses: {
            200: c.type<{
                metadata: { total: number; nextCursor: string; page: number; pages: number; offset: number };
                data: BaseEntity[];
            }>(),
        },
    },
    create: {
        method: 'POST',
        path: '/',
        body: c.type<Omit<BaseEntity, 'id' | keyof BaseEntity>>(),
        responses: {
            400: c.type<{ message: string }>(),
            201: c.type<BaseEntity>(),
        },
    },
    update: {
        method: 'PATCH',
        path: '/:id',
        pathParams: z.object({ id: z.string() }),
        body: c.type<DeepPartial<Omit<BaseEntity, 'id' | keyof BaseEntity>>>(),
        responses: {
            200: c.type<BaseEntity>(),
            400: ContractNoBody,
        },
    },
    delete: {
        method: 'DELETE',
        path: '/:id',
        responses: {
            200: c.type<BaseEntity>(),
            404: ContractNoBody,
        },
    },

    recover: {
        method: 'POST',
        path: '/:id/recover',
        responses: { 200: ContractNoBody },
        body: ContractNoBody,
    },

    upsert: {
        method: 'PUT',
        path: '/:id',
        responses: {
            200: c.type<BaseEntity>(),
        },
        body: c.type<DeepPartial<Omit<BaseEntity, 'id'> & { id: string }>>(),
        pathParams: z.object({ id: z.string().optional() }),
    },
});
