import { Invite } from '@uoa-discords/shared-utils';
import CachedStorage from './CachedStored';

export default abstract class Caches {
    public static readonly inviteCache = new CachedStorage<Invite>();
}
