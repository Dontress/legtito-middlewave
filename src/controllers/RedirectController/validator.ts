import createHttpError from 'http-errors';

import type { generateRedirectHeaders } from '../../types/routes/redirect';

export const validateRedirectHeaders = (headers: Partial<generateRedirectHeaders>) => {
    const authorization = headers['authorization'];
    const domain = headers['domain'];
    const targetendpoint = headers['targetendpoint'];
    const method = headers['method'];

    if (!authorization) {
        throw createHttpError(400, 'Authorization header not found');
    }

    if (!domain) {
        throw createHttpError(400, 'Domain header not found');
    }

    if (!targetendpoint) {
        throw createHttpError(400, 'TargetEndpoint header not found');
    }

    if (!method) {
        throw createHttpError(400, 'Method header not found');
    }

    // Now we are sure that all the properties are present and are of type string
    return { authorization, domain, targetendpoint, method } as generateRedirectHeaders;
};