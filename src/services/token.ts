
import crypto from 'crypto';

import createHttpError from 'http-errors';

import type { LegitoConnection } from '../entities/legitoConnection';

class Token {

    public async requestSharepointToken(connection: LegitoConnection | undefined): Promise<string> {
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

    public createJwt(apiKey: string, privateKey: string) {
        const header = {
            typ: 'JWT',
            alg: 'HS256'
        };

        const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
        const encodedPayload = this.base64UrlEncode(JSON.stringify({
            iss: apiKey,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600  // JWT valid for 1 hour
        }));

        const toSign = `${encodedHeader}.${encodedPayload}`;

        const rawSignature = crypto.createHmac('sha256', privateKey.toString()).update(toSign).digest();
        const encodedSignature = this.base64UrlEncode(rawSignature);

        return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
    }

    public base64UrlEncode(str: Buffer | string) {
        return Buffer.from(str).toString('base64')
            .replace('+', '-')
            .replace('/', '_')
            .replace(/=+$/, '');
    }

}

export default new Token();