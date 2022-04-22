import { DiscordAPI, POSTUserRoutes, RemoveLikeRequest } from '@uoa-discords/shared-utils';
import { Request, Response } from 'express';
import Caches from '../../classes/Caches';
import ServerLogger from '../../classes/ServerLogger';
import { RegisteredServerModel } from '../../models/RegisteredServerModel';
import { UserModel } from '../../models/UserModel';

async function removeLike(req: Request<undefined, undefined, RemoveLikeRequest>, res: Response): Promise<void> {
    try {
        const { access_token, guildId } = req.body;
        if (typeof access_token !== 'string') {
            res.status(400).json(`Body 'access_token must be a string (got ${typeof access_token})`);
            return;
        }

        if (typeof guildId !== 'string') {
            res.status(400).json(`Body 'guildId' must be a string (got ${typeof guildId})`);
            return;
        }

        const discordUser = await DiscordAPI.getUserInfo(access_token);

        if (!discordUser.success) {
            res.status(401).json('Invalid access token');
            return;
        }

        const [user, server] = await Promise.all([
            UserModel.findById(discordUser.data.id),
            RegisteredServerModel.findById(guildId),
        ]);

        if (!user) {
            res.status(400).json("You don't have any likes registered");
            return;
        }

        if (!server) {
            res.status(400).json('That guild is not registered');
            return;
        }

        const index = user.guildsLiked.indexOf(guildId);

        if (index === -1) {
            res.status(401).json("You haven't liked that guild");
            return;
        }

        user.guildsLiked.splice(index, 1);

        if (server.likes) server.likes--;

        await Promise.all([
            UserModel.findByIdAndUpdate(user._id, user, { new: true }),
            RegisteredServerModel.findByIdAndUpdate(server._id, server, { new: true }),
        ]);

        Caches.likesCache.removeItem(discordUser.data.id);
        res.sendStatus(200);
    } catch (error) {
        ServerLogger.logError(POSTUserRoutes.AddLike, error);
        res.sendStatus(500);
    }
}

export default removeLike;
