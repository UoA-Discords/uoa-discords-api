import { Request, Response } from 'express';
import { discordHelpers } from '../helpers/discordHelpers';

/** Gets the guilds of a Discord user, but only the ones they can make invites in.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guilds}
 */
async function getGuilds(req: Request, res: Response): Promise<void> {
    try {
        const { access_token } = req.body;
        if (typeof access_token !== 'string') {
            res.status(400).json(`body "access_token" must be a string (got ${typeof access_token})`);
            return;
        }

        const guilds = await discordHelpers.getUserGuilds(access_token);

        res.status(200).json(guilds);
        return;
    } catch (error) {
        res.status(500).json(error instanceof Error ? error.message : 'Unknown error occurred');
    }
}

export default getGuilds;
