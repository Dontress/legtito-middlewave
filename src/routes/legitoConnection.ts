import express from 'express';

import LegitoConnection from '../controllers/legitoConnection';

const router = express.Router();

router.route('/create').post(LegitoConnection.createLegitoConnection);
router.route('/list').get(LegitoConnection.listLegitoConnections);

export default router;