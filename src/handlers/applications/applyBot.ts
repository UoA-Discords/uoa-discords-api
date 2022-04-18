import {
    BlacklistedGuilds,
    BlacklistedUsers,
    BotApplicationRequest,
    DiscordAPI,
    GuildRequirements,
    OptOutGuilds,
    POSTApplicationRoutes,
    User,
    Verifiers,
} from '@uoa-discords/shared-utils';
import { Request, Response } from 'express';
import ServerLogger from '../../classes/ServerLogger';
import ApplicationHelpers from '../../helpers/ApplicationHelpers';
import AuthHelpers from '../../helpers/AuthHelpers';
import { ApplicationModel } from '../../models/ApplicationModel';
import { RegisteredServerModel } from '../../models/RegisteredServerModel';
import { _ApplicationServer } from '../../types/DatabaseObjects';

/** Handles a server application made by a bot. */
async function applyBot(req: Request<undefined, undefined, BotApplicationRequest>, res: Response): Promise<void> {
    try {
        const { inviteCode, authToken, tags, dryRun, user } = req.body;

        if (typeof inviteCode !== 'string') {
            res.status(400).json(`Body 'inviteCode' must be a string (got ${typeof inviteCode})`);
            return;
        }

        if (typeof authToken !== 'string') {
            res.status(400).json(`Body 'authToken' must be a string (got ${typeof authToken})`);
            return;
        }

        if (!Array.isArray(tags)) {
            res.status(400).json(`Body 'tags' must be an array (got ${typeof tags})`);
            return;
        }

        const resolvedTags = ApplicationHelpers.validateTagArray(tags);
        if (resolvedTags !== true) {
            res.status(400).json({ tagErrors: resolvedTags });
            return;
        }

        const invite = await DiscordAPI.getInviteData(inviteCode);

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
        if (invite.data.approximate_member_count < GuildRequirements.minMemberCount) {
            res.status(400).json(
                `Member count must be greater than or equal to ${GuildRequirements.minMemberCount} (got ${invite.data.approximate_member_count})`,
            );
            return;
        }

        // no guild icon
        if (!invite.data.guild.icon) {
            res.status(400).json(`${invite.data.guild.name} must have a server icon`);
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

        // user blacklisted
        if (BlacklistedUsers.has(user.id)) {
            AuthHelpers.revokeToken(authToken);
            res.status(400).json(`${user.username} is blacklisted`);
            return;
        }

        // guild opt-out
        if (OptOutGuilds.has(invite.data.guild.id)) {
            res.status(400).json('That guild has opted out of the registry');
            return;
        }

        // TODO: bot validation
        const verifiedBot: User = {
            id: '123456789',
            username: 'UoaDiscordsBot',
            discriminator: '#0000',
            public_flags: 0,
            avatar: '',
        };

        // user has pending application
        let verifierOverride = false;
        const otherApplication = await ApplicationModel.findOne({ 'createdBy.id': user.id });
        if (otherApplication) {
            if (Verifiers.has(user.id)) {
                verifierOverride = true;
            } else {
                res.status(400).json('Can only submit one application at a time');
                return;
            }
        }

        const newApplication: _ApplicationServer = {
            _id: invite.data.guild.id,
            inviteCode: invite.data.code,
            tags,
            addedAt: Date.now(),
            addedBy: user,
            bot: verifiedBot,
        };

        if (!dryRun) {
            // await ApplicationModel.create(newApplication);
        }

        ServerLogger.applications.logCreated(newApplication, invite.data.guild, !!dryRun, verifiedBot.id);

        const output = {
            message: `Successfully created an application for ${invite.data.guild.name} (${invite.data.code})`,
            verifierOverride,
        };

        res.status(201).json(output);
    } catch (error) {
        ServerLogger.logError(POSTApplicationRoutes.ApplyBot, error);
        res.sendStatus(500);
    }
}

export default applyBot;
