import type { Request, Response } from 'express';

import { validateCreateConnectionBody } from './validator';
import Legito from '../../Services/legito';

const createPushApi = async (req: Request, res: Response) => {
    const { apiKey, privateKey, domain, connectionName, triggerEvent, siteDisplayName } = validateCreateConnectionBody(req.body);

    const response = await Legito.createPushApi(apiKey, privateKey, domain, connectionName, triggerEvent, siteDisplayName);

    if(response.status !== 200){
        res.status(response.status);
    }
    res.send(response.data);
};

export default {
    createPushApi
};