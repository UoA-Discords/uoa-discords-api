import { Invite } from './Discord';

interface ApplicationBase {
    /** Guild ID used for indexing. */
    _id: string;
    source: 'web' | 'bot';
    createdTimestamp: number;
    invite: Invite;
}

export interface WebApplication extends ApplicationBase {
    source: 'web';
}

export interface BotApplication extends ApplicationBase {
    source: 'bot';
    botId: string;
}

export type Application = WebApplication | BotApplication;
