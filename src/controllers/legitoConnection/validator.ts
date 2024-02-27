import createHttpError from 'http-errors';

import type { legitoConnectionCreateBody } from '../../types/routes/legitoConnection';

export const validateCreateLegitoConnectionBody = (body: Partial<legitoConnectionCreateBody>) => {
    const { apiKey, privateKey, domain } = body;

    if (!apiKey) {
        throw createHttpError(400, 'apiKey required');
    }

    if (!privateKey) {
        throw createHttpError(400, 'privateKey required');
    }

    if (!domain) {
        throw createHttpError(400, 'domain required');
    }

    // As the function checked the properties are not missing,
    // return the body as original type
    return body as legitoConnectionCreateBody;
};