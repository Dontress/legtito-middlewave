import type { NextFunction, Request, Response } from 'express';

import axios from 'axios';

import createHttpError from 'http-errors';

import * as process from 'process';

import TokensController from '../tokensController';

import { validateCreateConnectionBody } from './validator';

const createPushApi = async (req: Request, res: Response, next: NextFunction) => {
    const { apiKey, privateKey, domain, connectionName, triggerEvent, siteDisplayName } = validateCreateConnectionBody(req.body);

    const token = TokensController.createJwt(apiKey, privateKey);
    const url = 'https://' + domain + '/api/v7/push-connection/';
    const targetUrl = 'https://' + process.env.DOMAIN + '/api/document';

    if (!process.env.DOMAIN){
        throw createHttpError(500, 'domain in .env is not set');
    }

    try {
        const response = await axios.post(url, {
            name: connectionName,
            url: targetUrl,
            enabled: true,
            headers: [
                {
                    name: 'apiKey',
                    value: apiKey
                },
                {
                    name: 'privateKey',
                    value: privateKey
                },
                {
                    name: 'siteDisplayName',
                    value: siteDisplayName
                }
            ],
            eventTypes: [
                triggerEvent
            ],
            templateSuiteAll: true,
            templateSuites: [],
            documentRecordTypeAll: true,
            documentRecordTypes: [],
            attachFilesUploaded: false,
            attachFilesGenerated: true,
            fileTypes: [
                'pdf'
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // If successful, call next() to continue to the next middleware
        res.status(200).send(response.data);
    } catch (err) {
        console.error('Error making POST /push-connection to Legito:', err);
        res.status(500).send('Failed to make POST /push-connection to Legito');
    }

};

export default {
    createPushApi
};