import { DiscordAPI, TagNames, Tags, Verifiers } from '@uoa-discords/shared-utils';
import { Request, Response } from 'express';
import server from '../..';
import ApplicationHelpers from '../../helpers/ApplicationHelpers';
import { ApplicationModel } from '../../models/ApplicationModel';

async function modifyApplicationTags(req: Request, res: Response): Promise<void> {
    try {
        const { access_token, guildId, tags }: { access_token: string; guildId: string; tags: TagNames[] } = req.body;

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

        if (tags.length && tags.some((tag) => typeof tag !== 'number')) {
            console.log(tags);
            res.status(400).json('body "tags" must be an array of integers (found non-integers)');
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
            server.securityLog.log(
                `Non-verifier ${user.data.username}#${user.data.discriminator} tried to edit application tags for ${guildId}.`,
            );
            res.status(401).json('You do not have permission to view this');
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

        const addedTags = tags.filter((e) => oldTags.indexOf(e) === -1).map((e) => Tags[e].name);
        const removedTags = oldTags.filter((e) => tags.indexOf(e) === -1).map((e) => Tags[e].name);

        server.auditLog.log(
            `${user.data.username}#${user.data.discriminator} updated application tags for ${applicationInQuestion.invite.guild?.name}`,
            `Added: ${addedTags.length ? addedTags.join(',') : 'none'}`,
            `Removed: ${removedTags.length ? removedTags.join(',') : 'none'}`,
        );

        res.sendStatus(200);
    } catch (error) {
        server.errorLog.log('applications/modifyTags', error);
        res.sendStatus(500);
    }
}

export default modifyApplicationTags;
