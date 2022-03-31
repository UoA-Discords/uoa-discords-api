/**
 * Full user object.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#user-object}
 */
export default interface User {
    id: string;

    /** E.g. 'NachoToast'. */
    username: string;

    /** Avatar hash. */
    avatar: string;

    /** E.g. '1234' */
    discriminator: string;

    /** @see {@link https://discord.com/developers/docs/resources/user#user-object-user-flags} */
    public_flags: number;
}
