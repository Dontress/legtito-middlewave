import type { Request, Response } from 'express';

import createHttpError from 'http-errors';

import BasicAuth from '../../services/basicAuth';
import Token from '../../services/token';
import Redirect from '../../services/redirect';

const redirect = async (req: Request, res: Response) => {
    const basicAuthHeader: string | undefined = req.headers['authorization'];
    const domain = req.headers['domain'];
    const targetEndpoint = req.headers['targetendpoint'];
    const method = req.headers['method'];
    const requestBody = req.body;

    if (!basicAuthHeader || !domain || !targetEndpoint || !method ){
        throw createHttpError(401, 'Invalid auth');
    }

    if (typeof(domain) !== 'string'){
        throw createHttpError(401, 'Invalid domain for Legito auth');
    }

    if (typeof(targetEndpoint) !== 'string'){
        throw createHttpError(400, 'Legito API Endpoint not found');
    }

    if (typeof(method) !== 'string'){
        throw createHttpError(400, 'Legito API Endpoint not found');
    }
    
    const { apiKey, privateKey } = BasicAuth.decodeAuthorizationHeader(basicAuthHeader);
    const jwtToken = Token.createJwt( apiKey, privateKey );

    const { status, data } = await Redirect.redirectRequest(domain, targetEndpoint, method, jwtToken, requestBody);
    res.status(status);
    res.send(data);
};

export default {
    redirect
};