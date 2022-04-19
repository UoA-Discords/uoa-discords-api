/** Cached item storer, stores a record/dictionary of values in memory. */
export default class CachedStorage<T> {
    private _items: Record<string, { data: T; timeout: NodeJS.Timeout }> = {};

    /** Duration to store items, in seconds. */
    private _duration: number;

    /** @param {number} duration - Duration to store items, in seconds. Default is 5 minutes. */
    public constructor(duration: number = 5 * 60) {
        this._duration = duration;
    }

    /** Removes all items. */
    public clearAll(): void {
        Object.values(this._items).forEach(({ timeout }) => clearTimeout(timeout));
        this._items = {};
    }

    public getItem(key: string): T | undefined {
        if (this._items[key]) {
            return this._items[key].data;
        }
    }

    /** Adds an item to the cahce. */
    public addItem(key: string, value: T): void {
        this.removeItem(key);
        this._items[key] = {
            data: value,
            timeout: setTimeout(() => {
                this.removeItem(key);
            }, 1000 * this._duration),
        };
    }

    /**
     * Removes an item from the cache.
     *
     * @returns {boolean} Whether the item existed prior to deletion.
     */
    public removeItem(key: string): boolean {
        if (this._items[key]) {
            clearTimeout(this._items[key].timeout);
            delete this._items[key];
            return true;
        }
        return false;
    }
}
