import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsObject } from 'class-validator';
import { ObjectId } from 'mongodb';
import { BaseEntity, Column, Entity, ObjectIdColumn } from 'typeorm';

import { GROUP } from '../../src/lib/interface';

@Entity('test-contract')
export class ContractEntity extends BaseEntity {
    @ObjectIdColumn()
    @IsObject({ groups: [GROUP.PARAMS] })
    @Transform(({ value }) => value && new ObjectId(value))
    _id: ObjectId;

    @Column({ nullable: true })
    @IsString({ always: true })
    @IsOptional({
        groups: [GROUP.DELETE, GROUP.PARAMS, GROUP.READ_MANY, GROUP.READ_ONE, GROUP.RECOVER, GROUP.SEARCH, GROUP.UPDATE, GROUP.UPSERT],
    })
    nname: string;

    @Column({ nullable: true })
    @IsObject({ always: true })
    @IsOptional({ always: true })
    col2: {
        a: number;
    };

    @Column({ nullable: true })
    @IsObject({ always: true })
    @IsOptional({ always: true })
    col3: {
        a: string;
        b: string;
    };
}
