import express from 'express';

import DocumentApiController from '../controllers/documentController';

const router = express.Router();

router.route('/').post(DocumentApiController.catchDocument, (req, res) => res.send('Document uploaded'));

export default router;