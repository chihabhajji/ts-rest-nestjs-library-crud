import type { EntityType } from '.';
import type { CrudService } from '../crud.service';
import type { tsRestHandler } from '@ts-rest/nest';

export interface CrudController<T extends EntityType> {
    readonly crudService: CrudService<T>;

    handler(req: Request): ReturnType<typeof tsRestHandler>;
}
