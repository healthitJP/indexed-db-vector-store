import Dexie, { Table } from 'dexie';
import { IStorageAdapter } from './index';
import { BaseDocument } from '../core/schema';

export class DexieStorageAdapterForHNSW<T> implements IStorageAdapter<T> {
    private db: Dexie;
    private table: Table<BaseDocument<T>, number>;

    constructor(dbName: string, tableName: string) {
        this.db = new Dexie(dbName);
        this.db.version(1).stores({
            [tableName]: 'id, metadata, text'
        });
        this.table = this.db.table(tableName);
    }

    async initialize(): Promise<void> {
        await this.db.open();
    }

    async addItems(items: BaseDocument<T>[]): Promise<void> {
        await this.table.bulkAdd(items);
    }

    async getItems(ids: number[]): Promise<BaseDocument<T>[]> {
        return await this.table.where('id').anyOf(ids).toArray();
    }

    async getAllItems(): Promise<BaseDocument<T>[]> {
        return await this.table.toArray();
    }

    async queryItemsByIndex(filter: Partial<T>): Promise<BaseDocument<T>[]> {
        const items = await this.table.toArray();
        return items.filter(item => {
            return Object.entries(filter).every(([key, value]) => {
                return (item.metadata as any)[key] === value;
            });
        });
    }

    async deleteItems(): Promise<void> {
        await this.table.clear();
    }
}
