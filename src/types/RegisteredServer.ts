import { Invite, PublicRegisteredGuild, User } from '@uoa-discords/shared-utils';

export default interface RegisteredServer extends PublicRegisteredGuild {
    /** Guild ID used for indexing. */
    _id: string;
    inviteObject: Invite;
    addedBy: User;
    approvedBy: User;
}
