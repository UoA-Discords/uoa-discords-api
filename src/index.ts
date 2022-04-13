import Server from './classes/Server';
import Config from './types/Config';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { port, mongoURI }: Config = require('../config.json');

const server = new Server({ port, mongoURI });
export default server;
