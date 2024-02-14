import express from 'express';

import 'express-async-errors';

import TestLegitoConnection from '../middlewares/testLegitoConnection';
import RegisterConnection from '../controllers/registerConnection';

const router = express.Router();

router.route('/test-connection').get((req, res) => res.send('Server is up!'));

router.route('/test-connection').get(TestLegitoConnection.testLegitoConnection, (req, res) => res.send('Connection is up!'));

router.route('/register-connection').post(TestLegitoConnection.testLegitoConnection, RegisterConnection.registerConnection);

export default router;