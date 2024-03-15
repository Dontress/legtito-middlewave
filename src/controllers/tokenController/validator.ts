import createHttpError from 'http-errors';

import type { generateTokenBody } from '../../types/routes/token';

export const validateGenerateTokenBody = (body: Partial<generateTokenBody>) => {
    const { apiKey, privateKey } = body;

    if (!apiKey) {
        throw createHttpError(400, 'apiKey required');
    }

    if (!privateKey) {
        throw createHttpError(400, 'privateKey required');

    }
    return body as generateTokenBody;
};