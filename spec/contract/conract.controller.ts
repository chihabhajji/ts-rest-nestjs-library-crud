import { Controller } from '@nestjs/common';

import { contractContract } from './contract.contract';
import { ContractEntity } from './contract.entity';
import { ContractTestService } from './contract.service';
import { Crud } from '../../src';

@Crud({
    entity: ContractEntity,
    routes: contractContract,
})
@Controller()
export class ContractTestController {
    constructor(public readonly crudService: ContractTestService) {}
}
