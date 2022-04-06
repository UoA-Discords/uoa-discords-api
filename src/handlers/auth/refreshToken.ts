import { Request, Response } from 'express';
import AuthHelpers from './authHelpers';

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
            res.status(200).json(apiResponse.data);
        } else throw apiResponse.error;

        return;
    } catch (error) {
        res.status(500).json(error instanceof Error ? error.message : 'Unknown error occurred');
    }
}

export default refreshToken;
