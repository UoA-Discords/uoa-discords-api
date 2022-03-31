import Guild from './Guild';
import User from './User';

/**
 * Object returned from the `invite` endpoint.
 *
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-object}
 */
export default interface Invite {
    /** The invite code (unique ID).
     *
     * E.g. 'https://discord.gg/abcdefg' has code 'abcdefg'.
     */
    code: string;

    /** `null` if never expires, otherwise ISO6801 timestamp.
     *
     * E.g. `2022-04-07T03:52:22+00:00`
     */
    expires_at: string | null;

    guild: Guild;

    channel: {
        id: string;
        name: string;
        /** @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types} */
        type: number;
    };

    inviter: User;
}
