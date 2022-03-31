import axios from 'axios';
import { Invite } from '../types/Discord';

interface InvalidInvite {
    valid: false;
    reason: string;
}
interface ValidInvite {
    valid: true;
    invite: Invite;
}

export type VerifyInviteResponse = InvalidInvite | ValidInvite;

/** Verifies a Discord invite.
 *
 * Links with expiry dates are always invalid, even if they haven't expired yet.
 *
 * @param {string} invite - Full URL of the invite, e.g. `https://discord.gg/abcd1234`.
 *
 * @returns {Promise<VerifyInviteResponse>} Verification result.
 */
async function verifyDiscordInvite(invite: string): Promise<VerifyInviteResponse> {
    let inviteURL: URL;
    try {
        inviteURL = new URL(invite);
    } catch (error) {
        return { valid: false, reason: 'Invalid invite URL' };
    }

    const invitePayload = inviteURL.pathname.slice(1);

    try {
        const { data } = await axios.get<Invite>(
            `https://discord.com/api/v9/invites/${invitePayload}?with_counts=true&with_expiration=true`,
        );

        if (data.expires_at) {
            return { valid: false, reason: 'Invite has an expiry date' };
        }

        return { valid: true, invite: data };
    } catch (error) {
        return {
            valid: false,
            reason: 'That invite URL does not have a server associated with it',
        };
    }
}

export default verifyDiscordInvite;
