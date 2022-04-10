import { Invite, TagNames, User } from '@uoa-discords/shared-utils';

interface ApplicationBase {
    /** Guild ID used for indexing. */
    _id: string;
    source: 'web' | 'bot';
    createdAt: number;
    createdBy: User;
    invite: Invite;
    tags: TagNames[];
}

export interface WebApplication extends ApplicationBase {
    source: 'web';
}

export interface BotApplication extends ApplicationBase {
    source: 'bot';
    botId: string;
}

export type ServerApplication = WebApplication | BotApplication;
