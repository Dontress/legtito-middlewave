import express from 'express';

import 'express-async-errors';

// import TestLegitoConnection from '../middlewares/testLegitoConnection';
import { testLegitoConnection } from '../middlewares/testLegitoConnection';
import { testSharepointConnection } from '../middlewares/testSharepointConnection';
import connections from './connections';

const router = express.Router();

router.route('/health').get((req, res) => res.send('Server is up!'));
router.route('/test-legito-connection').get(testLegitoConnection, (req, res) => res.send('Legito connection is working!'));
router.route('/test-sharepoint-connection').get(testSharepointConnection, (req, res) => res.send('SharePoint token successful'));

router.use('/connections', connections);

export default router;