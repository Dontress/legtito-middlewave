import type { Request, Response } from 'express';
// import axios from 'axios';

const registerConnection = (req: Request, res: Response) => {
    const tenantId = req.headers['tenant_id'];
    const clientSecret = req.headers['client_secret'];
    const clientId = req.headers['client_id'];

    const body = {
        tenant_id: tenantId,
        client_secret: clientSecret,
        client_id: clientId
    };

    res.status(200);
    res.send(body);
};

export default {
    registerConnection
};
