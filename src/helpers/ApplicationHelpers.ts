import { TagDescriptionsMap, TagNames } from '@uoa-discords/shared-utils';

export default class ApplicationHelpers {
    public static validateTagArray(tagArray: string[]): true | string[] {
        const output: string[] = [];

        for (let i = 0, len = tagArray.length; i < len; i++) {
            if (typeof tagArray[i] !== 'string') {
                output.push(`Tag at index ${i} is not a string`);
                continue;
            }

            try {
                const name = tagArray[i] as TagNames;
                if (TagDescriptionsMap[name] === undefined) {
                    output.push(`Tag '${tagArray[i]}' (index ${i}) is not a known tag`);
                }
            } catch (error) {
                output.push(`Tag '${tagArray[i]}' (index ${i}) had an error`);
            }
        }

        if (output.length) return output;
        return true;
    }
}
