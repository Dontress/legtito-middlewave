import type { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import jwt from 'json-web-token';
//import createHttpError from 'http-errors';

const testLegitoConnection = async (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['api_key'];
    const privateKey = req.headers['private_key'] || 'privateKey';

    const payload = {
        iss: apiKey,
        exp: Math.floor(Date.now() / 1000) + (60 * 60), // Token expiration time (60 minutes from now)
        iat: Math.floor(Date.now() / 1000) // Issued at time
    };

    const token = jwt.encode(privateKey.toString(), payload, 'HS256', (err, token) => {
        if(err) {
            console.error(err);
            return res.status(500).json({ error: "Error creating JWT" });
        }
    });

    try {
        await axios.get('https://emea.legito.com/api/v7/info', {
            headers: {
                'Authorization': token,
            },
        });

        // If successful, call next() to continue to the next middleware
        next();
    } catch (err) {
        console.error('Error making GET request to Legito:', err);
        res.status(500).send('Failed to make GET request to Legito');
        console.log(token);
    }
};

export default {
    testLegitoConnection
};