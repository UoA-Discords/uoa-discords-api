import { Request, Response } from 'express';
import { ApplicationModel } from '../../models/ApplicationModel';

// temporary auth lmao
const allowed = new Set(['nacho']);

/** Lists all server applications. */
async function getApplications(req: Request, res: Response): Promise<void> {
    try {
        const authorization = req.headers.authorization;
        if (typeof authorization !== 'string') {
            res.status(400).json(`Authorization header must be a string (got ${typeof authorization})`);
            return;
        }

        if (!allowed.has(authorization)) {
            res.status(401).json('Invalid auth token');
            return;
        }

        const applications = await ApplicationModel.find({});

        res.status(200).json(applications);
    } catch (error) {
        res.status(500).json(error instanceof Error ? error.message : 'Unknown error occurred');
    }
}

export default getApplications;
