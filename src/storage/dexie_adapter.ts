import Dexie, { Table } from 'dexie';
import { IStorageAdapter } from './index';
import { VectorDocument } from '../core/schema';

export class DexieStorageAdapter<T> implements IStorageAdapter<T> {
    private db: Dexie;
    private table: Table<VectorDocument<T>, number>;

    constructor(dbName: string, tableName: string) {
        this.db = new Dexie(dbName);
        this.db.version(1).stores({
            [tableName]: 'id, metadata, text, vector'
        });
        this.table = this.db.table(tableName);
    }

    async initialize(): Promise<void> {
        await this.db.open();
    }

    async addItems(items: VectorDocument<T>[]): Promise<void> {
        await this.table.bulkAdd(items);
    }

    async getItems(ids: number[]): Promise<VectorDocument<T>[]> {
        return await this.table.where('id').anyOf(ids).toArray();
    }

    async getAllItems(): Promise<VectorDocument<T>[]> {
        return await this.table.toArray();
    }

    async queryItemsByIndex(filter: Partial<T>): Promise<VectorDocument<T>[]> {
        const items = await this.table.toArray();
        return items.filter(item => {
            return Object.entries(filter).every(([key, value]) => {
                return (item.metadata as any)[key] === value;
            });
        });
    }

    async deleteItems(ids: number[]): Promise<void> {
        await this.table.where('id').anyOf(ids).delete();
    }
}
