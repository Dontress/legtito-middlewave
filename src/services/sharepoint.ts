import axios from 'axios';

import Token from './token';
import Connection from './connection';

interface Site {
    displayName: string;
    id: string;
}

class Sharepoint {
    public async uploadToSharepoint(
        document: {
            fileName: string;
            eventType: string;
            fileBase64: string;
        },
        privateKey: string, apiKey: string, siteDisplayName: string) {

        // get keys via apiKey and privateKey or in addition connections setting
        const connection = await Connection.getConnectionCredentials(apiKey, privateKey);

        // make POST call to create sharepoint token
        const token = await Token.requestSharepointToken(connection);

        // make POST call to sharepoint to upload document
        const uploadResponse = await this.uploadDocument(document, token, siteDisplayName);
        console.log(uploadResponse);
    }

    private async uploadDocument(document: {
        fileName: string;
        eventType: string;
        fileBase64: string;
    }, token: string, siteDisplayName: string) {
        const sites = await this.getSiteId(token);
        const siteId = sites[siteDisplayName];

        const documentLibraryId = await this.getDocumentLibraryId(token, siteId);

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

    private async getSiteId(token: string) {
        const endpoint = 'https://graph.microsoft.com/v1.0/sites';
        try {

            const headers = {
                Authorization: 'Bearer ' + token,
            };

            const response = await axios.get(endpoint, { headers });
            const sites = response.data.value;

            const siteDictionary: { [displayName: string]: string } = {};
            sites.forEach((site: unknown) => {
                if (this.isSite(site)) {
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

    public async getSites(apiKey: string, privateKey: string) {
        const endpoint = 'https://graph.microsoft.com/v1.0/sites/';

        const connection = await Connection.getConnectionCredentials(apiKey, privateKey);
        const token = await Token.requestSharepointToken(connection);

        try {
            const headers = {
                Authorization: 'Bearer ' + token,
            };

            const response = await axios.get(endpoint, { headers });
            const sites = response.data.value;

            const siteDictionary: { [displayName: string]: string } = {};
            sites.forEach((site: any) => { // Changed to 'any' temporarily
                if (this.isSite(site)) {
                    siteDictionary[site.displayName] = site.id;
                }
            });

            const transformedDictionary: { [key: string]: string } = {};
            for (const [key, value] of Object.entries(siteDictionary)) {
                const idSegments = value.split(',');
                if (idSegments.length > 1) {
                    transformedDictionary[key] = idSegments[1];
                }
            }

            const sitesArray = Object.entries(transformedDictionary).map(([displayName, id]) => ({
                DisplayName: displayName,
                Id: id
            }));

            return sitesArray;
        } catch (error) {
            console.error('Error getting sharepoint sites', error);
            throw error;
        }
    }

    private async getDocumentLibraryId(token: string, siteId: string) {
        const endpoint = 'https://graph.microsoft.com/v1.0/sites/ ' + siteId + '/drives';

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

    private isSite(object: any): object is Site {
        return 'displayName' in object && 'id' in object;
    }
}

export default new Sharepoint();