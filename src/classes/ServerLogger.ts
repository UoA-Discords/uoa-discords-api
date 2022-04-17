import {
    APIResponse,
    CombinedRoutes,
    DiscordAPI,
    Guild,
    POSTApplicationRoutes,
    POSTAuthRoutes,
    TagNames,
    User,
} from '@uoa-discords/shared-utils';
import { _ApplicationServer, _RegisteredServer } from '../types/DatabaseObjects';
import Logger from './Logger';

abstract class ApplicationLogger {
    private static readonly webApplicationsCreatedLog = new Logger({ name: 'created-web', path: 'applications' });
    private static readonly botApplicationsCreatedLog = new Logger({ name: 'created-bot', path: 'applications' });
    private static readonly applicationsAcceptedLog = new Logger({ name: 'accepted', path: 'applications' });
    private static readonly applicationsRejectedLog = new Logger({ name: 'rejected', path: 'applications' });
    private static readonly applicationsModifiedLog = new Logger({ name: 'modified', path: 'applications' });

    public static logCreated(created: _ApplicationServer, guild: Guild, dryRun: boolean): void;
    public static logCreated(created: _ApplicationServer, guild: Guild, dryRun: boolean, botId: string): void;
    public static logCreated(created: _ApplicationServer, guild: Guild, dryRun: boolean, botId?: string): void {
        const { addedBy: user, inviteCode } = created;

        if (botId) {
            // TODO: bot logging
        }
        const msg: string[] = [
            `${user.username}#${user.discriminator} (${user.id}) created an application`,
            `Guild: "${guild.name}" (${guild.id})`,
            `Invite: https://discord.gg/${inviteCode}`,
        ];

        if (dryRun) msg.push('Dry run');

        this.webApplicationsCreatedLog.log(...msg);
    }

    public static async logAccepted(accepted: _RegisteredServer): Promise<void> {
        const inviteQuery = await DiscordAPI.getInviteData(accepted.inviteCode);

        if (!inviteQuery.success) {
            ServerLogger.logError(
                POSTApplicationRoutes.Accept,
                'Failed to fetch invite data',
                'Accepted application:',
                accepted,
                'Query response:',
                inviteQuery.error,
            );
            return;
        }

        const { data: invite } = inviteQuery;
        if (!invite.guild) {
            ServerLogger.logError(
                POSTApplicationRoutes.Accept,
                'Failed to fetch invite guild data',
                'Registered server:',
                accepted,
                'Invite:',
                invite,
            );
            return;
        }

        const msg: string[] = [
            `Application for "${invite.guild.name}" (${invite.guild.id}) accepted`,
            `By: ${accepted.approvedBy.username}#${accepted.approvedBy.discriminator} (${accepted.approvedBy.id})`,
            `Made by: ${accepted.addedBy.username}#${accepted.addedBy.discriminator} (${accepted.addedBy.id})`,
        ];

        this.applicationsAcceptedLog.log(...msg);
    }

    public static async logRejected(rejected: _ApplicationServer, user: User): Promise<void> {
        const inviteQuery = await DiscordAPI.getInviteData(rejected.inviteCode);

        if (!inviteQuery.success) {
            ServerLogger.logError(
                POSTApplicationRoutes.Reject,
                'Failed to fetch invite data',
                'Rejected application:',
                rejected,
                'Query response:',
                inviteQuery.error,
            );
            return;
        }

        const { data: invite } = inviteQuery;
        if (!invite.guild) {
            ServerLogger.logError(
                POSTApplicationRoutes.Reject,
                'Failed to fetch invite guild data',
                'Rejected server:',
                rejected,
                'Invite:',
                invite,
            );
            return;
        }

        const msg: string[] = [
            `Application for "${invite.guild.name}" (${invite.guild.id}) rejected`,
            `By: ${user.username}#${user.discriminator} (${user.id})`,
            `Made by: ${rejected.addedBy.username}#${rejected.addedBy.discriminator} (${rejected.addedBy.id})`,
        ];

        this.applicationsRejectedLog.log(...msg);
    }

    public static async logModified(modified: _ApplicationServer, user: User, oldTags: TagNames[]): Promise<void> {
        const inviteQuery = await DiscordAPI.getInviteData(modified.inviteCode);

        if (!inviteQuery.success) {
            ServerLogger.logError(
                POSTApplicationRoutes.Modify,
                'Failed to fetch invite data',
                'Modified application:',
                modified,
                'Query response:',
                inviteQuery.error,
            );
            return;
        }

        const { data: invite } = inviteQuery;
        if (!invite.guild) {
            ServerLogger.logError(
                POSTApplicationRoutes.Modify,
                'Failed to fetch invite guild data',
                'Modified server:',
                modified,
                'Invite:',
                invite,
            );
            return;
        }

        const addedTags = modified.tags.filter((e) => !oldTags.includes(e));
        const removedTags = oldTags.filter((e) => !modified.tags.includes(e));

        const msg: string[] = [
            `Application for "${invite.guild.name}" (${invite.guild.id}) tags modified`,
            `By: ${user.username}#${user.discriminator} (${user.id})`,
            `Made by: ${modified.addedBy.username}#${modified.addedBy.discriminator} (${modified.addedBy.id})`,
            `+ Added: ${addedTags.length ? addedTags.join(', ') : 'None'}`,
            `- Removed: ${removedTags.length ? removedTags.join(', ') : 'None'}`,
        ];

        this.applicationsModifiedLog.log(...msg);
    }
}

abstract class SessionLogger {
    private static readonly sessionsLog = new Logger({ name: 'sessions' });

    public static async logIn(access_token: string): Promise<void> {
        const userQuery = await DiscordAPI.getUserInfo(access_token);

        if (!userQuery.success) {
            ServerLogger.logError(POSTAuthRoutes.GetToken, 'Failed to fetch user data', userQuery.error);
            return;
        }

        const { data: user } = userQuery;

        this.sessionsLog.log(`${user.username}#${user.discriminator} (${user.id}) logged in`);
    }

    public static async logRefresh(access_token: string): Promise<void> {
        const userQuery = await DiscordAPI.getUserInfo(access_token);

        if (!userQuery.success) {
            ServerLogger.logError(POSTAuthRoutes.RefreshToken, 'Failed to fetch user data', userQuery.error);
            return;
        }

        const { data: user } = userQuery;

        this.sessionsLog.log(`${user.username}#${user.discriminator} (${user.id}) refreshed token`);
    }

    /** This method is slightly different since we need to get the user details before they log out. */
    public static logOut(userQuery: APIResponse<User>): void {
        if (!userQuery.success) {
            ServerLogger.logError(POSTAuthRoutes.RevokeToken, 'Failed to fetch user data', userQuery.error);
            return;
        }

        const { data: user } = userQuery;

        this.sessionsLog.log(`${user.username}#${user.discriminator} (${user.id}) logged out`);
    }
}

export default abstract class ServerLogger {
    // applications
    public static readonly applications = ApplicationLogger;

    // sessions
    public static readonly sessions = SessionLogger;

    // security
    private static readonly securityLog = new Logger({ name: 'security' });

    // error
    private static readonly errorLog = new Logger({ name: 'error' });

    public static logSecurity(endpoint: CombinedRoutes, user: User): void {
        this.securityLog.log(`${endpoint}:`, `${user.username}#${user.discriminator} (${user.id})`);
    }

    public static logError(endpoint: CombinedRoutes, ...errors: unknown[]): void {
        this.errorLog.log(`${endpoint}:`, ...errors);
    }
}
