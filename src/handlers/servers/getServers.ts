import { DiscordAPI, GETRoutes, Invite, ServerWithInviteInfo } from '@uoa-discords/shared-utils';
import { Request, Response } from 'express';
import Caches from '../../classes/Caches';
import ServerLogger from '../../classes/ServerLogger';
import { RegisteredServerModel } from '../../models/RegisteredServerModel';

async function getCacheOrAddTo(id: string, inviteCode: string): Promise<Invite | null> {
    const existing = Caches.inviteCache.getItem(id);
    if (existing) return existing;
    const inviteQuery = await DiscordAPI.getInviteData(inviteCode);

    if (inviteQuery.success) {
        Caches.inviteCache.addItem(id, inviteQuery.data);
        return inviteQuery.data;
    }
    ServerLogger.logError(GETRoutes.GetServers, inviteQuery.error);
    return null;
}

async function getServers(req: Request, res: Response): Promise<void> {
    try {
        const servers = await RegisteredServerModel.find();

        const allServers = await Promise.all(servers.map((e) => getCacheOrAddTo(e._id, e.inviteCode)));

        const validServers: ServerWithInviteInfo[] = [];

        for (let i = 0, len = allServers.length; i < len; i++) {
            const invite = allServers[i];
            if (invite !== null) {
                // we don't use spread syntax here due to weird mongodb object nesting
                const payload: ServerWithInviteInfo = {
                    invite,
                    _id: servers[i]._id,
                    inviteCode: servers[i].inviteCode,
                    tags: servers[i].tags,
                    addedAt: servers[i].addedAt,
                    addedBy: servers[i].addedBy,
                    approvedBy: servers[i].approvedBy,
                    approvedAt: servers[i].approvedAt,
                    bot: servers[i].bot,
                    memberCountHistory: servers[i].memberCountHistory,
                    likes: servers[i].likes ?? 0,
                };

                validServers.push(payload);
            }
        }

        res.status(200).json(validServers);
    } catch (error) {
        ServerLogger.logError(GETRoutes.GetServers, error);
        res.sendStatus(500);
    }
}

export default getServers;
