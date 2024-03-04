import * as dotenv from 'dotenv';
import 'reflect-metadata';
dotenv.config();

import createServer from './config/server';
import { AppDataSource } from './data-source';

const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || '8080';

const app = createServer();

console.log({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    database: process.env.DB_NAME,
});

AppDataSource.initialize()
    .then(() => {
        app.listen({ host, port }, () => {
            console.info(`⚡️ Server is running at http://${host}:${port}`);
        });
    })
    .catch(console.error);