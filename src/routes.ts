import { Router } from 'express';
import acceptApplication from './handlers/applications/acceptApplication';
import applyBot from './handlers/applications/applyBot';
import applyWeb from './handlers/applications/applyWeb';
import getApplications from './handlers/applications/getApplications';
import rejectApplication from './handlers/applications/rejectApplication';
import getToken from './handlers/auth/getToken';
import refreshToken from './handlers/auth/refreshToken';
import revokeToken from './handlers/auth/revokeToken';

const router = Router();

router.post('/applications/applyWeb', applyWeb);
router.post('/applications/applyBot', applyBot);
router.post('/applications/accept', acceptApplication);
router.post('/applications/reject', rejectApplication);

router.get('/applications', getApplications);

router.post('/auth/getToken', getToken);
router.post('/auth/refreshToken', refreshToken);
router.post('/auth/revokeToken', revokeToken);

export default router;
