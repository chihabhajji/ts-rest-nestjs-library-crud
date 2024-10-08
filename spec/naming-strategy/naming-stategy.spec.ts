import { Controller, HttpStatus, INestApplication, Injectable, Module } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Exclude, Type } from 'class-transformer';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';
import request from 'supertest';
import {
    Entity,
    TableInheritance,
    PrimaryGeneratedColumn,
    Column,
    ChildEntity,
    Repository,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from 'typeorm';

import { SnakeNamingStrategy } from './snake-naming.strategy';
import { Crud } from '../../src/lib/crud.decorator';
import { CrudService } from '../../src/lib/crud.service';
import { CrudController, GROUP, Method } from '../../src/lib/interface';
import { TestHelper } from '../test.helper';

@Entity('content')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
class ContentEntity {
    @PrimaryGeneratedColumn()
    @IsNumber({}, { groups: [GROUP.PARAMS] })
    @Type(() => Number)
    id: number;

    @Column()
    @IsString({ always: true })
    @IsOptional({ always: true })
    title: string;

    @Column()
    @IsString({ always: true })
    @IsOptional({ always: true })
    description: string;

    @IsDateString(undefined, {
        groups: [GROUP.READ_MANY, GROUP.READ_ONE],
    })
    @IsOptional({ groups: [GROUP.READ_MANY, GROUP.READ_ONE] })
    @Type(() => Date)
    @CreateDateColumn()
    declare readonly createdAt?: Date;

    @IsDateString(undefined, {
        groups: [GROUP.READ_MANY, GROUP.READ_ONE],
    })
    @IsOptional({ groups: [GROUP.READ_MANY, GROUP.READ_ONE] })
    @UpdateDateColumn()
    @Type(() => Date)
    declare readonly updatedAt?: Date;

    @Exclude()
    @IsOptional({ always: true })
    @DeleteDateColumn({
        type: 'timestamp',
        nullable: true,
    })
    @IsDateString(undefined, {
        groups: [GROUP.READ_MANY, GROUP.READ_ONE, GROUP.SEARCH, GROUP.PARAMS],
    })
    @Type(() => Date)
    declare readonly deletedAt?: Date;
}

@ChildEntity({ name: 'photo' })
class PhotoEntity extends ContentEntity {
    @Column()
    @IsString({ always: true })
    @IsOptional({ always: true })
    size: string;
}

@Injectable()
class PhotoService extends CrudService<PhotoEntity> {
    constructor(@InjectRepository(PhotoEntity) repository: Repository<PhotoEntity>) {
        super(repository);
    }
}

@Crud({
    entity: PhotoEntity,
    routes: { [Method.DELETE]: { softDelete: false, path: '/:id', method: 'DELETE', responses: {} } },
})
@Controller('photo')
class PhotoController implements CrudController<PhotoEntity> {
    constructor(public readonly crudService: PhotoService) {}
}

@ChildEntity('question')
class QuestionEntity extends ContentEntity {
    @Column()
    @Type(() => Number)
    @IsNumber({}, { always: true })
    @IsOptional({ always: true })
    answersCount: number;
}
@Injectable()
class QuestionService extends CrudService<QuestionEntity> {
    constructor(@InjectRepository(QuestionEntity) repository: Repository<QuestionEntity>) {
        super(repository);
    }
}

@Crud({
    entity: QuestionEntity,
    routes: { [Method.DELETE]: { softDelete: false, path: '/:id', method: 'DELETE', responses: {} } },
})
@Controller('question')
class QuestionController implements CrudController<QuestionEntity> {
    constructor(public readonly crudService: QuestionService) {}
}

@Module({
    imports: [TypeOrmModule.forFeature([ContentEntity, PhotoEntity, QuestionEntity])],
    controllers: [PhotoController, QuestionController],
    providers: [PhotoService, QuestionService],
})
class ContentModule {}

describe('NamingStrategy', () => {
    let app: INestApplication;
    let photoService: PhotoService;
    let questionService: QuestionService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                ContentModule,
                TestHelper.getTypeOrmPgsqlModule([ContentEntity, PhotoEntity, QuestionEntity], new SnakeNamingStrategy()),
            ],
        }).compile();
        app = moduleFixture.createNestApplication();

        photoService = moduleFixture.get<PhotoService>(PhotoService);
        questionService = moduleFixture.get<QuestionService>(QuestionService);
        await app.init();
    });

    afterAll(async () => {
        await app?.close();
    });

    it('should be defined', () => {
        expect(app).toBeDefined();
    });

    it('should be fetch data', async () => {
        await photoService.repository.delete({});
        const title = `Tester-${Date.now()}`;
        const { body: created } = await request(app.getHttpServer())
            .post('/photo')
            .send({ title, description: 'Photo Test', size: '100px' })
            .expect(HttpStatus.CREATED);

        const { body: readOne } = await request(app.getHttpServer()).get(`/photo/${created.id}`).expect(HttpStatus.OK);
        expect(readOne.title).toEqual(title);
    });

    it('should be used PhotoEntity', async () => {
        await photoService.repository.delete({});
        const title = `Tester-${Date.now()}`;
        const { body: created } = await request(app.getHttpServer())
            .post('/photo')
            .send({ title, description: 'Photo Test', size: '100px' })
            .expect(HttpStatus.CREATED);
        expect(created.title).toEqual(title);
        expect(created.id).toBeDefined();
        expect(created.size).toEqual('100px');

        const { body: readOne } = await request(app.getHttpServer()).get(`/photo/${created.id}`).expect(HttpStatus.OK);
        expect(readOne.title).toEqual(title);

        const { body: readMany } = await request(app.getHttpServer()).get('/photo').expect(HttpStatus.OK);
        expect(readMany.data).toHaveLength(1);
        expect(readMany.data[0].title).toEqual(title);
        expect(readMany.metadata.total).toEqual(1);

        const { body: updated } = await request(app.getHttpServer())
            .patch(`/photo/${created.id}`)
            .send({ title: 'updated' })
            .expect(HttpStatus.OK);
        expect(updated.title).toEqual('updated');

        await request(app.getHttpServer()).delete(`/photo/${created.id}`).expect(HttpStatus.OK);
        await request(app.getHttpServer()).get(`/photo/${created.id}`).expect(HttpStatus.NOT_FOUND);
    });

    it('should be used QuestionEntity', async () => {
        await questionService.repository.delete({});
        const title = `Tester-${Date.now()}`;
        const { body: created } = await request(app.getHttpServer())
            .post('/question')
            .send({ title, description: 'Question Test', answersCount: 10 })
            .expect(HttpStatus.CREATED);
        expect(created.title).toEqual(title);
        expect(created.id).toBeDefined();
        expect(created.size).not.toBeDefined();
        expect(created.answersCount).toEqual(10);

        const { body: readOne } = await request(app.getHttpServer()).get(`/question/${created.id}`).expect(HttpStatus.OK);
        expect(readOne.title).toEqual(title);

        const { body: readMany } = await request(app.getHttpServer()).get('/question').expect(HttpStatus.OK);
        expect(readMany.data).toHaveLength(1);
        expect(readMany.data[0].title).toEqual(title);
        expect(readMany.metadata.total).toEqual(1);

        const { body: updated } = await request(app.getHttpServer())
            .patch(`/question/${created.id}`)
            .send({ title: 'updated' })
            .expect(HttpStatus.OK);
        expect(updated.title).toEqual('updated');

        await request(app.getHttpServer()).delete(`/question/${created.id}`).expect(HttpStatus.OK);
        await request(app.getHttpServer()).get(`/question/${created.id}`).expect(HttpStatus.NOT_FOUND);
    });
});
