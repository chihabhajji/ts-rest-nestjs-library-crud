import { ConsoleLogger, HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { ViewEntityPaginationModule } from './view-entity-pagination.module';
import { BaseService } from '../base/base.service';
import { TestHelper } from '../test.helper';

import type { INestApplication } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';

describe('Pagination with paginationKeys option', () => {
    let app: INestApplication;
    let baseEntityService: BaseService;
    const totalCount = 100;
    const defaultLimit = 20;

    beforeAll(async () => {
        const logger = new ConsoleLogger();
        logger.setLogLevels(['error']);
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                ViewEntityPaginationModule({
                    readMany: { numberOfTake: defaultLimit, paginationKeys: ['name'] },
                    search: { numberOfTake: defaultLimit, paginationKeys: ['name'] },
                }),
            ],
        })
            .setLogger(logger)
            .compile();
        app = moduleFixture.createNestApplication();

        baseEntityService = moduleFixture.get<BaseService>(BaseService);
        await app.init();
    });

    beforeEach(async () => {
        await baseEntityService.repository.delete({});
        await baseEntityService.repository.save(
            Array.from({ length: totalCount }, (_, index) => index).map((number) => ({
                name: `name-${(number + 1).toString().padStart(3, '0')}`,
                type: number,
            })),
        );
    });

    afterAll(async () => {
        await TestHelper.dropTypeOrmEntityTables();
        await app?.close();
    });

    describe('Offset', () => {
        it('should return 20 entities as default', async () => {
            const { body } = await request(app.getHttpServer()).get('/').expect(HttpStatus.OK);
            expect(body.data).toHaveLength(defaultLimit);
            expect(body.metadata).toEqual({ page: 1, pages: 5, total: totalCount, offset: defaultLimit, nextCursor: expect.any(String) });

            const { body: searchBody } = await request(app.getHttpServer()).post('/search').expect(HttpStatus.OK);
            expect(searchBody.data).toHaveLength(defaultLimit);
            expect(searchBody.metadata).toEqual({
                page: 1,
                pages: 5,
                total: totalCount,
                offset: defaultLimit,
                nextCursor: expect.any(String),
            });

            const { body: searchNextBody } = await request(app.getHttpServer())
                .post('/search')
                .send({ nextCursor: body.metadata.nextCursor, offset: defaultLimit })
                .expect(HttpStatus.OK);
            for (const entity of searchNextBody.data) {
                expect(searchBody.data.some((data: { id: number }) => data.id === entity.id)).not.toBeTruthy();
            }
        });

        it('should return next page from offset on readMany', async () => {
            const { body: firstResponseBody } = await request(app.getHttpServer()).get('/').expect(HttpStatus.OK);

            const { body: nextResponseBody } = await request(app.getHttpServer())
                .get('/')
                .query({
                    nextCursor: firstResponseBody.metadata.nextCursor,
                    offset: firstResponseBody.metadata.offset,
                })
                .expect(HttpStatus.OK);

            expect(firstResponseBody.metadata).toEqual({
                page: 1,
                pages: 5,
                total: totalCount,
                offset: defaultLimit,
                nextCursor: expect.any(String),
            });

            expect(nextResponseBody.metadata).toEqual({
                page: 2,
                pages: 5,
                total: totalCount,
                offset: defaultLimit * 2,
                nextCursor: expect.any(String),
            });
        });

        it('should return next page from offset on search', async () => {
            const { body: firstResponseBody } = await request(app.getHttpServer()).post('/search').expect(HttpStatus.OK);

            const { body: nextResponseBody } = await request(app.getHttpServer())
                .post('/search')
                .send({
                    nextCursor: firstResponseBody.metadata.nextCursor,
                    offset: firstResponseBody.metadata.offset,
                })
                .expect(HttpStatus.OK);

            expect(firstResponseBody.metadata).toEqual({
                page: 1,
                pages: 5,
                total: totalCount,
                offset: defaultLimit,
                nextCursor: expect.any(String),
            });

            expect(nextResponseBody.metadata).toEqual({
                page: 2,
                pages: 5,
                total: totalCount,
                offset: defaultLimit * 2,
                nextCursor: expect.any(String),
            });
        });

        it('should return next page from offset with order', async () => {
            const { body: firstResponseBody } = await request(app.getHttpServer())
                .post('/search')
                .send({ order: { category: 'ASC' }, offset: 30 })
                .expect(HttpStatus.OK);

            const { body: nextResponseBody } = await request(app.getHttpServer())
                .post('/search')
                .send({
                    nextCursor: firstResponseBody.metadata.nextCursor,
                    offset: firstResponseBody.metadata.offset,
                })
                .expect(HttpStatus.OK);

            expect(firstResponseBody.metadata.nextCursor).not.toEqual(nextResponseBody.metadata.nextCursor);

            expect(nextResponseBody.data).toHaveLength(defaultLimit);
            expect(nextResponseBody.metadata).toEqual({
                page: 3,
                pages: 5,
                total: totalCount,
                offset: 70,
                nextCursor: expect.any(String),
            });

            const lastOneOfFirstResponse = firstResponseBody.data.pop();
            const firstOneOfNextResponse = nextResponseBody.data.shift();
            expect(lastOneOfFirstResponse.category).toEqual(0);
            expect(firstOneOfNextResponse.category).toEqual(1);
        });
    });
});
