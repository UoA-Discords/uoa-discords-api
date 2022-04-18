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
        const servers = await RegisteredServerModel.find({});

        const allServers = await Promise.all(servers.map((e) => getCacheOrAddTo(e._id, e.inviteCode)));

        const validServers: ServerWithInviteInfo[] = [];

        for (let i = 0, len = allServers.length; i < len; i++) {
            const invite = allServers[i];
            if (invite !== null) {
                validServers.push({ ...servers[i], invite: invite });
            }
        }

        res.status(200).json(validServers);
    } catch (error) {
        ServerLogger.logError(GETRoutes.GetServers, error);
        res.sendStatus(500);
    }
}

export default getServers;
