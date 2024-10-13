import type { Method, RouteBaseOption, SaveOptions, Sort, WithAuthor } from '../interface';
import type { AppRouteMutation, AppRouteQuery, AppRouteDeleteNoBody } from '@ts-rest/core';

export type ReadOneRouteOption = AppRouteQuery &
    RouteBaseOption & {
        /**
         * If set to true, soft-deleted entity could be included in the result.
         * @default false
         */
        softDelete?: boolean;
        /**
         * @default false
         */
        relations?: false | string[];
    };

export type ReadManyRouteOption = AppRouteQuery &
    RouteBaseOption & {
        /**
         * Way to order the result
         * @default Sort.ASC
         */
        sort?: Sort | `${Sort}`;
        /**
         * Max number of entities should be taken.
         * @default 100
         */
        numberOfTake?: number;
        /**
         * What relations of entity should be loaded.
         * If set to false or an empty array, no relations will be loaded.
         * @default false
         */
        relations?: false | string[];
        /**
         * If set to true, soft-deleted entity could be included in the result.
         * @default true
         */
        softDelete?: boolean;
        /**
         * Keys to use for pagination.
         * If not set, the keys will be taken from the entity's primary keys.
         */
        paginationKeys?: string[];
    };

export type SearchRouteOption = AppRouteMutation &
    RouteBaseOption & {
        /**
         * Default number of entities should be taken. See `crud.policy.ts` for more details.
         * @default 20
         */
        numberOfTake?: number;
        /**
         * Max number of entities should be taken. See `crud.policy.ts` for more details.
         * @default 100
         */
        limitOfTake?: number;
        /**
         * What relations of entity should be loaded. If set to false or an empty array, no relations will be loaded. See `crud.policy.ts` for more details.
         * @default false
         */
        relations?: false | string[];
        /**
         * If set to true, soft-deleted entity could be included in the result. See `crud.policy.ts` for more details.
         * @default true
         */
        softDelete?: boolean;
        /**
         * Keys to use for pagination.
         * If not set, the keys will be taken from the entity's primary keys.
         */
        paginationKeys?: string[];
    };

export type CreateRouteOption = AppRouteMutation & RouteBaseOption & SaveOptions & WithAuthor;
export type UpdateRouteOption = AppRouteMutation & RouteBaseOption & SaveOptions & WithAuthor;

export type DeleteRouteOption = AppRouteDeleteNoBody &
    RouteBaseOption &
    SaveOptions &
    WithAuthor & {
        /**
         * If set to true, the entity will be soft deleted. (Records the delete date of the entity)
         * @default true
         */
        softDelete?: boolean;
    };

export type UpsertRouteOption = AppRouteMutation & RouteBaseOption & SaveOptions & WithAuthor;
export type RecoverRouteOption = Omit<AppRouteMutation, 'method'> & { method: 'POST' } & RouteBaseOption & SaveOptions & WithAuthor;

export type CrudContract = {
    [Method.READ_ONE]?: ReadOneRouteOption;
    [Method.READ_MANY]?: ReadManyRouteOption;
    [Method.DELETE]?: DeleteRouteOption;
    [Method.SEARCH]?: SearchRouteOption;
    [Method.CREATE]?: CreateRouteOption;
    [Method.UPDATE]?: UpdateRouteOption;
    [Method.UPSERT]?: UpsertRouteOption;
    [Method.RECOVER]?: RecoverRouteOption;
};
