import type { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import qs from 'qs';

export const testSharepointConnection = async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.body['tenantId'];
    const clientId = req.body['clientId'];
    const clientSecret = req.body['clientSecret'];

    const postData = qs.stringify({
        // eslint-disable-next-line camelcase
        grant_type: 'client_credentials',
        // eslint-disable-next-line camelcase
        client_id: clientId,
        // eslint-disable-next-line camelcase
        client_secret: clientSecret,
        resource: 'https://graph.microsoft.com/'
    });

    try {
        await axios.post(`https://login.microsoftonline.com/${tenantId}/oauth2/token`, postData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        });

        next();
    } catch (err) {
        console.error('Error obtaining token from Microsoft:', err);
        res.status(403).send('Failed to authenticate with Sharepoint MS Entra credentials');
    }
};

export default {
    testSharepointConnection
};