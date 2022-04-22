import { GETRoutes, POSTApplicationRoutes, POSTAuthRoutes } from '@uoa-discords/shared-utils';
import { Router } from 'express';
import {
    acceptApplication,
    applyBot,
    applyWeb,
    getApplications,
    modifyApplicationTags,
    rejectApplication,
} from './handlers/applications';
import { getToken, refreshToken, revokeToken } from './handlers/auth';
import getServers from './handlers/servers/getServers';
import getLikes from './handlers/users/getLikes';

const router = Router();

router.post(POSTApplicationRoutes.ApplyWeb, applyWeb);
router.post(POSTApplicationRoutes.ApplyBot, applyBot);
router.post(POSTApplicationRoutes.Accept, acceptApplication);
router.post(POSTApplicationRoutes.Reject, rejectApplication);
router.post(POSTApplicationRoutes.Modify, modifyApplicationTags);

router.get(GETRoutes.GetApplications, getApplications);
router.get(GETRoutes.GetServers, getServers);
router.get(GETRoutes.GetUserLikes, getLikes);

router.post(POSTAuthRoutes.GetToken, getToken);
router.post(POSTAuthRoutes.RefreshToken, refreshToken);
router.post(POSTAuthRoutes.RevokeToken, revokeToken);

export default router;
