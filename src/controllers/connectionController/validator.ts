import createHttpError from 'http-errors';

import type { createConnectionBody, deleteConnectionBody } from '../../types/routes/connection';

export const validateCreateConnectionBody = (body: Partial<createConnectionBody>) => {
    const { apiKey, privateKey, domain, tenantId, clientSecret, clientId } = body;

    if (!apiKey) {
        throw createHttpError(400, 'apiKey required');
    }

    if (!privateKey) {
        throw createHttpError(400, 'privateKey required');
    }

    if (!domain) {
        throw createHttpError(400, 'domain required');
    }

    if (!tenantId) {
        throw createHttpError(400, 'tenantId required');
    }

    if (!clientSecret) {
        throw createHttpError(400, 'clientSecret required');
    }

    if (!clientId) {
        throw createHttpError(400, 'clientId required');
    }

    return body as createConnectionBody;
};

export const validateDeleteConnectionBody = (body: Partial<deleteConnectionBody>) => {
    const { apiKey, privateKey } = body;

    if (!apiKey) {
        throw createHttpError(400, 'apiKey required');
    }

    if (!privateKey) {
        throw createHttpError(400, 'privateKey required');
    }

    return body as createConnectionBody;
};

