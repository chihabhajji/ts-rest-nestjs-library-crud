import type { Method, Sort, PaginationType, Author, EntityType } from '.';
import type { NestInterceptor, Type } from '@nestjs/common';
import type { AppRouteDeleteNoBody, AppRouteMutation, AppRouteQuery } from '@ts-rest/core';
import type { ColumnType } from 'typeorm';

interface RouteBaseOption {
    /**
     * An array of decorators to apply to the route handler
     */
    decorators?: Array<PropertyDecorator | MethodDecorator>;
    /**
     * An array of interceptors to apply to the route handler
     */
    interceptors?: Array<Type<NestInterceptor>>;
    /**
     * Configures the keys of entity to exclude from the route's response
     */
    exclude?: string[];
}

export interface SaveOptions {
    /**
     * Indicates if listeners and subscribers are called for this operation.
     * By default they are enabled, you can disable them by setting `{ listeners: false }` in save/remove options.
     * refer to typeorm’s save option.
     */
    listeners?: boolean;
}

export interface PrimaryKey {
    name: string;
    type?: ColumnType;
}
interface WithAuthor {
    /**
     * Configures ways to save author information to the Entity after the operation completed.
     * It updates Entity's `author.property` field with respect to the value of `author.filter` from express's Request object.
     * If `author.filter` is not found in the Request object, author.value will be used as default.
     */
    author?: Author;
}

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
    Omit<RouteBaseOption, 'response'> & {
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

export type SearchRouteOption = AppRouteQuery &
    RouteBaseOption & {
        /**
         * Type of pagination to use. Currently 'offset' and 'cursor' are supported.
         * @default PaginationType.CURSOR
         */
        paginationType?: PaginationType | `${PaginationType}`;
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
export type RecoverRouteOption = AppRouteMutation & RouteBaseOption & SaveOptions & WithAuthor;
/**
 * See `crud.policy.ts` to check default values.
 */
export interface CrudOptions {
    /**
     * Entity class which CRUD operations will be performed
     */
    entity: EntityType;

    /**
     * enable Debug logging
     * @default false
     */
    logging?: boolean;

    /**
     * Configures each CRUD method
     */
    routes?: {
        [Method.READ_ONE]?: ReadOneRouteOption;
        [Method.READ_MANY]?: ReadManyRouteOption;
        [Method.SEARCH]?: SearchRouteOption;
        [Method.CREATE]?: CreateRouteOption;
        [Method.UPDATE]?: UpdateRouteOption;
        [Method.DELETE]?: DeleteRouteOption;
        [Method.UPSERT]?: UpsertRouteOption;
        [Method.RECOVER]?: RecoverRouteOption;
    };
}
