import { Schema, model } from 'mongoose';
import RegisteredServer from '../types/RegisteredServer';

export const RegisteredServerSchema = new Schema<RegisteredServer>({
    _id: String,
    guildId: String,
    inviteObject: {},
    tags: [Number],
    addedVia: String,
    appliedAt: {
        type: Number,
        default: Date.now,
    },
    addedBy: {},
    approvedBy: {},
    approvedAt: {
        type: Number,
        default: Date.now,
    },
});

export const RegisteredServerModel = model('registered_servers', RegisteredServerSchema);
