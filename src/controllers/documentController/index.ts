import type { Request, Response } from 'express';

import createHttpError from 'http-errors';

import { validateCatchDocumentBody } from './validator';
import Sharepoint from '../../services/sharepoint';

const catchDocument = async (req: Request, res: Response) => {
    const { eventType, files } = validateCatchDocumentBody(req.body);

    const apiKey = req.headers['apikey'];
    const privateKey = req.headers['privatekey'];
    const siteDisplayName = req.headers['sitedisplayname'];
    
    if( typeof(apiKey) !== 'string' || typeof(privateKey) !== 'string' || typeof(siteDisplayName) !== 'string'){
        throw createHttpError(400, 'apiKey, privateKey or siteDisplayName not found in request');
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const fileBase64 = files.generated[0].data;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const fileName = files.generated[0].fileName;

    const document = {
        fileName,
        eventType,
        fileBase64
    };

    await Sharepoint.uploadToSharepoint(document, privateKey, apiKey, siteDisplayName);
    res.send('Document uploaded');
};

export default {
    catchDocument
};