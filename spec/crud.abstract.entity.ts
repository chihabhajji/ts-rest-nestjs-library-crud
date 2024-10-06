import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { BaseEntity, CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { GROUP } from '../src/lib/interface';

export class CrudAbstractEntity extends BaseEntity {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    @IsNumber({}, { groups: [GROUP.PARAMS] })
    @Type(() => Number)
    id: number;

    /**
     * 삭제시간
     */
    @DeleteDateColumn()
    deletedAt?: Date;

    /**
     * 생성시간
     */
    @CreateDateColumn()
    createdAt?: Date;

    /**
     * 수정시간
     */
    @UpdateDateColumn()
    lastModifiedAt?: Date;
}
