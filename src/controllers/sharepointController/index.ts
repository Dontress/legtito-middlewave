import type { Request, Response } from 'express';

import createHttpError from 'http-errors';

import Sharepoint from '../../Services/sharepoint';

const getSites = async (req: Request, res: Response) => {
    const apiKey = req.headers['apikey'];
    const privateKey = req.headers['privatekey'];

    if (typeof (apiKey) !== 'string' || typeof (privateKey) !== 'string'){
        throw createHttpError('400', 'Api key or private key not found in headers');
    }

    const list = await Sharepoint.getSites(apiKey, privateKey);
    res.send(list);
};

export default {
    getSites
};