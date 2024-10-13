/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { type initContract } from '@ts-rest/core';
import _ from 'lodash';

import type { RequestReadManyDto } from '../dto';
import type { ReadManyRouteOption, ReadOneRouteOption } from './crud-contract.type';
import type { EntityType } from '../interface/entity';
import type { OffsetPaginationResponse } from '../interface/pagination.interface';

export function makeReadManyRoute<
    TEntity extends EntityType,
    const TOptions extends Omit<ReadManyRouteOption, 'method' | 'path' | 'responses' | 'query' | 'pathParams'>,
>(contract: ReturnType<typeof initContract>, options: TOptions) {
    return {
        ...(options as typeof options),
        description: 'Read many' as const,
        query: contract.type<RequestReadManyDto<TEntity>>(),
        path: '/',
        method: 'GET',
        responses: {
            200: contract.type<OffsetPaginationResponse<TEntity>>(),
            400: contract.type<{ message: string }>(),
        },
        pathParams: null,
    } as const;
}

export function makeReadOneRoute<
    TEntity extends EntityType,
    const TOptions extends Omit<ReadOneRouteOption, 'method' | 'path' | 'responses' | 'query'>,
>(contract: ReturnType<typeof initContract>, options: TOptions) {
    return {
        ...(options as typeof options),
        description: 'Read many' as const,
        query: contract.type<RequestReadManyDto<TEntity>>(),
        path: '/',
        method: 'GET',
        responses: {
            200: contract.type<TEntity>(),
            400: contract.type<{ message: string }>(),
        },
    } as const;
}
