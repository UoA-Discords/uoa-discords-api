import express from 'express';
import mongoose from 'mongoose';
import router from './routes';
import Config from './types/Config';
import rateLimit from 'express-rate-limit';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { port, mongoURI }: Config = require('../config.json');

const app = express();

const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute (default)
    max: 5, // default
    standardHeaders: true,
});

app.use(limiter);

app.listen(port, () => {
    console.log(`Listening on ${port}`);
});

app.get('/', (_, res) => {
    res.status(200).send('OK');
});

app.use(express.json());
app.use(router);

mongoose
    .connect(mongoURI)
    .then(() => console.log('Mongoose successfully connected'))
    .catch(console.log);
