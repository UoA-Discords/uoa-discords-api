import { Invite } from '@uoa-discords/shared-utils';
import CachedStorage from './template/CachedStored';

export default abstract class Caches {
    /** Invite objects indexed by guild ID. */
    public static readonly inviteCache = new CachedStorage<Invite>({ fileName: 'invites' });

    /** Array of guild IDs a user has liked, indexed by user ID. */
    public static readonly likesCache = new CachedStorage<string[]>({});
}
