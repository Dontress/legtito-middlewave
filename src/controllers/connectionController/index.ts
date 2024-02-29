import type { Request, Response } from 'express';
import createHttpError from 'http-errors';

import { AppDataSource } from '../../data-source';
import { LegitoConnection } from '../../entities/legitoConnection';
import { validateCreateConnectionBody, validateDeleteConnectionBody } from './validator';
import { SharepointConnection } from '../../entities/sharepointConnection';

const createConnection = async (req: Request, res: Response) => {
    const { apiKey, privateKey, domain, tenantId, clientSecret, clientId } = validateCreateConnectionBody(req.body);

    // Create a query runner to control the transactions, it allows to cancel the transaction if we need to
    const queryRunner = AppDataSource.createQueryRunner();

    // Connect the query runner to the database and start the transaction
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const legitoConnRepo = queryRunner.manager.getRepository(LegitoConnection);
        const sharepointConnRepo = queryRunner.manager.getRepository(SharepointConnection);

        const legitoConnectionExists = await legitoConnRepo.exist({
            where: { apiKey }
        });
        if (legitoConnectionExists) {
            throw createHttpError(409, 'Connection already exists (apiKey)');
        }

        const sharepointConnectionExists = await sharepointConnRepo.exist({
            where: { tenantId }
        });
        if (sharepointConnectionExists){
            throw createHttpError(409, 'Connection already exists (tenantId)');
        }

        const newLegitoConnection = new LegitoConnection();
        newLegitoConnection.domain = domain;
        newLegitoConnection.apiKey = apiKey;
        newLegitoConnection.setSecret(privateKey);
        await queryRunner.manager.save(newLegitoConnection);

        const newSharepointConnection = new SharepointConnection();
        newSharepointConnection.clientId = clientId;
        newSharepointConnection.tenantId = tenantId;
        newSharepointConnection.clientSecret = clientSecret;
        await queryRunner.manager.save(newSharepointConnection);

        newLegitoConnection.sharepointConnection = newSharepointConnection;

        await queryRunner.manager.save(newLegitoConnection);

        // No exceptions occured, so we commit the transaction
        await queryRunner.commitTransaction();

        res.send(newLegitoConnection);
    } catch (err) {
        // As an exception occured, cancel the transaction
        await queryRunner.rollbackTransaction();
        throw err;
    } finally {
        // We need to release the query runner to not keep a useless connection to the database
        await queryRunner.release();
    }
};

const deleteConnection = async (req: Request, res: Response) => {
    const { apiKey } = validateDeleteConnectionBody(req.body);

    const queryRunner = AppDataSource.createQueryRunner();

    // Connect the query runner to the database and start the transaction
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const legitoConnectionRepo = queryRunner.manager.getRepository(LegitoConnection);
        const sharepointConnectionRepo = queryRunner.manager.getRepository(SharepointConnection);

        const connection = await legitoConnectionRepo.findOne({
            where: { apiKey },
            relations: { sharepointConnection: true }
        });
        if(!connection){
            throw createHttpError(404, 'Connection not found');
        }

        const sharepointConnection = connection.sharepointConnection!;

        await legitoConnectionRepo.remove(connection);
        await sharepointConnectionRepo.remove(sharepointConnection);

        await queryRunner.commitTransaction();

        res.status(200);
        res.send('Connection deleted successfully');
    } catch (err) {
        // As an exception occured, cancel the transaction
        await queryRunner.rollbackTransaction();
        throw err;
    } finally {
        // We need to release the query runner to not keep a useless connection to the database
        await queryRunner.release();
    }

};

// TODO: dev function, remove later
const listConnections = async (req: Request, res: Response) => {

    const skip = req.query.skip ? +req.query.skip : 0;
    const take = req.query.take ? +req.query.take : 10;

    const queryRunner = AppDataSource.createQueryRunner();

    // Connect the query runner to the database and start the transaction
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const legitoConnectionRepo = queryRunner.manager.getRepository(LegitoConnection);
        const list = await legitoConnectionRepo.find(
            {
                skip,
                take,
                withDeleted: true,
                relations: { sharepointConnection: true }
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
    createConnection,
    deleteConnection,
    listConnections
};