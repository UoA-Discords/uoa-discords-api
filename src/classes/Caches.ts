import { Invite } from '@uoa-discords/shared-utils';
import CachedStorage from './template/CachedStored';

export default abstract class Caches {
    public static readonly inviteCache = new CachedStorage<Invite>({ fileName: 'invites' });
}
