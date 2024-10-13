/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { ContractNoBody, type initContract } from '@ts-rest/core';
import _ from 'lodash';

import type { RequestReadManyDto } from '../dto';
import type { ReadManyRouteOption } from './crud-contract.type';
import type { EntityType } from '../interface/entity';
import type { OffsetPaginationResponse } from '../interface/pagination.interface';

export function makeReadManyRoute<T extends EntityType>(
    contract: ReturnType<typeof initContract>,
    options?: Partial<Omit<ReadManyRouteOption, 'method' | 'path' | 'responses' | 'query' | 'params'>>,
) {
    const opts = _.cloneDeep(options ?? {}) as ReadManyRouteOption;

    return {
        description: 'Read many' as const,
        ...opts,
        query: contract.type<RequestReadManyDto<T>>(),
        path: '/',
        method: 'GET',
        responses: {
            200: contract.type<OffsetPaginationResponse<T>>(),
            400: contract.type<{ message: string }>(),
        },
        params: ContractNoBody,
    } as const;
}
