import createHttpError from 'http-errors';

import bcrypt from 'bcryptjs';

import { AppDataSource } from '../data-source';
import { LegitoConnection } from '../entities/legitoConnection';
import { SharepointConnection } from '../entities/sharepointConnection';

class Connection {

    public async create(apiKey: string, privateKey: string, domain: string, tenantId: string, clientSecret: string, clientId: string) {
        const queryRunner = await Connection.startTransaction();

        try {
            const legitoConnRepo = queryRunner.manager.getRepository(LegitoConnection);
            const sharepointConnRepo = queryRunner.manager.getRepository(SharepointConnection);

            const legitoConnectionExists = await legitoConnRepo.exist({
                where: { apiKey }
            });
            if (legitoConnectionExists) {
                throw createHttpError(409, 'Connection already exists');
            }

            const sharepointConnectionExists = await sharepointConnRepo.exist({
                where: { tenantId }
            });
            if (sharepointConnectionExists) {
                throw createHttpError(409, 'Connection already exists');
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

            return newLegitoConnection;
        } catch (err) {
            // As an exception occured, cancel the transaction
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            // We need to release the query runner to not keep a useless connection to the database
            await queryRunner.release();
        }
    }

    public async delete(apiKey: string) {
        const queryRunner = await Connection.startTransaction();

        try {
            const legitoConnectionRepo = queryRunner.manager.getRepository(LegitoConnection);
            const sharepointConnectionRepo = queryRunner.manager.getRepository(SharepointConnection);

            const connection = await legitoConnectionRepo.findOne({
                where: { apiKey },
                relations: { sharepointConnection: true }
            });
            if (!connection) {
                throw createHttpError(404, 'Connection not found');
            }

            const sharepointConnection = connection.sharepointConnection!;

            await legitoConnectionRepo.remove(connection);
            await sharepointConnectionRepo.remove(sharepointConnection);

            await queryRunner.commitTransaction();

            return;
        } catch (err) {
            // As an exception occured, cancel the transaction
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            // We need to release the query runner to not keep a useless connection to the database
            await queryRunner.release();
        }

    }

    public async list(skip: number, take: number) {

        const queryRunner = await Connection.startTransaction();

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
            return list;
        } catch (err) {
            // As an exception occured, cancel the transaction
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            // We need to release the query runner to not keep a useless connection to the database
            await queryRunner.release();
        }
    }

    private static async getQueryRunner() {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();

        return queryRunner;
    }

    public static async startTransaction() {
        const queryRunner = await Connection.getQueryRunner();
        await queryRunner.startTransaction();

        return queryRunner;
    }

    public async getConnectionCredentials(apiKey: string, privateKey: string): Promise<LegitoConnection | undefined> {
        const queryRunner = await Connection.getQueryRunner();

        // Connect the query runner to the database and start the transaction
        await queryRunner.connect();
        await queryRunner.startTransaction();

        const legitoConnectionRepository = queryRunner.manager.getRepository(LegitoConnection);

        const connection = await legitoConnectionRepository.findOne({
            where: { apiKey },
            relations: ['sharepointConnection'],
        });

        if (connection && bcrypt.compareSync(privateKey, connection.hashSecret)) {
            return connection; // This includes the linked SharepointConnection
        } else {
            console.log('findConnection - credentials not found');
            throw createHttpError(403, 'Credentials not found');
        }
    }
}

export default new Connection();