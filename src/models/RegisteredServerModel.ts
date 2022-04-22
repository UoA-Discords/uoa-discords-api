import { Schema, model } from 'mongoose';
import { RegisteredServer } from '@uoa-discords/shared-utils';

export const RegisteredServerSchema = new Schema<RegisteredServer>({
    _id: String,
    inviteCode: String,
    tags: [String],
    addedAt: Number,
    addedBy: {},
    approvedBy: {},
    approvedAt: Number,
    bot: {},
    memberCountHistory: [Number],
    likes: Number,
});

export const RegisteredServerModel = model('registered_servers', RegisteredServerSchema);
