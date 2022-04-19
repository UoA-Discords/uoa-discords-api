import DataManager from './DataManager';

export interface CachedStorageProps {
    /** Duration to store items, in seconds. Default is 5 minutes. */
    duration?: number;

    /** Filename of data to read/write to, include if you want
     * the cache to persist between reloads. */
    fileName?: string;
}

/** Cached item storer, stores a record/dictionary of values in memory. */
export default class CachedStorage<T> {
    private _items: Record<string, { data: T; timeout: NodeJS.Timeout }> = {};

    /** Duration to store items, in seconds. */
    private _duration: number;

    private readonly _dataManager?: DataManager;

    public constructor({ duration = 5 * 60, fileName }: CachedStorageProps) {
        this._duration = duration;
        if (fileName) {
            this._dataManager = new DataManager(`data/caches/${fileName}.json`, JSON.stringify({}, undefined, 4));

            const storedDataValues = JSON.parse(this._dataManager.data);

            for (const key in storedDataValues) {
                this.addItem(key, storedDataValues[key]);
            }
        }
    }

    /** Removes all items. */
    public clearAll(): void {
        Object.values(this._items).forEach(({ timeout }) => clearTimeout(timeout));
        this._items = {};
        this.save();
    }

    public getItem(key: string): T | undefined {
        if (this._items[key]) {
            return this._items[key].data;
        }
    }

    /** Adds an item to the cahce. */
    public addItem(key: string, value: T): void {
        this.removeItem(key, true);
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
