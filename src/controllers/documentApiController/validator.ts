import createHttpError from 'http-errors';

import type { catchDocumentBody } from '../../types/routes/documentApi';

export const validateCatchDocumentBody = (body: Partial<catchDocumentBody>) => {
    const { eventType, files } = body;

    if(!eventType){
        throw createHttpError(400, 'Invalid request');
    }

    if(!files){
        throw createHttpError(400, 'Invalid request');
    }

    return body as catchDocumentBody;
};