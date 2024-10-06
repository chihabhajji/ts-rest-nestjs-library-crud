import type { Sort } from '../interface';
import type { QueryFilter } from '../interface/query-operation.interface';

export class RequestSearchDto<T> {
    select?: Array<keyof Partial<T>>;

    where?: Array<QueryFilter<T>>;

    order?: {
        [key in keyof Partial<T>]: Sort | `${Sort}`;
    };

    withDeleted?: boolean;

    take?: number;

    nextCursor?: string;

    limit?: number;

    offset?: number;
}
