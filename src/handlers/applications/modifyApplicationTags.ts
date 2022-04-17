import { DiscordAPI, ModifyApplicationRequest, POSTApplicationRoutes, Verifiers } from '@uoa-discords/shared-utils';
import { Request, Response } from 'express';
import ServerLogger from '../../classes/ServerLogger';
import ApplicationHelpers from '../../helpers/ApplicationHelpers';
import { ApplicationModel } from '../../models/ApplicationModel';

async function modifyApplicationTags(
    req: Request<undefined, undefined, ModifyApplicationRequest>,
    res: Response,
): Promise<void> {
    try {
        const { access_token, guildId, tags } = req.body;

        if (typeof access_token !== 'string') {
            res.status(400).json(`Body 'access_token' must be a string (got ${typeof access_token})`);
            return;
        }

        if (typeof guildId !== 'string') {
            res.status(400).json(`Body 'guildId' must be a string (got ${typeof guildId})`);
            return;
        }

        if (!Array.isArray(tags)) {
            res.status(400).json(`Body "tags" must be an array (got ${typeof tags})`);
            return;
        }

        const resolvedTags = ApplicationHelpers.validateTagArray(tags);
        if (resolvedTags !== true) {
            res.status(400).json({ tagErrors: resolvedTags });
            return;
        }

        const user = await DiscordAPI.getUserInfo(access_token);

        if (!user.success) {
            res.status(401).json('Invalid access token');
            return;
        }

        if (!Verifiers.has(user.data.id)) {
            ServerLogger.logSecurity(POSTApplicationRoutes.Modify, user.data);
            res.sendStatus(401);
            return;
        }

        const applicationInQuestion = await ApplicationModel.findById(guildId);

        if (!applicationInQuestion) {
            res.status(404).json(`An application for guild ID ${guildId} doesn't exist`);
            return;
        }

        const oldTags = [...applicationInQuestion.tags];

        applicationInQuestion.tags = tags;

        await ApplicationModel.findByIdAndUpdate(guildId, applicationInQuestion, { new: true });

        ServerLogger.applications.logModified(applicationInQuestion, user.data, oldTags);

        res.sendStatus(200);
    } catch (error) {
        ServerLogger.logError(POSTApplicationRoutes.Modify, error);
        res.sendStatus(500);
    }
}

export default modifyApplicationTags;
