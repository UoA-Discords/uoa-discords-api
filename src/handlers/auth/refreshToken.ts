import axios from 'axios';
import { Request, Response } from 'express';
import Config from '../../types/Config';
import { AccessTokenResponse } from '../../types/Discord';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { discordClientID: client_id, discordClientSecret: client_secret }: Config = require('../../../config.json');

/** Refreshes a Discord access token.
 *
 * @see {@link https://discord.com/developers/docs/topics/oauth2#authorization-code-grant-refresh-token-exchange-example}
 */
async function refreshToken(req: Request, res: Response): Promise<void> {
    try {
        const { refresh_token } = req.body;
        if (typeof refresh_token !== 'string') {
            res.status(400).json(`body "refresh_token" must be a string (got ${typeof refresh_token})`);
            return;
        }

        const response = await axios.post<AccessTokenResponse>(
            'https://discord.com/api/oauth2/token',
            {
                client_id,
                client_secret,
                grant_type: 'refresh_token',
                refresh_token,
            },
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            },
        );

        res.status(200).json(response);
        return;
    } catch (error) {
        res.status(500).json(error instanceof Error ? error.message : 'Unknown error occurred');
    }
}

export default refreshToken;
