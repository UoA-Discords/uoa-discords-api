import express from 'express';
import Config from './types/Config';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const config: Config = require('../config.json');

const app = express();

app.listen(config.port, () => {
    console.log(`Listening on ${config.port}`);
});

app.get('/', (_, res) => {
    res.status(200).send('OK');
});
