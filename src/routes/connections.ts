import express from 'express';

import RegisterLegitoConnection from '../controllers/registerLegitoConnection';

const router = express.Router();

router.route('/create-legito-connection').post(RegisterLegitoConnection.registerLegitoConnection);

export default router;