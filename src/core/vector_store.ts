import { IStorageAdapter } from '../storage';
import { VectorDocument } from './schema';
import { cosineSimilarity } from './similarity';

export class VectorStoreCore<T> {
    private storage: IStorageAdapter<T>;

    constructor(storage: IStorageAdapter<T>) {
        this.storage = storage;
    }

    async addVectors(vectors: number[][], metadatas: T[], texts: string[]): Promise<void> {
        const documents: VectorDocument<T>[] = vectors.map((vector, index) => ({
            id: Date.now() + index,
            vector,
            metadata: metadatas[index],
            text: texts[index]
        }));
        await this.storage.addItems(documents);
    }

    async deleteVectors(ids: number[]): Promise<void> {
        await this.storage.deleteItems(ids);
    }

    async similaritySearch(queryVector: number[], k: number, filter?: Partial<T>): Promise<VectorDocument<T>[]> {
        const candidates = filter 
            ? await this.storage.queryItemsByIndex(filter)
            : await this.storage.getAllItems();

        const results = candidates.map(doc => {
            if (!doc.vector) return { doc, score: -Infinity };
            const similarity = cosineSimilarity(queryVector, doc.vector);
            return { doc, score: similarity.success ? similarity.value : -Infinity };
        });

        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, k)
            .map(result => result.doc);
    }

    async similaritySearchWithScore(queryVector: number[], k: number, filter?: Partial<T>): Promise<[VectorDocument<T>, number][]> {
        const candidates = filter 
            ? await this.storage.queryItemsByIndex(filter)
            : await this.storage.getAllItems();

        const results = candidates.map(doc => {
            if (!doc.vector) return { doc, score: -Infinity };
            const similarity = cosineSimilarity(queryVector, doc.vector);
            return { doc, score: similarity.success ? similarity.value : -Infinity };
        });

        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, k)
            .map(result => [result.doc, result.score]);
    }
} 