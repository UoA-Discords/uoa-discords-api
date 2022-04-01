import axios from 'axios';
import Config from '../types/Config';
import { User } from '../types/Discord';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { discordToken: token }: Config = require('../../config.json');

interface InvalidUser {
    valid: false;
    reason: string;
}
interface ValidUser {
    valid: true;
    user: User;
}

export type VerifyUserResponse = InvalidUser | ValidUser;

/** Verifies a Discord user ID.
 *
 * @param {string} id - User ID snowflake.
 *
 * @returns {Promise<VerifyUserResponse>} Verification result.
 *
 * @deprecated Should be using Discord OAuth instead.
 */
async function verifyDiscordUserID(id: string): Promise<VerifyUserResponse> {
    try {
        const { data } = await axios.get<User>(`https://discord.com/api/v9/users/${id}`, {
            headers: {
                Authorization: `Bot ${token}`,
            },
        });
        return { valid: true, user: data };
    } catch (error) {
        return {
            valid: false,
            reason: error instanceof Error ? error.message : `Error occurred verifying ${id}`,
        };
    }
}

export default verifyDiscordUserID;
