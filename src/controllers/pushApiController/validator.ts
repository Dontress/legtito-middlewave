import createHttpError from 'http-errors';

import type { createPushApiBody } from '../../types/routes/pushApi';

export const validateCreateConnectionBody = (body: Partial<createPushApiBody>) => {
    const { apiKey, privateKey, domain, connectionName, triggerEvent, siteDisplayName } = body;

    if (!apiKey) {
        throw createHttpError(400, 'apiKey required');
    }

    if (!privateKey) {
        throw createHttpError(400, 'privateKey required');
    }

    if (!domain) {
        throw createHttpError(400, 'domain required');
    }

    if (!connectionName) {
        throw createHttpError(400, 'connectionName required');
    }

    if (!triggerEvent) {
        throw createHttpError(400, 'triggerEvent required');
    }

    if (!siteDisplayName) {
        throw createHttpError(400, 'siteDisplayName required');
    }

    return body as createPushApiBody;
};

