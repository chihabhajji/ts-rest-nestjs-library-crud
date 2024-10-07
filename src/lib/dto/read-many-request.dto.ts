import type { PaginationOffsetDto } from './pagination-offset.dto';

type NonFunctionPropertyNames<T> = {
    // eslint-disable-next-line @typescript-eslint/ban-types
    [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

export type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

export type PaginationRequest<T> = NonFunctionProperties<PaginationOffsetDto> & Partial<T>;
export type SearchRequest<T> = PaginationRequest<T>;
