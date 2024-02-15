import type { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import qs from 'qs';

export const testSharepointConnection = async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.headers['tenant_id'];
    const clientId = req.headers['client_id'];
    const clientSecret = req.headers['client_secret'];

    const postData = qs.stringify({
        grant_type: 'client_credentials',
        client_id: clientId,
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
        res.status(500).send('Failed to obtain token from Microsoft');
    }
};

export default {
    testSharepointConnection
};