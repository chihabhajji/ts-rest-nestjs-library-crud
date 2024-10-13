import type { Author, EntityType } from '.';
import type { CrudContract } from '../contract';
import type { NestInterceptor, Type } from '@nestjs/common';
import type { ColumnType } from 'typeorm';

export interface RouteBaseOption {
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
export interface WithAuthor {
    /**
     * Configures ways to save author information to the Entity after the operation completed.
     * It updates Entity's `author.property` field with respect to the value of `author.filter` from express's Request object.
     * If `author.filter` is not found in the Request object, author.value will be used as default.
     */
    author?: Author;
}

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
    routes?: CrudContract;
}
