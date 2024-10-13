/* eslint-disable max-classes-per-file */
import type { Sort } from '../interface';
import type { QueryFilter } from '../interface/query-operation.interface';

export class AbstractSearchDto<T> {
    select?: Array<keyof Partial<T>>;

    order?: {
        [key in keyof Partial<T>]: Sort | `${Sort}`;
    };

    withDeleted?: boolean;

    take?: number;

    nextCursor?: string;

    limit?: number;

    offset?: number;
}

export class RequestSearchDto<T> extends AbstractSearchDto<T> {
    where?: Array<QueryFilter<T>>;
}

export class RequestReadManyDto<T> extends RequestSearchDto<T> {}
