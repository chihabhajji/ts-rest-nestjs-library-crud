import type { AppRoute, AppRouteMutation, AppRouteQuery } from '@ts-rest/core';

export type CrudContract = {
    readOne?: AppRouteQuery;
    readMany?: AppRouteQuery;
    delete?: Omit<AppRoute, 'method'> & { method: 'DELETE'};
    search?: Omit<AppRouteMutation, 'method'> & { method: 'POST' };
    create?: Omit<AppRouteMutation, 'method'> & { method: 'POST'};
    update?: Omit<AppRouteMutation, 'method'> & {method: 'PATCH'};
    upsert?: Omit<AppRouteMutation, 'method'> & { method: 'PUT'};
    recover?: Omit<AppRouteMutation, 'method'> & {method: 'PATCH'};
};
