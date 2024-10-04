import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ContractEntity } from './contract.entity';
import { CrudService } from '../../src';

@Injectable()
export class ContractTestService extends CrudService<ContractEntity> {
    constructor(@InjectRepository(ContractEntity) repository: Repository<ContractEntity>) {
        super(repository);
    }
}
