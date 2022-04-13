import { DiscordAPI, Verifiers } from '@uoa-discords/shared-utils';
import { Request, Response } from 'express';
import server from '../..';
import { ApplicationModel } from '../../models/ApplicationModel';

/** Lists all server applications. */
async function getApplications(req: Request, res: Response): Promise<void> {
    try {
        const access_token = req.headers.authorization;
        if (typeof access_token !== 'string') {
            res.status(400).json(`Authorization header must be a string (got ${typeof access_token})`);
            return;
        }

        const user = await DiscordAPI.getUserInfo(access_token);
        if (!user.success) {
            res.status(401).json('Invalid auth token');
            return;
        }

        if (!Verifiers.has(user.data.id)) {
            server.securityLog.log(
                `Non-verifier ${user.data.username}#${user.data.discriminator} tried to get applications.`,
            );
            res.status(401).json('You do not have permission to view this');
            return;
        }

        const applications = await ApplicationModel.find({});

        res.status(200).json(applications);
    } catch (error) {
        server.errorLog.log('applications', error);
        res.sendStatus(500);
    }
}

export default getApplications;
