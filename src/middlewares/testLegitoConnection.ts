import type { Request, Response, NextFunction } from 'express';
import axios from 'axios';

import crypto from 'crypto';

export const testLegitoConnection = async (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.body['apiKey'];
    const privateKey = req.body['privateKey'];

    const header = {
        typ: "JWT",
        alg: "HS256"
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

    const jwtToken = `${encodedHeader}.${encodedPayload}.${encodedSignature}`;

    try {
        await axios.get('https://emea.legito.com/api/v7/info', {
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            },
        });

        // If successful, call next() to continue to the next middleware
        next();
    } catch (err) {
        console.error('Error making GET request to Legito:', err);
        res.status(500).send('Failed authenticate with Legito credentials');
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
    testLegitoConnection
};