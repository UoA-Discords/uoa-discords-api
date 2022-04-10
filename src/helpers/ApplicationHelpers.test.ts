import { TagNames } from '@uoa-discords/shared-utils';
import ApplicationHelpers from './ApplicationHelpers';

describe('ApplicationHelpers', () => {
    describe('/validateTagArray', () => {
        it('accepts valid tag numbers', () => {
            const tags: TagNames[] = [0, 4, 8, 11];
            expect(ApplicationHelpers.validateTagArray(tags)).toBe(true);
        });

        it('accurately finds invalid tags', () => {
            const tags: TagNames[] = [0, 4, 8, -1, 29, 11];
            const res = ApplicationHelpers.validateTagArray(tags);

            expect(res).not.toBe(true);
            if (!Array.isArray(res)) {
                throw new Error('Should be an array');
            }
            expect(res.length).toBe(2);

            expect(res[0]).toContain('-1'); // tag
            expect(res[0]).toContain('3'); // index

            expect(res[1]).toContain('29'); // tag
            expect(res[1]).toContain('4'); // index
        });

        it('handles invalid number inputs', () => {
            const tags: TagNames[] = [0, 1, 2, 4.5];
            const res = ApplicationHelpers.validateTagArray(tags);

            expect(res).not.toBe(true);
            if (!Array.isArray(res)) {
                throw new Error('Should be an array');
            }
            expect(res.length).toBe(1);

            expect(res[0]).toContain('4.5'); // tag
            expect(res[0]).toContain('3'); // index
        });

        it('handles an empty array', () => {
            expect(ApplicationHelpers.validateTagArray([])).toBe(true);
        });
    });
});
