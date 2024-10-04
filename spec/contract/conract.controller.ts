import { Controller, Req, UseInterceptors } from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { ObjectId } from 'mongodb';

import { contractContract } from './contract.contract';
import { ContractEntity } from './contract.entity';
import { CreateRequestInterceptor } from './contract.interceptor';
import { ContractTestService } from './contract.service';
import { CrudController, CrudLogger, doStuff } from '../../src';

// @Crud({ entity: ContractEntity, only: ['readMany'] })
@Controller()
export class ContractTestController implements CrudController<ContractEntity> {
    constructor(public readonly crudService: ContractTestService) {}

    @UseInterceptors(CreateRequestInterceptor())
    @TsRestHandler(contractContract, { jsonQuery: true })
    async handler(@Req() req: Request) {
        return tsRestHandler(contractContract, {
            readOne: async ({ params }) => {
                const post = await this.crudService.reservedReadOne({ params: { _id: new ObjectId(params._id) }, relations: [] });

                if (!post) {
                    return { status: 404 as const, body: null };
                }

                return { status: 200 as const, body: post };
            },
            readMany: async () => {
                const readManyRequest = await doStuff<ContractEntity>(
                    req,
                    {
                        entity: ContractEntity,
                        routes: {
                            readMany: {
                                relations: [],
                            },
                        },
                    },
                    {
                        relations: [] as string[],
                        primaryKeys: [
                            {
                                name: '_id',
                                // type: ObjectId,
                            },
                        ],
                        logger: new CrudLogger(),
                    },
                );
                const response = await this.crudService.reservedReadMany(readManyRequest);
                return { status: 200 as const, body: response as any };
            },
            create: async ({ body }) => {
                return {
                    status: 201 as const,
                    body: await this.crudService
                        .reservedCreate({
                            body,
                            exclude: [] as unknown as Set<string>,
                        })
                        .then((x) => x as ContractEntity),
                };
            },
            update: async ({ params, body }) => {
                try {
                    const post = await this.crudService.reservedUpdate({
                        params: { _id: params._id },
                        body: body,
                        exclude: [] as unknown as Set<string>,
                        saveOptions: { listeners: false },
                    });
                    if (!post) {
                        return { status: 404 as const };
                    }
                    return { status: 200 as const, body: post };
                } catch {
                    return { status: 400 as const };
                }
            },
        });
    }
}
