import { VectorDocument } from './schema';
import { HNSWWithDB } from 'hnsw';
import { DexieStorageAdapterForHNSW } from '../storage/dexie_adapter_for_hnsw';

export class VectorStoreCoreWithHNSW<T> {
    private hnsw: HNSWWithDB;
    private storage: DexieStorageAdapterForHNSW<T>;

    constructor(storage: DexieStorageAdapterForHNSW<T>, hnsw: HNSWWithDB) {
        this.storage = storage;
        this.hnsw = hnsw;
    }

    async addVectors(vectors: number[][], metadatas: T[], texts: string[]): Promise<void> {
        const documents: VectorDocument<T>[] = vectors.map((vector, index) => ({
            id: Date.now() + index,
            vector,
            metadata: metadatas[index],
            text: texts[index]
        }));
        await this.storage.addItems(documents);
        for (const doc of documents) {
            if (doc.vector) {  // vectorが存在するかチェック
                await this.hnsw.addPoint(doc.id, doc.vector);
            }
            else {
                throw new Error('no vector');
            }
        }
    }

    async deleteVectors(): Promise<void> {
        await this.storage.deleteItems();
        await this.hnsw.deleteIndex();
    }

    async similaritySearch(queryVector: number[], k: number): Promise<VectorDocument<T>[]> {
        const results = await this.hnsw.searchKNN(queryVector, k);
        return await this.storage.getItems(results.map(result => result.id));
    }

    async similaritySearchWithScore(queryVector: number[], k: number): Promise<[VectorDocument<T>, number][]> {
        const results = await this.hnsw.searchKNN(queryVector, k);
        const docs = await this.storage.getItems(results.map(result => result.id));
        return results.map((result, index) => [docs[index], result.score]);
    }
} 