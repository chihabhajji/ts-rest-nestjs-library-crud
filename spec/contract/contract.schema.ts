import { z } from 'zod';

export const contractContract = z.object({
    _id: z.string(),
    name: z.string(),
    col2: z.object({
        a: z.number(),
    }),
    col3: z.object({
        a: z.string(),
        b: z.string(),
    }),
});
