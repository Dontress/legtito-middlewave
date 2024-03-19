import type { NextFunction, Request, Response } from 'express';

import axios from 'axios';

import Token from '../services/token';
import BasicAuth from '../services/basicAuth';

export const basicAuth = async (req: Request, res: Response, next: NextFunction) => {
    const basicAuthHeader: string | undefined = req.headers['authorization'];
    const domain = req.headers['domain'];

    // decode basic auth string
    const { apiKey, privateKey } = BasicAuth.decodeAuthorizationHeader(basicAuthHeader);

    // generate token from it
    const jwtToken = Token.createJwt(apiKey, privateKey);

    try {
        await axios.get(domain + '/api/v7/info', {
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            },
        });
       
        next();
    } catch (err) {
        console.error('Error authentication with Legito:', err);
        res.status(403).send('Failed to authenticate with Legito');
    }

};

// Base64Url encode function
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
function base64UrlEncode(str) {
    return Buffer.from(str).toString('base64')
        .replace('+', '-')
        .replace('/', '_')
        .replace(/=+$/, '');
}

export default {
    basicAuth
};