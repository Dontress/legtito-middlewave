import type { Request, Response } from 'express';

import { validateGenerateTokenBody } from './validator';
import Token from '../../services/token';

const generate = (req: Request, res: Response) => {
    const { apiKey, privateKey } = validateGenerateTokenBody(req.body);

    console.log(req);

    const jwt = Token.createJwt(apiKey, privateKey);
    res.send(jwt);
};

export default {
    generate
};