import { appendFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';

export interface LoggerParams {
    name: string;
    overwrite?: boolean;
    path?: string | Logger;
    description: string;
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

    public constructor({ name, overwrite, path, description }: LoggerParams) {
        Logger.makeFolder(Logger.GLOBAL_LOG_FOLDER);
        this.basePath = Logger.getBasePath(path);
        Logger.makeParentFolders(this.basePath);

        if (overwrite) {
            this._logFile = `${Logger.GLOBAL_LOG_FOLDER}/${this.basePath}/${name}.log`;
        } else {
            this._logFile = Logger.nameLogFile(this.basePath, name);
        }

        if (!existsSync(this._logFile)) {
            writeFileSync(this._logFile, `${name[0].toUpperCase() + name.slice(1)} Log\n${description}\n\n`, {
                encoding: 'utf-8',
            });
        }
    }

    public log(...messages: unknown[]): void {
        const timestamp = `[${new Date().toLocaleTimeString('en-NZ')}] `;
        const output: string[] = messages.map((e, i) => {
            if (i === 0) return `${timestamp}${e}\n`;
            return `${' '.repeat(timestamp.length)}${e}\n`;
        });

        appendFileSync(this._logFile, output.join(''), { encoding: 'utf-8' });
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
