import type { AppRouteDeleteNoBody, AppRouteMutation, AppRouteQuery } from '@ts-rest/core';

export type CrudContract = {
    readOne?: AppRouteQuery;
    readMany?: AppRouteQuery;
    search?: Omit<AppRouteMutation, 'method'> & { method: 'POST' };
    create?: AppRouteMutation;
    update?: AppRouteMutation;
    upsert?: AppRouteMutation;
    delete?: AppRouteDeleteNoBody;
    recover?: AppRouteMutation;
};
