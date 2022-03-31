/**
 * Partial guild object, part of the response of the `invite` endpoint.
 *
 * Only relevant properties are included.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object} */
export default interface Guild {
    id: string;
    name: string;

    /** Splash hash. */
    splash: string | null;
    /** Banner hash. */
    banner: string | null;
    /** Icon hash. */
    icon: string | null;

    /** @see {@link https://discord.com/developers/docs/resources/guild#guild-object-verification-level} */
    verification_level: number;
    vanity_url_code: string | null;

    /** Current number of server boosts. */
    premium_subscription_count: number;

    /** Does not exist for community servers. */
    nsfw?: boolean;

    /** Does not exist for community servers. */
    nsfw_level?: number;

    /** Community servers only. */
    welcome_screen?: {
        description?: string;
    };
}
