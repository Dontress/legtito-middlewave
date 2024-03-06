import type { NextFunction, Request, Response } from 'express';

import crypto from 'crypto';
import axios from 'axios';

import createHttpError from 'http-errors';

import * as process from 'process';

import { validateCreateConnectionBody } from './validator';

const createPushApi = async (req: Request, res: Response, next: NextFunction) => {
    const { apiKey, privateKey, domain, connectionName, triggerEvent } = validateCreateConnectionBody(req.body);

    const token = createJwt(apiKey, privateKey);
    const url = 'https://' + domain + '/api/v7/push-connection/';

    if (!process.env.DOMAIN){
        throw createHttpError(500, 'domain in .env is not set');
    }

    try {
        const response = await axios.post(url, {
            name: connectionName,
            url: 'https://' + process.env.DOMAIN + '/api/document',
            enabled: true,
            headers: [
                {
                    name: 'apiKey',
                    value: apiKey
                },
                {
                    name: 'privateKey',
                    value: privateKey
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

function createJwt(apiKey: string, privateKey: string) {
    const header = {
        typ: 'JWT',
        alg: 'HS256'
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify({
        iss: apiKey,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600  // JWT valid for 1 hour
    }));

    const toSign = `${encodedHeader}.${encodedPayload}`;

    const rawSignature = crypto.createHmac('sha256', privateKey.toString()).update(toSign).digest();
    const encodedSignature = base64UrlEncode(rawSignature);

    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
function base64UrlEncode(str) {
    return Buffer.from(str).toString('base64')
        .replace('+', '-')
        .replace('/', '_')
        .replace(/=+$/, '');
}

export default {
    createPushApi
};