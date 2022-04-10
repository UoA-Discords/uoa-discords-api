import { Request, Response } from 'express';
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
            res.status(200).json(apiResponse.data);
        } else throw apiResponse.error;
    } catch (error) {
        res.status(500).json(error instanceof Error ? error.message : 'Unknown error occurred');
    }
}

export default getToken;
