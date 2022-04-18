import { Schema, model } from 'mongoose';
import { _ApplicationServer } from '../types/DatabaseObjects';

export const ApplicationSchema = new Schema<_ApplicationServer>({
    _id: String,
    inviteCode: String,
    tags: [String],
    addedAt: Number,
    addedBy: {},
    bot: {},
});

export const ApplicationModel = model('server_applications', ApplicationSchema);
