import express from 'express';

import SharepointController from '../controllers/sharepointController';

const router = express.Router();

router.route('/sites').get(SharepointController.getSites);

export default router;