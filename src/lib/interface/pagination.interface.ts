import type { PaginationAbstractResponse } from '../abstract';
import type { PaginationOffsetDto } from '../dto/pagination-offset.dto';

export interface OffsetPaginationResponse<T> extends PaginationAbstractResponse<T> {
    metadata: {
        /**
         * Current page number
         */
        page: number;
        /**
         * Total page count
         */
        pages: number;
        /**
         * Total data count
         */
        total: number;
        /**
         * Maximum number of data on a page
         */
        offset: number;
        /**
         * cursor token for next page
         */
        nextCursor: string;
    };
}

export type PaginationRequest = PaginationOffsetDto;

export type PaginationResponse<T> = OffsetPaginationResponse<T>;
