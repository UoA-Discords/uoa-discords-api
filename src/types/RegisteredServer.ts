import { PublicRegisteredGuild } from '@uoa-discords/shared-utils';

export default interface RegisteredServer extends PublicRegisteredGuild {
    /** Guild ID used for indexing. */
    _id: string;
}
