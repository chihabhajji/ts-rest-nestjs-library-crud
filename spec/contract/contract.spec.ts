import { HttpStatus, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { TestHelper } from '../test.helper';
import { contractClient } from './contract.client';
import { ContractEntity } from './contract.entity';
import { ContractTestService } from './contract.service';
import { ContractTestModule } from './controller.module';

import type { NestExpressApplication } from '@nestjs/platform-express';
import type { TestingModule } from '@nestjs/testing';
import type { BaseEntity } from 'typeorm';

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
        const crudService = app.get<ContractTestService>(ContractTestService);
        await crudService.repository.clear();
        for (let i = 0; i < 8; i++) {
            await crudService.repository.save({
                nname: `name${i}`,
                col2: { a: i },
                col3: { a: i.toString(), b: (i + 1).toString() },
            } as Omit<ContractEntity, keyof BaseEntity | '_id'>);
        }
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
        const routerPathList = TestHelper.getRoutePath(app.getHttpServer());
        expect(routerPathList.get).toEqual(expect.arrayContaining(['/contract', '/contract/:_id']));
        expect(routerPathList.post).toEqual(expect.arrayContaining(['/contract', '/contract/search']));
        expect(routerPathList.delete).toEqual(expect.arrayContaining(['/contract/:_id']));
        expect(routerPathList.put).toEqual(expect.arrayContaining(['/contract/:_id/upsert']));
        expect(routerPathList.patch).toEqual(expect.arrayContaining(['/contract/:_id']));
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
            },
        });
        expect(readManyStatus).toBe(HttpStatus.OK);
        if (readManyStatus === 200) {
            expect(readManyBody.data).toHaveLength(9);
            console.log('readManyBody.metadata', readManyBody.metadata);
            console.log(readManyBody.data);
            expect(readManyBody.data.at(9)).toEqual(createBody);
        }
        const { body: readOneBody, status: readOneStatus } = await contractClient.readOne({
            params: { _id: createBody._id.toString() },
        });
        expect(readOneStatus).toBe(HttpStatus.OK);
        if (readOneStatus === 200) {
            expect(readOneBody).toEqual(createBody);
        }
        const nname = 'changed';
        const col3 = { a: 'newA' };
        const { body: updateResponse, status: updateStatus } = await contractClient.update({
            body: {
                nname,
                col3,
            },
            params: {
                _id: createBody._id.toString(),
            },
        });
        expect(updateStatus).toBe(HttpStatus.OK);
        if (updateStatus === 200) {
            expect(updateResponse._id).toBeDefined();
            expect(updateResponse._id).toEqual(createBody._id);
            expect(updateResponse.nname).toBe(nname);
            expect(updateResponse.col3).toEqual(col3);
        }

        const newObjectId = '642fb1b43ca2efcf4a7bdd71';
        const { status: upsertStatus, body: upsertBody } = await contractClient.upsert({
            body: { nname: 'name' },
            params: { _id: newObjectId },
        });
        expect(upsertStatus).toEqual(HttpStatus.OK);
        if (upsertStatus === 200) {
            expect(upsertBody._id).toEqual(newObjectId);
            expect(upsertBody.nname).toEqual('name');
        }

        const { status: deleteStatus, body: deleteBody } = await contractClient.delete({ params: { _id: createBody._id.toString() } });
        expect(deleteStatus).toEqual(HttpStatus.OK);
        if (deleteStatus === 200) {
            expect(deleteBody).toEqual({});
        }
    });
});
