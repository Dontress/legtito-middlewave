import type { Request, Response } from 'express';

import { validateCreateConnectionBody, validateDeleteConnectionBody } from './validator';
import Connection from '../../services/connection';

const createConnection = async (req: Request, res: Response) => {
    const { apiKey, privateKey, domain, tenantId, clientSecret, clientId } = validateCreateConnectionBody(req.body);
    console.log(req.headers);
    console.log(req.body);
    const reponse = await Connection.create(apiKey, privateKey, domain, tenantId, clientSecret, clientId);
    res.send(reponse);
};

const deleteConnection = async (req: Request, res: Response) => {
    const { apiKey } = validateDeleteConnectionBody(req.body);

    await Connection.delete(apiKey);
    res.send('Connection deleted successfully');
};

// TODO: dev function, remove later
const listConnections = async (req: Request, res: Response) => {
    const skip = req.query.skip ? +req.query.skip : 0;
    const take = req.query.take ? +req.query.take : 10;

    const list = await Connection.list(skip, take);
    res.send(list);
};
export default {
    createConnection,
    deleteConnection,
    listConnections
};