import { Request, Response } from 'express';
import server from '../..';
import { RegisteredServerModel } from '../../models/RegisteredServerModel';

async function getServers(req: Request, res: Response): Promise<void> {
    try {
        const servers = await RegisteredServerModel.find({});

        res.status(200).json(servers);
    } catch (error) {
        server.errorLog.log('servers', error);
        res.sendStatus(500);
    }
}

export default getServers;
