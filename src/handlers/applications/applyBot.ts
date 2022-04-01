import { Request, Response } from 'express';

/** Handles a server application made by a bot. */
// eslint-disable-next-line require-await
async function applyBot(req: Request, res: Response): Promise<void> {
    try {
        res.status(501).json('Not yet implemented');
        return;
    } catch (error) {
        res.status(500).json(error instanceof Error ? error.message : 'Unknown error occurred');
    }
}

export default applyBot;
