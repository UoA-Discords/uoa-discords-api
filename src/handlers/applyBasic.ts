import { Request, Response } from 'express';
import verifyDiscordInvite from '../helpers/verifyDiscordInvite';
import { ApplicationModel } from '../models/ApplicationModel';

async function applyBasic(req: Request, res: Response): Promise<void> {
    try {
        const { inviteURL } = req.body;
        if (typeof inviteURL !== 'string') {
            res.status(400).json(`inviteURL must be a string (got ${typeof inviteURL})`);
            return;
        }

        const verified = await verifyDiscordInvite(inviteURL);

        if (!verified.valid) {
            res.status(400).json(verified.reason);
            return;
        }

        const existingApplication = await ApplicationModel.findById(verified.invite.guild.id);
        if (existingApplication !== null) {
            res.status(400).json(`Already have an application for ${verified.invite.guild.name}`);
            return;
        }

        try {
            await ApplicationModel.create({
                _id: verified.invite.guild.id,
                source: 'web',
                invite: verified.invite,
            });
        } catch (error) {
            res.status(201).json(error instanceof Error ? error.message : 'Unknown error occurred');
            return;
        }

        res.status(201).json(`Successfully created an application for ${verified.invite.guild.name}`);
        return;
    } catch (error) {
        res.status(500).json(error instanceof Error ? error.message : 'Unknown error occurred');
    }
}

export default applyBasic;
