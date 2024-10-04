import { initClient } from '@ts-rest/core';

import { contractContract } from './contract.contract';

export const contractClient = initClient(contractContract, {
    baseUrl: 'http://localhost:3000',
    baseHeaders: {},
});
