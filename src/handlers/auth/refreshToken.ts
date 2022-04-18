import { POSTAuthRoutes } from '@uoa-discords/shared-utils';
import { Request, Response } from 'express';
import ServerLogger from '../../classes/ServerLogger';
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
            res.status(400).json(`Body 'refresh_token' must be a string (got ${typeof refresh_token})`);
            return;
        }

        const apiResponse = await AuthHelpers.refreshToken(refresh_token);
        if (apiResponse.success) {
            ServerLogger.sessions.logRefresh(apiResponse.data.access_token);
            res.status(200).json(apiResponse.data);
        } else throw apiResponse.error;
        return;
    } catch (error) {
        ServerLogger.logError(POSTAuthRoutes.RefreshToken, error);
        res.sendStatus(500);
    }
}

export default refreshToken;
