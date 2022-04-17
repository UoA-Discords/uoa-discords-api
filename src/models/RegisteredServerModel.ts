import { Schema, model } from 'mongoose';
import { _RegisteredServer } from '../types/DatabaseObjects';

export const RegisteredServerSchema = new Schema<_RegisteredServer>({
    _id: String,
    inviteCode: String,
    tags: [String],
    addedAt: Number,
    addedBy: {},
    approvedBy: {},
    approvedAt: Number,
    bot: {},
    memberCountHistory: [Number],
});

export const RegisteredServerModel = model('registered_servers', RegisteredServerSchema);
