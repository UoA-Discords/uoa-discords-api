import { DiscordAPI, POSTAuthRoutes } from '@uoa-discords/shared-utils';
import { Request, Response } from 'express';
import ServerLogger from '../../classes/ServerLogger';
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
        ServerLogger.sessions.logOut(user);

        const apiResponse = await AuthHelpers.revokeToken(token);

        if (apiResponse.success) res.status(200).json(apiResponse.data);
        else res.sendStatus(500);
    } catch (error) {
        ServerLogger.logError(POSTAuthRoutes.RevokeToken, error);
        res.sendStatus(500);
    }
}

export default revokeToken;
