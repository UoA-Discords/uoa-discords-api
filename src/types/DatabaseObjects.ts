import { ApplicationServer, RegisteredServer } from '@uoa-discords/shared-utils';

export interface _RegisteredServer extends RegisteredServer {
    /** Guild ID. */
    _id: string;
}

export interface _ApplicationServer extends ApplicationServer {
    /** Guild ID. */
    _id: string;
}
