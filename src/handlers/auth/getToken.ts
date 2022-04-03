import { AccessTokenResponse } from '@uoa-discords/uoa-discords-shared-types';
import axios, { AxiosError } from 'axios';
import { Request, Response } from 'express';
import Config from '../../types/Config';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { discordClientID: client_id, discordClientSecret: client_secret }: Config = require('../../../config.json');

/**
 * Upgrades a user's OAuth code into an access token.
 *
 * @see {@link https://discord.com/developers/docs/topics/oauth2#authorization-code-grant-refresh-token-exchange-example}
 */
async function getToken(req: Request, res: Response): Promise<void> {
    try {
        const { code, redirect_uri } = req.body;
        if (typeof code !== 'string') {
            res.status(400).json(`body "code" must be a string (got ${typeof code})`);
            return;
        }

        if (typeof redirect_uri !== 'string') {
            res.status(400).json(`body "redirect_uri" must be a string (got ${typeof code})`);
            return;
        }

        const params = new URLSearchParams();
        params.set('client_id', client_id);
        params.set('client_secret', client_secret);
        params.set('grant_type', 'authorization_code');
        params.set('code', code);
        params.set('redirect_uri', redirect_uri);

        try {
            const { data } = await axios.post<AccessTokenResponse>('https://discord.com/api/v9/oauth2/token', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            res.status(200).json(data);
        } catch (error) {
            const axiosError = error as AxiosError;
            if (axiosError?.isAxiosError) {
                if (axiosError.response?.status === 400) {
                    res.status(400).json(axiosError.response.data);
                    return;
                }
            }

            throw error;
        }
    } catch (error) {
        res.status(500).json(error instanceof Error ? error.message : 'Unknown error occurred');
    }
}

export default getToken;
