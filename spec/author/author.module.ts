import { Controller, Injectable, Module } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Entity, BaseEntity, Repository, PrimaryColumn, Column, DeleteDateColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

import { AuthorInterceptor } from './author.interceptor';
import { Crud } from '../../src/lib/crud.decorator';
import { CrudService } from '../../src/lib/crud.service';
import { CrudController, Method } from '../../src/lib/interface';

@Entity('author')
export class TestEntity extends BaseEntity {
    @PrimaryColumn()
    @IsString({ always: true })
    @IsOptional({ groups: [Method.UPSERT, Method.UPDATE] })
    col1: string;

    @Column()
    @IsInt({ always: true })
    @IsOptional({ groups: [Method.UPDATE] })
    col2: number;

    @Column({ nullable: true })
    @IsInt({ always: true })
    @IsOptional({ groups: [Method.UPDATE] })
    col3: number;

    @Column({ nullable: true })
    createdBy: string;

    @Column({ nullable: true })
    updatedBy: string;

    @Column({ nullable: true })
    deletedBy: string;

    @DeleteDateColumn()
    deletedAt?: Date;

    @CreateDateColumn()
    createdAt?: Date;

    @UpdateDateColumn()
    lastModifiedAt?: Date;
}

@Injectable()
export class TestService extends CrudService<TestEntity> {
    constructor(@InjectRepository(TestEntity) repository: Repository<TestEntity>) {
        super(repository);
    }
}

@Crud({
    entity: TestEntity,
    routes: {
        create: {
            interceptors: [AuthorInterceptor],
            author: {
                filter: 'user',
                property: 'createdBy',
            },
        },
        update: {
            interceptors: [AuthorInterceptor],
            author: {
                filter: 'user',
                property: 'updatedBy',
            },
        },
        upsert: {
            interceptors: [AuthorInterceptor],
            author: {
                filter: 'user',
                property: 'updatedBy',
            },
        },
        delete: {
            interceptors: [AuthorInterceptor],
            author: {
                filter: 'user',
                property: 'deletedBy',
            },
        },
    },
})
@Controller('base')
export class TestController implements CrudController<TestEntity> {
    constructor(public readonly crudService: TestService) {}
}

@Module({
    imports: [TypeOrmModule.forFeature([TestEntity])],
    controllers: [TestController],
    providers: [TestService],
})
export class TestModule {}
