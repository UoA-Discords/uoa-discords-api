/** Response from Discord's token URL.
 *
 * @see {@link https://discord.com/developers/docs/topics/oauth2#authorization-code-grant-access-token-response}
 */
export default interface AccessTokenResponse {
    access_token: string;
    token_type: 'Bearer';

    /** Seconds until token expiration. */
    expires_in: number;

    refresh_token: string;
    scope: string;
}
