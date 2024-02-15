import type { Request, Response } from 'express';
import createHttpError from 'http-errors';

import { AppDataSource } from '../../data-source';
import { LegitoConnection } from '../../entities/legitoConnection';
import { validateCreateLegitoConnectionBody } from './validator';

const registerLegitoConnection = async (req: Request, res: Response) => {
    const { apiKey, privateKey, domain } = validateCreateLegitoConnectionBody(req.body);

    // Create a query runner to control the transactions, it allows to cancel the transaction if we need to
    const queryRunner = AppDataSource.createQueryRunner();

    // Connect the query runner to the database and start the transaction
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const legitoConnRepo = queryRunner.manager.getRepository(LegitoConnection);
        const connectionExists = await legitoConnRepo.exist({
            where: { apiKey }
        });
        if (connectionExists) {
            throw createHttpError(409, 'Legito connection already exists');
        }

        const newLegitoConnection = new LegitoConnection();
        newLegitoConnection.domain = domain;
        newLegitoConnection.apiKey = apiKey;
        newLegitoConnection.setSecret(privateKey);
        await queryRunner.manager.save(newLegitoConnection);

        // No exceptions occured, so we commit the transaction
        await queryRunner.commitTransaction();

        res.send(newLegitoConnection.id);
    } catch (err) {
        // As an exception occured, cancel the transaction
        await queryRunner.rollbackTransaction();
        throw err;
    } finally {
        // We need to release the query runner to not keep a useless connection to the database
        await queryRunner.release();
    }
};

const listLegitoConnections = async (req: Request, res: Response) => {
    
};

export default {
    registerLegitoConnection,
    listLegitoConnections
};
