import type { Request, Response, NextFunction } from 'express';

import createHttpError from 'http-errors';

import { LegitoConnection } from '../entities/legitoConnection';
import { AppDataSource } from '../data-source';

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.body['apiKey'];
    const privateKey = req.body['privateKey'];

    const queryRunner = AppDataSource.createQueryRunner();

    try {
        const legitoConnectionRepo = queryRunner.manager.getRepository(LegitoConnection);
        const legitoConnection = await legitoConnectionRepo.findOne(
            {
                where: { apiKey }
            }
        );

        if (!legitoConnection) {
            throw createHttpError(403, 'Invalid credentials');
        }

        if (legitoConnection.verifySecret(privateKey)) {
            next();
        } else {
            throw createHttpError(403, 'Invalid credentials');
        }

    } catch (err) {
        console.error('Error making GET request to Legito:', err);
        res.status(403).send('Invalid credentials');
    }

};

export default {
    auth
};