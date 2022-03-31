import { Router } from 'express';
import applyBasic from './handlers/applyBasic';
import getApplications from './handlers/getApplications';

const router = Router();

router.post('/applyBasic', applyBasic);
router.get('/applications', getApplications);

export default router;
