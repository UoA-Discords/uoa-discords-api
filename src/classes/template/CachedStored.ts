import { CombinedRoutes } from '@uoa-discords/shared-utils/dist/types';
import ServerLogger from '../ServerLogger';
import DataManager from './DataManager';

export interface CachedStorageProps {
    /** Duration to store items, in seconds. Default is 5 minutes. */
    duration?: number;

    /**
     * Filename of data to read/write to.
     *
     * Include if you want the cache to persist between reloads. */
    fileName?: string;

    /**
     * Maximum number of key value pairs to store in the cache.
     *
     * Defaults to 100.
     *
     */
    maxSize?: number;
}

/** Cached item storer, stores a record/dictionary of values in memory. */
export default class CachedStorage<T> {
    private _items: Record<string, { data: T; timeout: NodeJS.Timeout }> = {};

    private _currentSize = 0;
    private readonly _maxSize: number = 100;

    /** Duration to store items, in seconds. */
    private readonly _duration: number;

    private readonly _dataManager?: DataManager;

    public constructor({ duration = 5 * 60, fileName, maxSize }: CachedStorageProps) {
        this._duration = duration;
        if (fileName) {
            this._dataManager = new DataManager(`data/caches/${fileName}.json`, JSON.stringify({}, undefined, 4));

            const storedDataValues = JSON.parse(this._dataManager.data);

            for (const key in storedDataValues) {
                this.addItem(key, storedDataValues[key]);
                this._currentSize++;
            }
        }

        if (maxSize) {
            this._maxSize = maxSize;
        }
    }

    /** Removes all items. */
    public clearAll(): void {
        Object.values(this._items).forEach(({ timeout }) => clearTimeout(timeout));
        this._items = {};
        this._currentSize = 0;
        this.save();
    }

    public getItem(key: string): T | undefined {
        if (this._items[key]) {
            return this._items[key].data;
        }
    }

    /** Adds an item to the cache. */
    public addItem(key: string, value: T): void {
        if (this._currentSize >= this._maxSize) {
            ServerLogger.logError(
                'CACHES' as CombinedRoutes,
                `Hit max size (${this._currentSize}/${this._maxSize})`,
                `Trying to add key: ${key}`,
                'Value:',
                value,
            );
            return;
        }

        this.removeItem(key, true);
        this._currentSize++;
        this._items[key] = {
            data: value,
            timeout: setTimeout(() => {
                this.removeItem(key);
            }, 1000 * this._duration),
        };

        this.save();
    }

    /** Removes an item from the cache. */
    public removeItem(key: string, withoutSaving: boolean = false): void {
        if (!this._items[key]) return;
        this._currentSize--;
        clearTimeout(this._items[key].timeout);
        delete this._items[key];

        if (!withoutSaving) this.save();
    }

    public save(): void {
        if (this._dataManager) {
            const payload: Record<string, T> = {};
            for (const key in this._items) {
                payload[key] = this._items[key].data;
            }

            this._dataManager.data = JSON.stringify(payload, undefined, 4);
        }
    }
}
