import { DiscordAPI } from '@uoa-discords/shared-utils';
import { Request, Response } from 'express';
import server from '../..';
import AuthHelpers from '../../helpers/AuthHelpers';

/**
 * Refreshes a Discord access token.
 *
 * {@link https://discord.com/developers/docs/topics/oauth2#authorization-code-grant-refresh-token-exchange-example API Reference}
 */
async function refreshToken(req: Request, res: Response): Promise<void> {
    try {
        const { refresh_token } = req.body;
        if (typeof refresh_token !== 'string') {
            res.status(400).json(`body "refresh_token" must be a string (got ${typeof refresh_token})`);
            return;
        }

        const apiResponse = await AuthHelpers.refreshToken(refresh_token);
        if (apiResponse.success) {
            DiscordAPI.getUserInfo(apiResponse.data.access_token).then((res) => {
                if (res.success) {
                    server.authLog.log(`${res.data.username}#${res.data.discriminator} refreshed session`);
                } else {
                    server.authLog.log('Failed to get user data on refresh.', res.error.response?.data);
                }
            });
            res.status(200).json(apiResponse.data);
        } else throw apiResponse.error;

        return;
    } catch (error) {
        server.errorLog.log('/auth/refreshToken', error);
        res.sendStatus(500);
    }
}

export default refreshToken;
