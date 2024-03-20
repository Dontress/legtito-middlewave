import express from 'express';

import 'express-async-errors';

import { testLegitoConnection } from '../middlewares/testLegitoConnection';
import { testSharepointConnection } from '../middlewares/testSharepointConnection';
import ConnectionRoute from './connectionRoute';
import PushApi from './pushApiRoute';
import DocumentApi from './documentRoute';
import SharepointApi from './sharepointRoute';
import RedirectRoute from './RedirectRoute';

const router = express.Router();

router.route('/health').get((req, res) => res.send('Server is up!'));
router.route('/sharepoint/test-connections').get(testSharepointConnection, testLegitoConnection, (req, res) => res.send('All connections are UP!'));
router.route('/sharepoint/test-legito-connection').get(testLegitoConnection, (req, res) => res.send('Connection successful'));
router.route('/sharepoint/test-sharepoint-connection').get(testSharepointConnection, (req, res) => res.send('Connection successful'));

router.use('/sharepoint/connection', ConnectionRoute);
router.use('/sharepoint/push-api', PushApi);
router.use('/sharepoint/document', DocumentApi);
router.use('/sharepoint/sharepoint', SharepointApi);

// auth redirect endpoints
router.use('/redirect', RedirectRoute);

router.route('/dynamic-fields').get((req, res) => {
    const dynamicFieldsStructure = {
        'properties': {
        'type': 'array',
        'label': 'Properties',
        'required': false,
        'children': {
            'type': 'object',
            'properties': [
                {
                    'name': 'systemName',
                    'type': 'text',
                    'label': 'System Name',
                    'required': true
                },
                {
                    'name': 'value',
                    'type': 'text',
                    'label': 'Value',
                    'required': true
                }
            ]
        }
    }
};

res.json(dynamicFieldsStructure);
})
;
export default router;