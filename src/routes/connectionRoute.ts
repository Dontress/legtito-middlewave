import express from 'express';

import { testLegitoConnection } from '../middlewares/testLegitoConnection';
import { testSharepointConnection } from '../middlewares/testSharepointConnection';
import ConnectionController from '../controllers/connectionController';
import { auth } from '../middlewares/auth';
import { checkAdmin } from '../middlewares/basicAuth';

const router = express.Router();

router.route('/').post(testLegitoConnection, testSharepointConnection, ConnectionController.createConnection);
router.route('/').delete(auth, ConnectionController.deleteConnection);

router.route('/list').get(checkAdmin, ConnectionController.listConnections);

export default router;