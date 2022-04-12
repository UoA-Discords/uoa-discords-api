import { DiscordAPI } from '@uoa-discords/shared-utils';
import { Request, Response } from 'express';
import server from '../..';
import AuthHelpers from '../../helpers/AuthHelpers';

/** Revokes a Discord access token. */
async function revokeToken(req: Request, res: Response): Promise<void> {
    try {
        const { token } = req.body;
        if (typeof token !== 'string') {
            res.status(400).json(`body "token" must be a string (got ${typeof token})`);
            return;
        }

        const user = await DiscordAPI.getUserInfo(token);

        const apiResponse = await AuthHelpers.revokeToken(token);
        if (apiResponse.success) {
            if (user.success) {
                server.authLog.log(`${user.data.username}#${user.data.discriminator} logged out`);
            } else {
                server.authLog.log('Failed to get user data on logout.', user.error.response?.data);
            }

            res.status(200).json(apiResponse.data);
        } else throw apiResponse.error;
    } catch (error) {
        server.errorLog.log('/auth/revokeToken', error);
        res.sendStatus(500);
    }
}

export default revokeToken;
