import createHttpError from 'http-errors';

import type { sharepointConnectionCreateBody } from '../../types/routes/sharepointConnection';

export const validateCreateSharepointConnectionBody = (body: Partial<sharepointConnectionCreateBody>) => {
    const { clientId, clientSecret, tenantId, apiKey } = body;

    if (!clientId) {
        throw createHttpError(400, 'clientId required');
    }

    if (!clientSecret) {
        throw createHttpError(400, 'clientSecret required');
    }

    if (!tenantId) {
        throw createHttpError(400, 'tenantId required');
    }

    if (!apiKey) {
        throw createHttpError(400, 'apiKey required');
    }

    // As the function checked the properties are not missing,
    // return the body as original type
    return body as sharepointConnectionCreateBody;
};