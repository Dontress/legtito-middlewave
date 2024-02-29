import type { NextFunction, Request, Response } from 'express';

import { validateCatchDocumentBody } from './validator';

const catchDocument = (req: Request, res: Response, next: NextFunction) => {
    const { eventType, files } = validateCatchDocumentBody(req.body);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const fileBase64 = files.generated[0].data;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const fileName = files.generated[0].fileName;

    const nextBody = {
        fileName,
        eventType,
        fileBase64
    };

    console.log(nextBody);
    next();
};

export default {
    catchDocument
};