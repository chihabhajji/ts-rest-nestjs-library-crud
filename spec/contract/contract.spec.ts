import { HttpStatus, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { TestHelper } from '../test.helper';
import { contractClient } from './contract.client';
import { ContractEntity } from './contract.entity';
import { ContractTestService } from './contract.service';
import { ContractTestModule } from './controller.module';

import type { NestExpressApplication } from '@nestjs/platform-express';
import type { TestingModule } from '@nestjs/testing';

describe('ContractCreation', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                ContractTestModule,
                TestHelper.getTypeOrmMongoModule(
                    'mongodb+srv://chihab:idBTvrpU0Pba2rhd@cluster0.4eh6xyz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
                    [ContractEntity],
                ),
            ],
        }).compile();
        app = moduleFixture.createNestApplication<NestExpressApplication>();
        // await app.init();
        const crudService = app.get<ContractTestService>(ContractTestService);
        await crudService.repository.clear();
        await app.listen(3000);
    });

    afterAll(async () => {
        await app?.close();
    });

    // it('should be applied to readOne', async () => {});
    //
    // it('should be applied to readMany', async () => {});
    //
    // it('should be applied to create', async () => {});
    //
    // it('should be applied to upsert', async () => {});
    //
    // it('should be applied to update', async () => {});
    //
    // it('should be applied to delete', async () => {});
    //
    // it('should be applied to recover', async () => {});
    //
    // it('should be applied to search', async () => {});
    it('should be provided endpoints', async () => {
        // const routerPathList = TestHelper.getRoutePath(app.getHttpServer());
        // expect(routerPathList.get).toHaveLength(2);
        // expect(routerPathList.post).toHaveLength(1);
        // expect(routerPathList.patch).toHaveLength(2);
    });

    it('should be completed default operation', async () => {
        const { body: createResponse, status: createStatus } = await contractClient.create({
            body: { nname: 'test', col2: { a: 2 }, col3: { a: '4', b: '5' } },
        });

        expect(createStatus).toBe(HttpStatus.CREATED);
        if (createStatus === 201) {
            expect(createResponse.nname).toBe('test');
            expect(createResponse._id).toBeDefined();
        }

        const createBody = createResponse as ContractEntity;
        const { body: readManyBody, status: readManyStatus } = await contractClient.readMany({
            query: {
                limit: 10,
                offset: 0,
            } as any,
        });
        expect(readManyStatus).toBe(HttpStatus.OK);
        if (readManyStatus === 200) {
            expect(readManyBody.data).toHaveLength(1);
            expect(readManyBody.data.at(0)).toEqual(createBody);
        }
        console.log(readManyBody);
        const { body: readOneBody, status: readOneStatus } = await contractClient.readOne({
            params: { _id: createBody._id.toString() },
        });
        expect(readOneStatus).toBe(HttpStatus.OK);
        if (readOneStatus === 200) {
            expect(readOneBody).toEqual(createBody);
        }

        // const { body: updateBody } = await request(app.getHttpServer())
        //     .patch(`/base/${createBody._id}`)
        //     .send({ name: 'changed' })
        //     .expect(HttpStatus.OK);
        // expect(updateBody._id).toEqual(createBody._id);
        // expect(updateBody.name).toBe('changed');
        //
        // const newObjectId = '642fb1b43ca2efcf4a7bdd71';
        // const { body: upsertBody } = await request(app.getHttpServer())
        //     .put(`/base/${newObjectId}`)
        //     .send({ name: 'name2' })
        //     .expect(HttpStatus.OK);
        // expect(upsertBody._id).toEqual(newObjectId);
        // expect(upsertBody.name).toEqual('name2');
        //
        // const { body: deleteBody } = await request(app.getHttpServer()).delete(`/base/${createBody._id}`).expect(HttpStatus.OK);
        // expect(deleteBody._id).toEqual(createBody._id);
        //
        // const { body: recoveryBody } = await request(app.getHttpServer())
        //     .post(`/base/${createBody._id}/recover`)
        //     .expect(HttpStatus.CREATED);
        // expect(recoveryBody._id).toEqual(createBody._id);
    });
});
