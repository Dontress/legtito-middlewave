import express from 'express';

import TokenController from '../controllers/tokenController';

const router = express.Router();

router.route('/').post(TokenController.generate);

export default router;