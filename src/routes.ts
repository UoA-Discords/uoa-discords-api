import { Router } from 'express';
import applyBot from './handlers/applications/applyBot';
import applyWeb from './handlers/applications/applyWeb';
import getApplications from './handlers/applications/getApplications';
import getToken from './handlers/auth/getToken';
import refreshToken from './handlers/auth/refreshToken';
import revokeToken from './handlers/auth/revokeToken';
import getGuilds from './handlers/getGuilds.ts';

const router = Router();

router.post('/applications/applyWeb', applyWeb);
router.post('/applications/applyBot', applyBot);

router.get('/applications', getApplications);

router.post('/auth/getToken', getToken);
router.post('/auth/refreshToken', refreshToken);
router.post('/auth/revokeToken', revokeToken);

router.post('/user/guilds', getGuilds);

export default router;
