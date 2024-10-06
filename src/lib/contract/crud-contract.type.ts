import type { AppRouteDeleteNoBody, AppRouteMutation, AppRouteQuery } from '@ts-rest/core';

export type CrudContract = {
    search?: AppRouteQuery;
    readOne?: AppRouteQuery;
    readMany?: AppRouteQuery;
    create?: AppRouteMutation;
    update?: AppRouteMutation;
    upsert?: AppRouteMutation;
    delete?: AppRouteDeleteNoBody;
    recover?: AppRouteMutation;
};
