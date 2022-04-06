import { Schema, model } from 'mongoose';
import { Application } from '../types/ServerApplication';

export const ApplicationSchema = new Schema<Application>({
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
    tags: [String],
});

export const ApplicationModel = model('server_applications', ApplicationSchema);
