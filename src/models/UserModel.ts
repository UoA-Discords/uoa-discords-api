import { Schema, model } from 'mongoose';
import { WebsiteUser } from '@uoa-discords/shared-utils';

export const UserSchema = new Schema<WebsiteUser>({
    _id: String,
    guildsLiked: [String],
});

export const UserModel = model('users', UserSchema);
