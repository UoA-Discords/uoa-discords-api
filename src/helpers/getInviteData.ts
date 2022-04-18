import { APIResponse, Invite } from '@uoa-discords/shared-utils';
import axios, { AxiosError, AxiosInstance } from 'axios';

const discord: AxiosInstance = axios.create({
    baseURL: 'https://discord.com/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

async function getInviteData(inviteCode: string): Promise<APIResponse<Invite>> {
    try {
        const { status, statusText, data } = await discord.get<Invite>(
            `/invites/${inviteCode}?with_expiration=true&with_counts=true`,
        );

        if (status !== 200) {
            console.warn(`Got status code ${status} trying to get invite data with message: ${statusText}`, data);
        }

        return { success: true, data };
    } catch (error) {
        return {
            success: false,
            error: error as Error as AxiosError,
        };
    }
}

export default getInviteData;
