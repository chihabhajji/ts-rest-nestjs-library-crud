import type { CrudAbstractEntity } from '../crud.abstract.entity';
import type { BaseService } from 'spec/base/base.service';
import type { CrudService } from 'src';
import type { Repository } from 'typeorm';
export type MockType<T> = {
    [P in keyof T]?: jest.Mock<Record<string, unknown>>;
};

export const repositoryMockFactory: () => MockType<Repository<CrudAbstractEntity>> = jest.fn(() => ({
    findOne: jest.fn((entity) => entity),
    // ...
}));
describe('ReservedNameController', () => {
    it('should be do not use reserved name on controller', () => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/naming-convention
            const { ReservedNameController } = require('./reserved-name.controller');
            const service = repositoryMockFactory();
            new ReservedNameController({ crudService: service as unknown as CrudService<CrudAbstractEntity> });
            throw new Error('fail');
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            if (error instanceof Error) {
                expect(error.message).toBe('reservedReadOne is a reserved word. cannot use');
            }
        }
    });
});
