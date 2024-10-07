import { UnprocessableEntityException } from '@nestjs/common';

import { PaginationHelper } from '../src/lib/provider/pagination.helper';

describe('Pagination Helper', () => {
    it('should serialize entity', () => {
        expect(PaginationHelper.serialize({ id: 1, name: 'test' })).toEqual(expect.any(String));
    });

    it('should deserialize cursor', () => {
        const cursor = PaginationHelper.serialize({ id: 1 });
        expect(PaginationHelper.deserialize(cursor)).toEqual({ id: 1 });
    });

    it('should return empty object when cursor is malformed', () => {
        const cursor = 'malformed';
        expect(PaginationHelper.deserialize(cursor)).toEqual({});
    });

    it('should be able to return pagination for GET_MORE type', () => {
        expect(PaginationHelper.getPaginationRequest({ key: 'value', nextCursor: 'token' })).toEqual({
            query: 'token',
            type: 'cursor',
            _isNext: false,
        });

        expect(PaginationHelper.getPaginationRequest({ key: 'value' })).toEqual({
            query: undefined,
            type: 'cursor',
            _isNext: false,
        });

        expect(PaginationHelper.getPaginationRequest({ query: 'query' })).toEqual({
            query: undefined,
            type: 'cursor',
            _isNext: false,
        });
    });

    it('should be validate pagination query', () => {
        expect(PaginationHelper.getPaginationRequest(undefined as any)).toEqual({
            type: 'cursor',
            query: undefined,
            _isNext: false,
        });

        expect(() => PaginationHelper.getPaginationRequest({ nextCursor: 3 })).toThrow(UnprocessableEntityException);

        expect(PaginationHelper.getPaginationRequest(undefined as any)).toEqual({
            type: 'offset',
            limit: undefined,
            offset: undefined,
            query: undefined,
            _isNext: false,
        });

        expect(() => PaginationHelper.getPaginationRequest({ nextCursor: 3 })).toThrow(UnprocessableEntityException);
    });

    it('should be return empty object when nextCursor is undefined', () => {
        expect(PaginationHelper.deserialize(undefined as any)).toEqual({});
    });
});
