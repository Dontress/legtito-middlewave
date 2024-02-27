import express from 'express';

import 'express-async-errors';

// import TestLegitoConnection from '../middlewares/testLegitoConnection';
import { testLegitoConnection } from '../middlewares/testLegitoConnection';
import { testSharepointConnection } from '../middlewares/testSharepointConnection';
import LegitoConnection from './legitoConnection';
import SharepointConnection from './sharepointConnection';

const router = express.Router();

router.route('/health').get((req, res) => res.send('Server is up!'));
router.route('/test-legito-connection').get(testLegitoConnection, (req, res) => res.send('Legito connection is working!'));
router.route('/test-sharepoint-connection').get(testSharepointConnection, (req, res) => res.send('SharePoint token successful'));
router.route('/test-connections').get(testSharepointConnection, testLegitoConnection, (req, res) => res.send('All connections are UP!'));

router.use('/legito-connection', LegitoConnection);
router.use('/sharepoint-connection', SharepointConnection);

export default router;