import bcrypt from 'bcryptjs';
import crypto from 'crypto';

import createHttpError from 'http-errors';

import { LegitoConnection } from '../../entities/legitoConnection';

import { AppDataSource } from '../../data-source';

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

function createJwt(apiKey: string, privateKey: string) {
    const header = {
        typ: 'JWT',
        alg: 'HS256'
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify({
        iss: apiKey,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600  // JWT valid for 1 hour
    }));

    const toSign = `${encodedHeader}.${encodedPayload}`;

    const rawSignature = crypto.createHmac('sha256', privateKey.toString()).update(toSign).digest();
    const encodedSignature = base64UrlEncode(rawSignature);

    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
function base64UrlEncode(str) {
    return Buffer.from(str).toString('base64')
        .replace('+', '-')
        .replace('/', '_')
        .replace(/=+$/, '');
}

export default {
    getConnectionCredentials,
    requestSharepointToken,
    createJwt
};