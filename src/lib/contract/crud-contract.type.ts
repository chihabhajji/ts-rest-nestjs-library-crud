// import { type AppRouteQuery } from '@ts-rest/core';
// import { z } from 'zod';
//
// import type { ObjectLiteral } from 'typeorm';
// import type { ZodString } from 'zod';
export const a = '';
// //
// export type CrudContract = {
//     // search?: AppRouteQuery;
//     readOne?: AppRouteQuery;
//     // readMany?: AppRouteQuery;
//     // create?: AppRouteMutation;
//     // update?: AppRouteMutation;
//     // upsert?: AppRouteMutation;
//     // delete?: AppRouteDeleteNoBody;
//     // recover?: AppRouteMutation;
// };
//
// export function makeReadOneRouteContract<TEntity extends ObjectLiteral>(
//     validResponse: z.ZodObject<TEntity & { _id: ZodString }, 'strip'>,
// ): { readOne: AppRouteQuery } {
//     return {
//         readOne: {
//             method: 'GET',
//             path: '/',
//             responses: {
//                 200: validResponse,
//                 400: z.object({
//                     message: z.string(),
//                 }),
//                 500: z.object({
//                     message: z.string(),
//                 }),
//             },
//             strictStatusCodes: true,
//             summary: 'Read one entity',
//             pathParams: z.object({
//                 _id: z.string(),
//             }),
//         },
//     } as const;
// }
//
// export function makeReadManyRouteContract<TEntity extends ObjectLiteral>(validResponse: z.ZodArray<TEntity>): { readMany: AppRouteQuery } {
//     return {
//         readMany: {
//             method: 'GET',
//             path: '/',
//             responses: {
//                 200: validResponse,
//                 400: z.object({
//                     message: z.string(),
//                 }),
//                 500: z.object({
//                     message: z.string(),
//                 }),
//             },
//             strictStatusCodes: true,
//             summary: 'Read one entity',
//             pathParams: z.object({
//                 _id: z.string(),
//             }),
//         },
//     } as const;
// }
