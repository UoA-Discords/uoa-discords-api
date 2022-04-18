import { POSTAuthRoutes } from '@uoa-discords/shared-utils';
import { Request, Response } from 'express';
import ServerLogger from '../../classes/ServerLogger';
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
            res.status(400).json(`Body 'code' must be a string (got ${typeof code})`);
            return;
        }

        if (typeof redirect_uri !== 'string') {
            res.status(400).json(`Body 'redirect_uri' must be a string (got ${typeof redirect_uri})`);
            return;
        }

        const apiResponse = await AuthHelpers.getToken(code, redirect_uri);
        if (apiResponse.success) {
            ServerLogger.sessions.logIn(apiResponse.data.access_token);
            res.status(200).json(apiResponse.data);
        } else throw apiResponse.error;
    } catch (error) {
        ServerLogger.logError(POSTAuthRoutes.GetToken, error);
        res.sendStatus(500);
    }
}

export default getToken;
