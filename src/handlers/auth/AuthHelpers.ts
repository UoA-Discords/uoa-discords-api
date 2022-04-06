import { AccessTokenResponse, APIResponse } from '@uoa-discords/shared-utils';
import axios, { AxiosError, AxiosInstance } from 'axios';
import Config from '../../types/Config';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { discordClientID: client_id, discordClientSecret: client_secret }: Config = require('../../../config.json');

export default abstract class AuthHelpers {
    private static readonly _OAuthServer: AxiosInstance = axios.create({
        baseURL: 'https://discord.com/api/v9/oauth2',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    private static makeRequestBody(): URLSearchParams {
        const params = new URLSearchParams();
        params.set('client_id', client_id);
        params.set('client_secret', client_secret);

        return params;
    }

    public static async getToken(code: string, redirect_uri: string): Promise<APIResponse<AccessTokenResponse>> {
        try {
            const body = this.makeRequestBody();
            body.set('code', code);
            body.set('redirect_uri', redirect_uri);
            body.set('grant_type', 'authorization_code');

            const { data, status, statusText } = await this._OAuthServer.post<AccessTokenResponse>('/token', body);

            if (status !== 200) {
                console.warn(`Got status code ${status} trying to get token with message: ${statusText}`, data);
            }

            return { success: true, data };
        } catch (error) {
            return { success: false, error: error as Error as AxiosError };
        }
    }

    public static async refreshToken(refresh_token: string): Promise<APIResponse<AccessTokenResponse>> {
        try {
            const body = this.makeRequestBody();
            body.set('refresh_token', refresh_token);
            body.set('grant_type', 'refresh_token');

            const { data, status, statusText } = await this._OAuthServer.post<AccessTokenResponse>('/token', body);

            if (status !== 200) {
                console.warn(`Got status code ${status} trying to refresh token with message: ${statusText}`, data);
            }

            return { success: true, data };
        } catch (error) {
            return { success: false, error: error as Error as AxiosError };
        }
    }

    public static async revokeToken(token: string): Promise<APIResponse<boolean>> {
        try {
            const body = this.makeRequestBody();
            body.set('token', token);

            const { data, status, statusText } = await this._OAuthServer.post<boolean>('/token/revoke', body);

            if (status !== 200) {
                console.warn(`Got status code ${status} trying to get token with message: ${statusText}`, data);
            }

            return { success: true, data };
        } catch (error) {
            return { success: false, error: error as Error as AxiosError };
        }
    }
}
