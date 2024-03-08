import type { Request, Response } from 'express';

import axios from 'axios';

import { validateCatchDocumentBody } from './validator';
import TokensController from '../tokensController';

const catchDocument = async (req: Request, res: Response) => {
    const { eventType, files } = validateCatchDocumentBody(req.body);

    const apiKey = req.headers['apikey'];
    const privateKey = req.headers['privatekey'];
    const siteDisplayName = req.headers['sitedisplayname'];

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
    await uploadToSharepoint(document, privateKey, apiKey, siteDisplayName);

    res.status(200);
    res.send('Document uploaded');
};

async function uploadToSharepoint(document: {
    fileName: string;
    eventType: string;
    fileBase64: string;
}, privateKey: string, apiKey: string, siteDisplayName: string) {

    // get keys via apiKey and privateKey or in addition connections setting
    const connection = await TokensController.getConnectionCredentials(apiKey, privateKey);

    // make POST call to create sharepoint token
    const token = await TokensController.requestSharepointToken(connection);

    // make POST call to sharepoint to upload document
    const uploadResponse = await uploadDocument(document, token, siteDisplayName);
    console.log(uploadResponse);
}


async function uploadDocument(document: { fileName: string; eventType: string; fileBase64: string }, token: string, siteDisplayName: string) {
    const sites = await getSiteId(token);
    const siteId = sites[siteDisplayName];

    const documentLibraryId = await getDocumentLibraryId(token, siteId);

    const endpoint = 'https://graph.microsoft.com/v1.0/sites/' + siteId + '/drives/' + documentLibraryId + '/root:/' + document.fileName + ':/content';

    console.log('Endpoint where to put document: ' + endpoint);

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
        return response.data;
    } catch (error) {
        // Handle error
        console.error('Error uploading file', error);
        throw error;
    }

}

async function getDocumentLibraryId(token: string, siteId: string){
    const endpoint = 'https://graph.microsoft.com/v1.0/sites/ '+ siteId + '/drives';

    try {
        const headers = {
            Authorization: 'Bearer ' + token,
        };

        // this should be post
        const response = await axios.get(endpoint, { headers });

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

interface Site {
    displayName: string;
    id: string;
}

function isSite(object: any): object is Site {
    return 'displayName' in object && 'id' in object;
}

async function getSiteId(token: string){
    const endpoint = 'https://graph.microsoft.com/v1.0/sites';
    try{

        const headers = {
            Authorization: 'Bearer ' + token,
        };

        const response = await axios.get(endpoint, { headers });
        const sites = response.data.value;

        const siteDictionary: { [displayName: string]: string } = {};
        sites.forEach((site: unknown) => {
            if (isSite(site)) {
                siteDictionary[site.displayName] = site.id;
            }
        });

        const transformedDictionary: { [key: string]: string } = {};
        for (const [key, value] of Object.entries(siteDictionary)) {
            const idSegments = value.split(',');
            if (idSegments.length > 1) {
                transformedDictionary[key] = idSegments[1]; // get the second segment
            }
        }

        return transformedDictionary;
    } catch (error) {
        // Handle error
        console.error('Error getting sharepoint sites', error);
        throw error;
    }
}

export default {
    catchDocument
};