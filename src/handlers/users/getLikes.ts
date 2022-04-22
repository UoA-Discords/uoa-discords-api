import { GETRoutes } from '@uoa-discords/shared-utils';
import { Request, Response } from 'express';
import Caches from '../../classes/Caches';
import ServerLogger from '../../classes/ServerLogger';
import { UserModel } from '../../models/UserModel';

async function getCacheOrAddTo(id: string): Promise<string[]> {
    const existing = Caches.likesCache.getItem(id);
    if (existing) return existing;
    const likesQuery = await UserModel.findById(id);

    const data = likesQuery?.guildsLiked || [];

    Caches.likesCache.addItem(id, data);

    return data;
}

async function getLikes(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        if (typeof id !== 'string') {
            res.status(400).json(`User ID must be a string (got ${typeof id})`);
            return;
        }

        const likes = await getCacheOrAddTo(id);

        res.status(200).json(likes);
        return;
    } catch (error) {
        ServerLogger.logError(GETRoutes.GetUserLikes, error);
        res.sendStatus(500);
    }
}

export default getLikes;
