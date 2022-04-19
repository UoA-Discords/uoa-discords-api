import { Schema, model } from 'mongoose';
import { ApplicationServer } from '@uoa-discords/shared-utils';

export const ApplicationSchema = new Schema<ApplicationServer>({
    _id: String,
    inviteCode: String,
    tags: [String],
    addedAt: Number,
    addedBy: {},
    bot: {},
});

export const ApplicationModel = model('server_applications', ApplicationSchema);
