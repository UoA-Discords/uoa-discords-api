import { DiscordAPI } from '@uoa-discords/shared-utils';
import { Request, Response } from 'express';
import server from '../..';
import AuthHelpers from '../../helpers/AuthHelpers';

/**
 * Upgrades a user's OAuth code into an access token.
 *
 * {@link https://discord.com/developers/docs/topics/oauth2#authorization-code-grant-refresh-token-exchange-example API Reference}
 */
async function getToken(req: Request, res: Response): Promise<void> {
    try {
        const { code, redirect_uri } = req.body;
        if (typeof code !== 'string') {
            res.status(400).json(`body "code" must be a string (got ${typeof code})`);
            return;
        }

        if (typeof redirect_uri !== 'string') {
            res.status(400).json(`body "redirect_uri" must be a string (got ${typeof redirect_uri})`);
            return;
        }

        const apiResponse = await AuthHelpers.getToken(code, redirect_uri);
        if (apiResponse.success) {
            DiscordAPI.getUserInfo(apiResponse.data.access_token).then((res) => {
                if (res.success) {
                    server.authLog.log(`${res.data.username}#${res.data.discriminator} logged in`);
                } else {
                    server.authLog.log('Failed to get user data on login.', res.error.response?.data);
                }
            });

            res.status(200).json(apiResponse.data);
        } else {
            server.authLog.log('Failed to login.', apiResponse.error.response?.data);
            throw apiResponse.error;
        }
    } catch (error) {
        server.errorLog.log('auth/getToken', error);
        res.sendStatus(500);
    }
}

export default getToken;
