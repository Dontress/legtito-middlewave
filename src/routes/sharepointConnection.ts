import express from 'express';

import SharepointConnection from '../controllers/sharepointConnection';

const router = express.Router();

router.route('/create').post(SharepointConnection.createSharepointConnection);
router.route('/list').get(SharepointConnection.listSharepointConnections);

export default router;