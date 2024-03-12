import process from 'process';
import createHttpError from 'http-errors';
import axios from 'axios';

import Token from './token';

class Legito{
    public async createPushApi(apiKey: string, privateKey: string, domain: string, connectionName: string, triggerEvent: string[], siteDisplayName: string){
        const token = Token.createJwt(apiKey, privateKey);
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
                eventTypes: triggerEvent,
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
            return {
                data: response.data,
                status: response.status
            };
        }catch (err) {
            console.error('Error making POST /push-connection to Legito:', err);
            throw createHttpError(500, `Error creating push API in Legito application: ${err}`);
        }
    }
}

export default new Legito();