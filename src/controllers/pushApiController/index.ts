import type { Request, Response } from 'express';

import createHttpError from 'http-errors';

import { validateCreateConnectionBody } from './validator';
import Legito from '../../services/legito';

const createPushApi = async (req: Request, res: Response) => {
    const { apiKey, privateKey, domain, connectionName, triggerEvent, siteDisplayName } = validateCreateConnectionBody(req.body);

    let triggerEventArray: string[] = [];
    // parse the shit string to array
    try {
        triggerEventArray = triggerEvent.split(',');
    }catch (e) {
        throw createHttpError(400, 'Invalid format of triggerEvent. Should be "trigger1,trigger2,trigger3...');
    }

    const response = await Legito.createPushApi(apiKey, privateKey, domain, connectionName, triggerEventArray, siteDisplayName);

    res.send(response);
};

export default {
    createPushApi
};