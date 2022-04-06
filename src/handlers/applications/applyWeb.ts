import { Request, Response } from 'express';

/** Handles a server application made from the website. */
// eslint-disable-next-line require-await
async function applyWeb(req: Request, res: Response): Promise<void> {
    try {
        const { access_token, invite_url } = req.body;
        if (typeof access_token !== 'string') {
            res.status(400).json(`body "access_token" must be a string (got ${typeof access_token})`);
            return;
        }
        if (typeof invite_url !== 'string') {
            res.status(400).json(`body "invite_url" must be a string (got ${typeof invite_url})`);
            return;
        }

        // const [user, guilds, invite] = await Promise.all([
        //     DiscordHelpers.getDiscordUser(access_token),
        //     DiscordHelpers.getUserGuildIds(access_token),
        //     DiscordHelpers.getInviteInformation(invite_url),
        // ]);

        // if (!user || !guilds) {
        //     res.status(400).json('Invalid access token');
        //     return;
        // }
        // if (!invite) {
        //     res.status(400).json('Invalid invite URL');
        //     return;
        // }

        // if (!guilds.has(invite.guild.id)) {
        //     res.status(400).json(`Guild "${invite_url}" is not in ${user.username}'s guilds`);
        //     return;
        // }

        // const existingApplication = await ApplicationModel.findById(verified.invite.guild.id);
        // if (existingApplication !== null) {
        //     res.status(400).json(`Already have an application for ${verified.invite.guild.name}`);
        //     return;
        // }

        // try {
        //     await ApplicationModel.create({
        //         _id: verified.invite.guild.id,
        //         source: 'web',
        //         invite: verified.invite,
        //     });
        // } catch (error) {
        //     res.status(201).json(error instanceof Error ? error.message : 'Unknown error occurred');
        //     return;
        // }

        res.status(201).json('Ryon gayu');
        return;
    } catch (error) {
        res.status(500).json(error instanceof Error ? error.message : 'Unknown error occurred');
    }
}

export default applyWeb;
