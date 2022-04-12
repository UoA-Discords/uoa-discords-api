import cors, { CorsOptions } from 'cors';
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import express, { Express } from 'express';
import router from '../routes';
import mongoose from 'mongoose';
import Logger from './Logger';

interface ServerProps {
    port: number;
    mongoURI: string;
}

export default class Server {
    private static readonly WHITELIST: Set<string> = new Set([
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'https://uoa-discords.com',
    ]);

    private static readonly CORS_OPTIONS: CorsOptions = {
        origin: (origin, callback) => {
            if (!origin || Server.WHITELIST.has(origin)) callback(null, true);
            else callback(new Error('Not allowed by CORS'));
        },
    };

    private static readonly LIMITER: RateLimitRequestHandler = rateLimit({
        windowMs: 60 * 1000, // 1 minute (default)
        max: 30, // default
        standardHeaders: true,
        legacyHeaders: false,
    });

    private _app: Express = express();

    public applicationLog: Logger = new Logger({
        name: 'applications',
        overwrite: true,
        description: 'Logs application created events.',
    });

    public auditLog: Logger = new Logger({
        name: 'audit',
        overwrite: true,
        description: 'Logs verifier events like accept, reject, blacklist, opt-out, and change tags.',
    });

    public authLog: Logger = new Logger({
        name: 'auth',
        overwrite: true,
        description: 'Logs auth events like login, logout, and refresh.',
    });

    public errorLog: Logger = new Logger({
        name: 'error',
        overwrite: true,
        description: 'Logs unhandled, unexpected, and/or unknown server errors.',
    });

    public securityLog: Logger = new Logger({
        name: 'security',
        overwrite: true,
        description:
            'Logs unexpected (but handled) requests that should not happen unless a third-party client is being used.',
    });

    public constructor({ port, mongoURI }: ServerProps) {
        this._app.use(Server.LIMITER);
        this._app.use(cors(Server.CORS_OPTIONS));
        this._app.use(express.json());

        this._app.get('/', (_, res) => {
            res.sendStatus(200);
        });

        this._app.listen(port, () => {
            console.log(`Listening on port ${port}`);
        });

        mongoose
            .connect(mongoURI)
            .then(() => this._app.use(router))
            .catch(console.log);
    }
}
