import type { Request, Response } from 'express';

import createHttpError from 'http-errors';
import bcrypt from 'bcryptjs';

import axios from 'axios';

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

async function uploadToSharepoint(document: {
    fileName: string;
    eventType: string;
    fileBase64: string;
}, privateKey: string, apiKey: string) {

    // get keys via apiKey and privateKey or in addition connections setting
    const connection = await getConnectionCredentials(apiKey, privateKey);

    // make POST call to create sharepoint token
    const token = await requestSharepointToken(connection);

    // make POST call to sharepoint to upload document
    const uploadResponse = await uploadDocument(document, token);
    console.log(uploadResponse);
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
    } else {
        console.log('findConnection - credentials not found');
        throw createHttpError(403, 'Credentials not found');
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

    if (!response.ok) {
        console.log(response);
        console.log('getSharepointToken - Cannot create sharepoint token with given credentials');
        throw createHttpError(403, 'Cannot create sharepoint token with given credentials');
    }

    const data = await response.json();

    /**
     * eslint-disable-next-line @typescript-eslint/ban-ts-comment
     * @ts-expect-error
     */
    if (!data.access_token) {
        console.log(data);
        console.log('getSharepointToken - Token not found in successful request');
        throw createHttpError(500, 'Token not found in successful request');
    }

    /**
     * eslint-disable-next-line @typescript-eslint/ban-ts-comment
     * @ts-expect-error
     */
    return data.access_token;
}

async function uploadDocument(document: { fileName: string; eventType: string; fileBase64: string }, token: string) {
    const documentLibraryId = await getDocumentLibraryId(token);
    const endpoint = 'https://graph.microsoft.com/v1.0/drives/' + documentLibraryId + '/root:/' + document.fileName + ':/content';

    try {
        // Convert base64 string to binary data
        const fileData = Buffer.from(document.fileBase64, 'base64');

        // Set up headers
        const headers = {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/octet-stream', // Adjust if necessary
        };

        // Make the PUT request
        const response = await axios.put(endpoint, fileData, { headers });

        // Handle response
        console.log(response.data);
        return response.data;
    } catch (error) {
        // Handle error
        console.error('Error uploading file', error);
        throw error;
    }

}

async function getDocumentLibraryId(token: string){
    const endpoint = 'https://graph.microsoft.com/v1.0/drives';

    try {
        const headers = {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/octet-stream', // Adjust if necessary
        };

        const response = await axios.post(endpoint,  { headers });

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const documentLibraries = response.data.value.filter(d => d.driveType === 'documentLibrary');

        if (documentLibraries.length > 0) {
            return documentLibraries[0].id;
        }
    } catch (error) {
        // Handle error
        console.error('Error getting Sharepoint document library', error);
        throw error;
    }
}

export default {
    catchDocument
};