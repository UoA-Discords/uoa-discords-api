import { TagNames, Tags } from '@uoa-discords/shared-utils';

export default class ApplicationHelpers {
    public static validateTagArray(tagArray: number[]): true | string[] {
        const output: string[] = [];
        tagArray.forEach((e, i) => {
            try {
                const tag = Tags[e as TagNames];
                if (!tag) output.push(`Tag '${e}' (index ${i}) does not correspond to any valid tags`);
            } catch (error) {
                output.push(`Tag '${e}' (index ${i}) had error`);
            }
        });

        if (output.length) return output;
        return true;
    }
}
