import { Schema, model } from 'mongoose';
import { BotApplication, WebApplication } from '../types/ServerApplication';

export const ApplicationSchema = new Schema<WebApplication | BotApplication>({
    _id: String,
    source: String,
    createdTimestamp: {
        type: Number,
        default: Date.now,
    },
    invite: {},
    botId: {
        type: String,
        required: false,
    },
});

export const ApplicationModel = model('server_applications', ApplicationSchema);
