import { TagNames } from '@uoa-discords/shared-utils';
import ApplicationHelpers from './ApplicationHelpers';

describe('ApplicationHelpers', () => {
    describe('/validateTagArray', () => {
        it('accepts valid tag numbers', () => {
            const tags: TagNames[] = [TagNames.Arts, TagNames.CreativeArts, TagNames.Club, TagNames.ComputerScience];
            expect(ApplicationHelpers.validateTagArray(tags)).toBe(true);
        });

        it('accurately finds invalid tags', () => {
            const tags: TagNames[] = [
                TagNames.Arts,
                TagNames.Engineering,
                TagNames.Research,
                'fakeTag' as TagNames,
                'fakeTag2' as TagNames,
            ];
            const res = ApplicationHelpers.validateTagArray(tags);

            expect(res).not.toBe(true);
            if (!Array.isArray(res)) {
                throw new Error('Should be an array');
            }
            expect(res.length).toBe(2);

            expect(res[0]).toContain('fakeTag'); // tag
            expect(res[0]).toContain('3'); // index

            expect(res[1]).toContain('fakeTag2'); // tag
            expect(res[1]).toContain('4'); // index
        });

        it('handles invalid input types', () => {
            const tags: TagNames[] = [
                TagNames.Arts,
                TagNames.Business,
                TagNames.CreativeArts,
                0 as unknown as TagNames,
            ];
            const res = ApplicationHelpers.validateTagArray(tags);

            expect(res).not.toBe(true);
            if (!Array.isArray(res)) {
                throw new Error('Should be an array');
            }
            expect(res.length).toBe(1);

            // tag shouldn't be printed,
            // since its type isnt a string
            expect(res[0]).not.toContain('0');
            expect(res[0]).toContain('3'); // index
        });

        it('handles an empty array', () => {
            expect(ApplicationHelpers.validateTagArray([])).toBe(true);
        });
    });
});
