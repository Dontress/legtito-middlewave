import type { Request, Response } from 'express';

import BasicAuth from '../../services/basicAuth';
import Token from '../../services/token';
import Redirect from '../../services/redirect';

import { validateRedirectHeaders } from './validator';

const redirect = async (req: Request, res: Response) => {
    const { authorization, domain, targetendpoint, method } = validateRedirectHeaders(req.headers);

    const requestBody = req.body;
    
    const { apiKey, privateKey } = BasicAuth.decodeAuthorizationHeader(authorization);
    const jwtToken = Token.createJwt( apiKey, privateKey );

    const { status, data } = await Redirect.redirectRequest(domain, targetendpoint, method, jwtToken, requestBody);

    res.status(status);
    res.send(data);
};

export default {
    redirect
};