import express from 'express';

// import { auth } from '../middlewares/auth';
import pushApiController from '../controllers/pushApiController';

const router = express.Router();

router.route('/').post(pushApiController.createPushApi);

export default router;