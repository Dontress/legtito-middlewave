import type {  Request, Response } from 'express';

import createHttpError from 'http-errors';
import bcrypt from 'bcryptjs';

import { validateCatchDocumentBody } from './validator';
import { LegitoConnection } from '../../entities/legitoConnection';
import { AppDataSource } from '../../data-source';

const catchDocument = async (req: Request, res: Response) => {
    const { eventType, files } = validateCatchDocumentBody(req.body);

    const apiKey = req.headers['apikey'];
    const privateKey = req.headers['privatekey'];

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const fileBase64 = files.generated[0].data;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const fileName = files.generated[0].fileName;

    const document = {
        fileName,
        eventType,
        fileBase64
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    await uploadToSharepoint(document, privateKey, apiKey);

    res.status(200);
    res.send('Document uploaded');
};

async function uploadToSharepoint(document: { fileName: string; eventType: string; fileBase64: string }, privateKey: string, apiKey: string) {
    // get keys via apiKey and privateKey or in addition connections setting
    const connection = await getConnectionCredentials(apiKey, privateKey);

    // make POST call to create sharepoint token
    const token = await requestSharepointToken(connection);

    // make POST call to sharepoint to upload document
    console.log(token);

}

async function getConnectionCredentials(apiKey: string, privateKey: string): Promise<LegitoConnection | undefined> {
    const queryRunner = AppDataSource.createQueryRunner();

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
    }
    else{
        console.log('findConnection - credentials not found');
        throw createHttpError(403, "Credentials not found");
    }
}

async function requestSharepointToken(connection: LegitoConnection | undefined): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const sharepointConnection = connection.sharepointConnection;
    const tokenEndpoint = 'https://login.microsoftonline.com/' + sharepointConnection.tenantId + '/oauth2/token';
    const resource = 'https://graph.microsoft.com/'; // This scope is for Microsoft Graph; adjust if you're accessing SharePoint directly

    const params = new URLSearchParams();
    params.append('client_id', sharepointConnection.clientId);
    params.append('resource', resource);
    params.append('client_secret', sharepointConnection.clientSecret);
    params.append('grant_type', 'client_credentials'); // Using the client credentials flow

    const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
    });



    if (!response.ok){
        console.log(response);
        console.log('getSharepointToken - Cannot create sharepoint token with given credentials');
        throw createHttpError(403, "Cannot create sharepoint token with given credentials");
    }

    const data = await response.json();

    /**
     * eslint-disable-next-line @typescript-eslint/ban-ts-comment
     * @ts-expect-error
     */
    if (!data.access_token){
        console.log(data);
        console.log('getSharepointToken - Token not found in successful request');
        throw createHttpError(500, "Token not found in successful request");
    }

    /**
     * eslint-disable-next-line @typescript-eslint/ban-ts-comment
     * @ts-expect-error
     */
    return data.access_token;
}

export default {
    catchDocument
};