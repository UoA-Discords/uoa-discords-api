import axios from 'axios';
import { Request, Response } from 'express';
import Config from '../../types/Config';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { discordClientID: client_id, discordClientSecret: client_secret }: Config = require('../../../config.json');

/** Revokes a Discord access token. */
async function revokeToken(req: Request, res: Response): Promise<void> {
    try {
        const { token } = req.body;
        if (typeof token !== 'string') {
            res.status(400).json(`body "token" must be a string (got ${typeof token})`);
            return;
        }

        const params = new URLSearchParams();
        params.set('client_id', client_id);
        params.set('client_secret', client_secret);
        params.set('token', token);

        const { status, statusText } = await axios.post('https://discord.com/api/v9/oauth2/token/revoke', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        res.status(status).json(statusText);
        return;
    } catch (error) {
        res.status(500).json(error instanceof Error ? error.message : 'Unknown error occurred');
    }
}

export default revokeToken;
