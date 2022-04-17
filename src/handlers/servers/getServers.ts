import { GETRoutes } from '@uoa-discords/shared-utils';
import { Request, Response } from 'express';
import ServerLogger from '../../classes/ServerLogger';
import { RegisteredServerModel } from '../../models/RegisteredServerModel';

async function getServers(req: Request, res: Response): Promise<void> {
    try {
        const servers = await RegisteredServerModel.find({});

        res.status(200).json(servers);
    } catch (error) {
        ServerLogger.logError(GETRoutes.GetServers, error);
        res.sendStatus(500);
    }
}

export default getServers;
