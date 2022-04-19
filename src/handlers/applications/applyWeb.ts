import {
    ApplicationServer,
    BlacklistedGuilds,
    BlacklistedUsers,
    DiscordAPI,
    GuildRequirements,
    OptOutGuilds,
    POSTApplicationRoutes,
    Verifiers,
    WebApplicationRequest,
} from '@uoa-discords/shared-utils';
import { Request, Response } from 'express';
import ServerLogger from '../../classes/ServerLogger';
import ApplicationHelpers from '../../helpers/ApplicationHelpers';
import AuthHelpers from '../../helpers/AuthHelpers';
import { ApplicationModel } from '../../models/ApplicationModel';
import { RegisteredServerModel } from '../../models/RegisteredServerModel';

/** Handles a server application made from the website. */
async function applyWeb(req: Request<undefined, undefined, WebApplicationRequest>, res: Response): Promise<void> {
    try {
        const { inviteCode, authToken, tags, dryRun } = req.body;

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

        // user blacklisted
        if (BlacklistedUsers.has(user.data.id)) {
            AuthHelpers.revokeToken(authToken);
            res.status(400).json('You are blacklisted');
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

        const newApplication: ApplicationServer = {
            _id: invite.data.guild.id,
            inviteCode: invite.data.code,
            tags,
            addedAt: Date.now(),
            addedBy: user.data,
            bot: null,
        };

        if (!dryRun) {
            await ApplicationModel.create(newApplication);
        }

        ServerLogger.applications.logCreated(newApplication, invite.data.guild, !!dryRun);

        const output = {
            message: `Successfully created an application for ${invite.data.guild.name} (${invite.data.code})`,
            verifierOverride,
        };

        res.status(201).json(output);
    } catch (error) {
        ServerLogger.logError(POSTApplicationRoutes.ApplyWeb, error);
        res.sendStatus(500);
    }
}

export default applyWeb;
