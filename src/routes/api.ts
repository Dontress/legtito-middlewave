import express from 'express';
import 'express-async-errors';

const router = express.Router();

router.route('/health').get((req, res) => res.send('Server is up!'));

export default router;