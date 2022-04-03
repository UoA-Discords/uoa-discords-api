import express from 'express';
import mongoose from 'mongoose';
import router from './routes';
import Config from './types/Config';
import rateLimit from 'express-rate-limit';
import cors, { CorsOptions } from 'cors';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { port, mongoURI }: Config = require('../config.json');

const app = express();

const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute (default)
    max: 30, // default is 5
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter);

app.listen(port, () => {
    console.log(`Listening on ${port}`);
});

app.get('/', (_, res) => {
    res.status(200).send('OK');
});

const whitelist = new Set(['http://localhost:3000', 'http://127.0.0.1:3000', 'https://uoa-discords.com']);

const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        if (!origin || whitelist.has(origin)) callback(null, true);
        else callback(new Error('Not allowed by CORS'));
    },
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(router);

mongoose
    .connect(mongoURI)
    .then(() => console.log('Mongoose successfully connected'))
    .catch(console.log);
