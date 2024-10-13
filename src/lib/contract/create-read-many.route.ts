import _ from 'lodash';

import type { PaginationOffsetDto } from '../dto';
import type { ReadManyRouteOption } from './crud-contract.type';
import type { ContractPlainType, initContract } from '@ts-rest/core';
import type { EntityType, OffsetPaginationResponse } from 'src';

export function makeReadManyRoute<T extends EntityType>(
    options: Omit<ReadManyRouteOption, 'method' | 'path' | 'responses'>,
    contract: ReturnType<typeof initContract>,
    entity: T,
): ReadManyRouteOption {
    const opts = _.cloneDeep(options) as ReadManyRouteOption;
    opts.path = '/';
    opts.method = 'GET';
    opts.query = contract.type<PaginationOffsetDto>();
    opts.responses = {
        200: contract.type<OffsetPaginationResponse<typeof entity>>(),
        400: contract.type<{ message: string }>(),
    };
    return opts as ReadManyRouteOption & {
        path: '/';
        method: 'GET';
        query: ContractPlainType<PaginationOffsetDto>;
        responses: { 200: OffsetPaginationResponse<typeof entity>; 400: { message: string } };
    };
}
