import express from 'express';

// import { auth } from '../middlewares/auth';
import SharepointController from '../controllers/sharepointController';

const router = express.Router();

router.route('/sites').get(SharepointController.getSites);

export default router;