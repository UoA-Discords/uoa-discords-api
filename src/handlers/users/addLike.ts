import { AddLikeRequest, DiscordAPI, POSTUserRoutes, WebsiteUser } from '@uoa-discords/shared-utils';
import { Request, Response } from 'express';
import Caches from '../../classes/Caches';
import ServerLogger from '../../classes/ServerLogger';
import { RegisteredServerModel } from '../../models/RegisteredServerModel';
import { UserModel } from '../../models/UserModel';

async function addLike(req: Request<undefined, undefined, AddLikeRequest>, res: Response): Promise<void> {
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

        if (!server) {
            res.status(400).json('That guild is not registered');
            return;
        }

        if (user) {
            // modify existing database user
            if (user.guildsLiked.includes(guildId)) {
                res.status(400).json("You've already liked that guild");
                return;
            }
            user.guildsLiked.push(guildId);
            await UserModel.findByIdAndUpdate(discordUser.data.id, user, { new: true });
        } else {
            // make new database user
            const newUser: WebsiteUser = {
                _id: discordUser.data.id,
                guildsLiked: [guildId],
            };
            await UserModel.create(newUser);
        }

        if (server.likes !== undefined) server.likes++;
        else server.likes = 1;
        await RegisteredServerModel.findByIdAndUpdate(server._id, server, { new: true });

        Caches.likesCache.removeItem(discordUser.data.id);
        res.sendStatus(200);
    } catch (error) {
        ServerLogger.logError(POSTUserRoutes.AddLike, error);
        res.sendStatus(500);
    }
}

export default addLike;
