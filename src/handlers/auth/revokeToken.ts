import { Request, Response } from 'express';
import AuthHelpers from '../../helpers/AuthHelpers';

/** Revokes a Discord access token. */
async function revokeToken(req: Request, res: Response): Promise<void> {
    try {
        const { token } = req.body;
        if (typeof token !== 'string') {
            res.status(400).json(`body "token" must be a string (got ${typeof token})`);
            return;
        }

        const apiResponse = await AuthHelpers.revokeToken(token);
        if (apiResponse.success) {
            res.status(200).json(apiResponse.data);
        } else throw apiResponse.error;
    } catch (error) {
        res.status(500).json(error instanceof Error ? error.message : 'Unknown error occurred');
    }
}

export default revokeToken;
