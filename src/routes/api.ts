import express from 'express';

import 'express-async-errors';

import { testLegitoConnection } from '../middlewares/testLegitoConnection';
import { testSharepointConnection } from '../middlewares/testSharepointConnection';
import ConnectionRoute from './connectionRoute';
import PushApi from './pushApi';
import DocumentApi from './documentApi';

const router = express.Router();

router.route('/health').get((req, res) => res.send('Server is up!'));
router.route('/test-connections').get(testSharepointConnection, testLegitoConnection, (req, res) => res.send('All connections are UP!'));
router.route('/test-legito-connection').get(testLegitoConnection, (req, res) => res.send('Connection successful'));
router.route('/test-sharepoint-connection').get(testSharepointConnection, (req, res) => res.send('Connection successful'));


router.use('/connection', ConnectionRoute);
router.use('/push-api', PushApi);
router.use('/document', DocumentApi);

export default router;