import type { Request, Response } from 'express';

import BasicAuth from '../../services/basicAuth';
import Token from '../../services/token';
import Redirect from '../../services/redirect';

import { validateRedirectHeaders } from './validator';

const redirect = async (req: Request, res: Response) => {
    const { authorization, domain, targetendpoint, method } = validateRedirectHeaders(req.headers);

    const requestBody = req.body;
    const requestQuery = req.query;

    const { apiKey, privateKey } = BasicAuth.decodeAuthorizationHeader(authorization);
    const jwtToken = Token.createJwt(apiKey, privateKey);

    const {
        status,
        data
    } = await Redirect.redirectRequest(domain, targetendpoint, method, jwtToken, requestBody, requestQuery);

    console.log(req.headers);
    console.log(req.body);
    console.log(data);

    res.status(status);

    // if its POST request, some services don't expect response as array
    // so if its POST parse the [{ Object }] to { Object }
    if (method === 'POST' || targetendpoint.includes('document-version/data/') || targetendpoint.includes('document-version/download/') ) {
        const parsedData = Redirect.parseArrayPostResponseToObject(data);
        res.send(parsedData);
    } else {
        res.send(data);
    }

};

export default {
    redirect
};