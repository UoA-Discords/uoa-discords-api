import { DiscordAPI, POSTApplicationRoutes, RejectApplicationRequest, Verifiers } from '@uoa-discords/shared-utils';
import { Request, Response } from 'express';
import ServerLogger from '../../classes/ServerLogger';
import { ApplicationModel } from '../../models/ApplicationModel';
import { RegisteredServerModel } from '../../models/RegisteredServerModel';

async function rejectApplication(
    req: Request<undefined, undefined, RejectApplicationRequest>,
    res: Response,
): Promise<void> {
    try {
        const { access_token, guildId } = req.body;
        if (typeof access_token !== 'string') {
            res.status(400).json(`Body 'access_token' must be a string (got ${typeof access_token})`);
            return;
        }

        if (typeof guildId !== 'string') {
            res.status(400).json(`Body 'guildId' must be a string (got ${typeof guildId})`);
            return;
        }

        const user = await DiscordAPI.getUserInfo(access_token);

        if (!user.success) {
            res.status(401).json('Invalid access token');
            return;
        }

        if (!Verifiers.has(user.data.id)) {
            ServerLogger.logSecurity(POSTApplicationRoutes.Reject, user.data);
            res.sendStatus(401);
            return;
        }

        const applicationInQuestion = await ApplicationModel.findById(guildId);

        if (!applicationInQuestion) {
            res.status(404).json(`An application for guild ID ${guildId} doesn't exist`);
            return;
        }

        await applicationInQuestion.delete();

        const existingServer = await RegisteredServerModel.findById(guildId);

        if (existingServer) {
            res.status(409).json('This server is already registered, the application has been deleted.');
            return;
        }

        ServerLogger.applications.logRejected(applicationInQuestion, user.data);

        res.sendStatus(200);
    } catch (error) {
        ServerLogger.logError(POSTApplicationRoutes.Reject, error);
        res.sendStatus(500);
    }
}

export default rejectApplication;
