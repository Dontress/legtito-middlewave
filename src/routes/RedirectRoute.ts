import express from 'express';

import RedirectController from '../controllers/RedirectController';

const router = express.Router();

router.route('/').post(RedirectController.redirect);
export default router;