import type { Request, Response } from 'express';
import createHttpError from 'http-errors';

import { AppDataSource } from '../../data-source';
import { validateCreateSharepointConnectionBody } from './validator';
import { SharepointConnection } from '../../entities/sharepointConnection';
import { LegitoConnection } from '../../entities/legitoConnection';

const createSharepointConnection = async (req: Request, res: Response) => {
    const { clientId, clientSecret, tenantId, apiKey } = validateCreateSharepointConnectionBody(req.body);

    // Create a query runner to control the transactions, it allows to cancel the transaction if we need to
    const queryRunner = AppDataSource.createQueryRunner();

    // Connect the query runner to the database and start the transaction
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const legitoConnRepo = queryRunner.manager.getRepository(LegitoConnection);
        const legitoConnectionExists = await legitoConnRepo.exist({
            where: { apiKey }
        });

        if (!legitoConnectionExists){
            throw createHttpError(403, 'Legito connection doesnt exists');
        }

        const sharepointConnRepo = queryRunner.manager.getRepository(SharepointConnection);
        const connectionExists = await sharepointConnRepo.exist({
            where: { clientId: clientId }
        });
        if (connectionExists) {
            throw createHttpError(409, 'Sharepoint connection already exists');
        }

        const legitoConnection = await legitoConnRepo.findOne({ where: { apiKey } });

        const newSharepointConnection = new SharepointConnection();
        newSharepointConnection.clientId = clientId;
        newSharepointConnection.tenantId = tenantId;
        newSharepointConnection.setPassword(clientSecret);
        await queryRunner.manager.save(newSharepointConnection);

        legitoConnection!.sharepointConnection = newSharepointConnection;
        await queryRunner.manager.update(
            LegitoConnection,
            { id: legitoConnection!.id }, // criteria to match the record in the database
            { sharepointConnection: newSharepointConnection } // the update you want to perform
        );

        // No exceptions occured, so we commit the transaction
        await queryRunner.commitTransaction();

        res.send(newSharepointConnection);
    } catch (err) {
        // As an exception occured, cancel the transaction
        await queryRunner.rollbackTransaction();
        throw err;
    } finally {
        // We need to release the query runner to not keep a useless connection to the database
        await queryRunner.release();
    }
};

const listSharepointConnections = async (req: Request, res: Response) => {
    const queryRunner = AppDataSource.createQueryRunner();

    // Connect the query runner to the database and start the transaction
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const sharepointConnectionRepo = queryRunner.manager.getRepository(SharepointConnection);
        const list = await sharepointConnectionRepo.find(
            {
            }
        );
        res.send(list);
    } catch (err) {
        // As an exception occured, cancel the transaction
        await queryRunner.rollbackTransaction();
        throw err;
    } finally {
        // We need to release the query runner to not keep a useless connection to the database
        await queryRunner.release();
    }

};

export default {
    createSharepointConnection,
    listSharepointConnections
};
