import cors, { CorsOptions } from 'cors';
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import express, { Express } from 'express';
import router from '../routes';
import mongoose from 'mongoose';

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

    public constructor({ port, mongoURI }: ServerProps) {
        this._app.use(Server.LIMITER);
        // this._app.use(cors(Server.CORS_OPTIONS));
        this._app.use(cors());

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
