import axios from 'axios';
import { Guild, User } from '../types/Discord';

/** Gets a Discord user from an access token. */
async function getDiscordUser(access_token: string): Promise<User> {
    const { data } = await axios.get<User>('https://discord.com/api/v9/users/@me', {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });

    data.avatar = `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`;

    return data;
}

/** Gets all the guilds a user is in. */
async function getUserGuilds(access_token: string): Promise<Guild[]> {
    const { data } = await axios.get<Guild[]>('https://discord.com/api/v9/users/@me/guilds', {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });

    data.forEach((guild) => {
        if (guild.icon) {
            guild.icon = `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`;
        }
    });

    return data;
}

export const discordHelpers = { getDiscordUser, getUserGuilds };

/* 
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
*/
