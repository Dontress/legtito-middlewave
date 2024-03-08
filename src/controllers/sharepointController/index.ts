import type { Request, Response } from 'express';
import axios from 'axios';

import TokensController from '../tokensController';

const getSites = async (req: Request, res: Response) => {
    const endpoint = 'https://graph.microsoft.com/v1.0/sites/';
    
    const apiKey = req.headers['apikey'];
    const privateKey = req.headers['privatekey'];

    console.log('keys: ' + apiKey + 'private:' + privateKey );
    
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const connection = await TokensController.getConnectionCredentials(apiKey, privateKey);
    const token = await TokensController.requestSharepointToken(connection);

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
        res.status(200);
        res.send(transformedDictionary);
    } catch (error) {
        // Handle error
        console.error('Error getting sharepoint sites', error);
        throw error;
    }
};

interface Site {
    displayName: string;
    id: string;
}

function isSite(object: any): object is Site {
    return 'displayName' in object && 'id' in object;
}

export default {
    getSites
};