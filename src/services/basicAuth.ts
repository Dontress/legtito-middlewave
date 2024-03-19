import createHttpError from 'http-errors';

class BasicAuth{
    public decodeAuthorizationHeader(headerValue: string | undefined): { apiKey: string; privateKey: string }{
        if(!headerValue){
           throw createHttpError(401, 'Invalid auth');
        }

        // Check if the header starts with "Basic ", if not, return null
        if (!headerValue.startsWith('Basic ')) {
            throw createHttpError(401, 'Invalid auth');
        }

        // Remove "Basic " from the start of the headerValue
        const base64Credentials = headerValue.substring(6);

        // Decode the Base64 string
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');

        // Split the decoded string by ':' to get apiKey and privateKey
        const [ apiKey, privateKey] = credentials.split(':');

        // Check if both apiKey and privateKey are present
        if (!apiKey || !privateKey) {
            throw createHttpError(401, 'Invalid auth');
        }

        return { apiKey, privateKey };
    }
}

export default new BasicAuth();