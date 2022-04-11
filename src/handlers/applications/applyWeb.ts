import {
    BlacklistedGuilds,
    DiscordAPI,
    HelperAPI,
    OptOutGuilds,
    Verifiers,
    WebApplication,
} from '@uoa-discords/shared-utils';
import { Request, Response } from 'express';
import ApplicationHelpers from '../../helpers/ApplicationHelpers';
import { ApplicationModel } from '../../models/ApplicationModel';
import { RegisteredServerModel } from '../../models/RegisteredServerModel';
import { ServerApplication } from '../../types/ServerApplication';

/** Handles a server application made from the website. */
// eslint-disable-next-line require-await
async function applyWeb(req: Request, res: Response): Promise<void> {
    try {
        const { inviteCode, authToken, tags, dryRun }: WebApplication = req.body;

        if (typeof inviteCode !== 'string') {
            res.status(400).json(`body "inviteCode" must be a string (got ${typeof inviteCode})`);
            return;
        }

        if (typeof authToken !== 'string') {
            res.status(400).json(`body "authToken" must be a string (got ${typeof authToken})`);
            return;
        }

        if (!Array.isArray(tags)) {
            res.status(400).json(`body "tags" must be an array (got ${typeof tags})`);
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

        const [user, invite, guilds] = await Promise.all([
            DiscordAPI.getUserInfo(authToken),
            DiscordAPI.getInviteData(inviteCode),
            DiscordAPI.getUserGuilds(authToken),
        ]);

        // access token invalid
        if (!user.success || !guilds.success) {
            res.status(401).json('Invalid access token');
            return;
        }

        // invite invalid
        if (!invite.success) {
            res.status(400).json('Invalid invite code');
            return;
        }

        // invite expires
        if (invite.data.expires_at) {
            res.status(400).json('Invite cannot have an expiry date');
            return;
        }

        // no guild
        if (!invite.data.guild) {
            res.status(400).json('No guild found for that invite');
            return;
        }

        // guild too small
        if (invite.data.approximate_member_count < HelperAPI.MIN_ACCEPTABLE_MEMBERS) {
            res.status(400).json(
                `Member count must be greater than or equal to ${HelperAPI.MIN_ACCEPTABLE_MEMBERS} (got ${invite.data.approximate_member_count})`,
            );
            return;
        }

        // no guild icon
        if (!invite.data.guild.icon) {
            res.status(400).json(`${invite.data.guild.name} must have a server icon`);
            return;
        }

        // user not in guild
        const guildIdSet = new Set<string>(guilds.data.map(({ id }) => id));
        if (!guildIdSet.has(invite.data.guild.id)) {
            res.status(400).json(`You must be in ${invite.data.guild.name}`);
            return;
        }

        // guild already applied
        const existingApplication = await ApplicationModel.findById(invite.data.guild.id);
        if (existingApplication) {
            res.status(400).json('An application for that guild already exists');
            return;
        }

        // guild already accepted
        const existingServer = await RegisteredServerModel.findById(invite.data.guild.id);
        if (existingServer) {
            res.status(400).json('That guild is already registered');
            return;
        }

        // guild blacklisted
        if (BlacklistedGuilds.has(invite.data.guild.id)) {
            res.status(400).json('That guild is blacklisted');
            return;
        }

        // guild opt-out
        if (OptOutGuilds.has(invite.data.guild.id)) {
            res.status(400).json('That guild has opted out of the registry');
            return;
        }

        // user has pending application
        let verifierOverride = false;
        const otherApplication = await ApplicationModel.findOne({ 'createdBy.id': user.data.id });
        if (otherApplication) {
            if (Verifiers.has(user.data.id)) {
                verifierOverride = true;
            } else {
                res.status(400).json('Can only submit one application at a time');
                return;
            }
        }

        if (!dryRun) {
            const newApplication: ServerApplication = {
                _id: invite.data.guild.id,
                source: 'web',
                createdAt: Date.now(),
                createdBy: user.data,
                invite: invite.data,
                tags,
            };

            await ApplicationModel.create(newApplication);
        }

        const output = {
            message: `Successfully created an application for ${invite.data.guild.name}`,
            verifierOverride,
        };

        res.status(201).json(output);
        return;
    } catch (error) {
        res.status(500).json(error instanceof Error ? error.message : 'Unknown error occurred');
    }
}

export default applyWeb;
