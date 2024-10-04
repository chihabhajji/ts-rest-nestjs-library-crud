import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ContractTestController } from './conract.controller';
import { ContractEntity } from './contract.entity';
import { ContractTestService } from './contract.service';

@Module({
    imports: [TypeOrmModule.forFeature([ContractEntity])],
    controllers: [ContractTestController],
    providers: [ContractTestService],
})
export class ContractTestModule {}
