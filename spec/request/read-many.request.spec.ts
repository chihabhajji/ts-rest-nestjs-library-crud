import { CrudReadManyRequest } from '../../src/lib/request';

describe('CrudReadManyRequest', () => {
    it('should be defined', () => {
        const crudReadManyRequest = new CrudReadManyRequest();
        expect(crudReadManyRequest).toBeDefined();
    });
});
