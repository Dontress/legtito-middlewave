import type { NextFunction, Request, Response } from 'express';

import axios from 'axios';

import createHttpError from 'http-errors';

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

export const checkAdmin = (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['apikey'];
    const privateKey = req.headers['privatekey'];

    const adminPrivateKey = process.env.ADMIN_PRIVATEKEY;
    const adminApiKey = process.env.ADMIN_APIKEY;

    if( apiKey === adminApiKey || privateKey === adminPrivateKey ){
        next();
    }else{
        throw createHttpError(401, 'Invalid access');
    }
};

export default {
    basicAuth
};