import { appendFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';

export interface LoggerParams {
    name: string;
    overwrite?: boolean;
    path?: string | Logger;
}

/**
 * File logging class.
 *
 * @author NachoToast
 */
export default class Logger {
    private static readonly GLOBAL_LOG_FOLDER = 'logs';

    /** Base path between root folder (e.g. `logs/`) and file name (`filename.log`) */
    public readonly basePath: string;

    /** Full file path of this log file, e.g. `logs/foo/bar/filename.log` */
    private readonly _logFile: string;

    public constructor({ name, overwrite = true, path }: LoggerParams) {
        Logger.makeFolder(Logger.GLOBAL_LOG_FOLDER);
        this.basePath = Logger.getBasePath(path);
        Logger.makeParentFolders(this.basePath);

        if (overwrite) {
            this._logFile = `${Logger.GLOBAL_LOG_FOLDER}/${this.basePath}/${name}.log`;
        } else {
            this._logFile = Logger.nameLogFile(this.basePath, name);
        }

        if (!existsSync(this._logFile)) {
            writeFileSync(this._logFile, '');
        }
    }

    private parseToString(data: unknown): string {
        switch (typeof data) {
            case 'string':
                return data;
            case 'boolean':
                return data ? 'true' : 'false';
            case 'bigint':
                return data.toString();
            case 'undefined':
                return 'undefined';
            case 'function':
            case 'number':
            case 'symbol':
                return data.toString();
            case 'object':
                break;
        }

        if (data === null) return 'null';
        if (Array.isArray(data)) return data.map((e) => this.parseToString(e)).join('\n');

        try {
            return JSON.stringify(data, undefined, 2);
        } catch (error) {
            console.log(error);
            return `${data}`;
        }
    }

    public log(...messages: unknown[]): void {
        if (!messages.length) throw new Error('Cannot log nothing');

        const timestamp = `[${new Date().toLocaleString('en-NZ')}] `;
        const output: string[] = messages.map((e) => this.parseToString(e));
        output[0] = timestamp + output[0];

        for (let i = 1, len = output.length; i < len; i++) {
            output[i] = output[i]
                .split('\n')
                .map((e) => '  ' + e)
                .join('\n');
        }

        appendFileSync(this._logFile, output.join('\n') + '\n', { encoding: 'utf-8' });
    }

    /**
     * Handles deciding the name of the log file in the case of duplicates, such as when the application restarts.
     *
     * E.g. If `filename.log` already existed, the new log file would be `filename-1.log`.
     *
     * Only applicable if {@link LoggerParams.overwrite overwrite} is off.
     */
    private static nameLogFile(basePath: string, name: string): string {
        let currentName = `${Logger.GLOBAL_LOG_FOLDER}/${basePath}/${name}.log`;
        let fileCount = 0;

        while (existsSync(currentName)) {
            currentName = `${Logger.GLOBAL_LOG_FOLDER}/${basePath}/${name}-${fileCount++}.log`;
        }

        return currentName;
    }

    /**
     * Handles creation of nested folders.
     *
     * @throws Throws an error if a parent folder was unable to be created, and did not already exist.
     *
     */
    private static makeParentFolders(path: string): void {
        const parentDirectories = path.split(/[/\\]/); // split path into its subfolders
        let recursivePath = `${Logger.GLOBAL_LOG_FOLDER}/`; // start at highest level

        for (const folder of parentDirectories) {
            Logger.makeFolder(`${recursivePath}${folder}`);
            recursivePath += `${folder}/`;
        }
    }

    private static getBasePath(path: string | Logger | undefined): string {
        if (path instanceof Logger) return path.basePath;
        return path || '';
    }

    /**
     * Attempts to create a folder.
     *
     * If the folder already exists, nothing will happen.
     *
     * @throws Throws an error if the folder was unable to be created and did not already exist.
     */
    private static makeFolder(path: string): void {
        try {
            mkdirSync(path);
        } catch (error) {
            if ((error as { code?: string })?.code !== 'EEXIST') {
                throw error;
            }
        }
    }
}
