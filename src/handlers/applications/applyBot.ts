import { Request, Response } from 'express';
import server from '../..';

/** Handles a server application made by a bot. */
// eslint-disable-next-line require-await
async function applyBot(req: Request, res: Response): Promise<void> {
    try {
        server.applicationLog.log('Bot application request.');
        res.sendStatus(501);
    } catch (error) {
        server.errorLog.log('applications/applyBot', error);
        res.sendStatus(500);
    }
}

export default applyBot;
