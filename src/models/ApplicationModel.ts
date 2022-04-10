import { Schema, model } from 'mongoose';
import { ServerApplication } from '../types/ServerApplication';

export const ApplicationSchema = new Schema<ServerApplication>({
    _id: String,
    source: String,
    createdAt: {
        type: Number,
        default: Date.now,
    },
    createdBy: {},
    invite: {},
    botId: {
        type: String,
        required: false,
    },
    tags: [Number],
});

export const ApplicationModel = model('server_applications', ApplicationSchema);
