import { VectorStore } from '@langchain/core/vectorstores';
import { Document } from '@langchain/core/documents';
import { EmbeddingsInterface } from '@langchain/core/embeddings';
import { VectorStoreCore } from '../core/vector_store';
import { DexieStorageAdapter } from '../storage/dexie_adapter';

export interface IndexedDBVectorStoreArgs<T extends Record<string, any>> {
    dbName: string;
    tableName: string;
    metadata?: T;
}

export class IndexedDBLangChainVectorStore<T extends Record<string, any>> extends VectorStore {
    private core: VectorStoreCore<T>;
    public embeddings: EmbeddingsInterface;

    constructor(embeddings: EmbeddingsInterface, args: IndexedDBVectorStoreArgs<T>) {
        super(embeddings, {});
        this.embeddings = embeddings;
        const storage = new DexieStorageAdapter<T>(args.dbName, args.tableName);
        this.core = new VectorStoreCore<T>(storage);
    }

    _vectorstoreType(): string {
        return 'indexeddb';
    }

    async addDocuments(documents: Document[]): Promise<void> {
        const texts = documents.map(doc => doc.pageContent);
        const metadatas = documents.map(doc => doc.metadata as T);
        const vectors = await this.embeddings.embedDocuments(texts);
        await this.core.addVectors(vectors, metadatas, texts);
    }

    async addVectors(vectors: number[][], documents: Document[]): Promise<void> {
        const texts = documents.map(doc => doc.pageContent);
        const metadatas = documents.map(doc => doc.metadata as T);
        await this.core.addVectors(vectors, metadatas, texts);
    }

    async similaritySearch(query: string, k: number, filter?: Partial<T>): Promise<Document[]> {
        const queryVector = await this.embeddings.embedQuery(query);
        const results = await this.core.similaritySearch(queryVector, k, filter);
        return results.map(doc => new Document({
            pageContent: doc.text,
            metadata: doc.metadata
        }));
    }

    async similaritySearchVectorWithScore(query: number[], k: number, filter?: Partial<T>): Promise<[Document, number][]> {
        const results = await this.core.similaritySearchWithScore(query, k, filter);
        return results.map(([doc, score]) => [
            new Document({
                pageContent: doc.text,
                metadata: doc.metadata
            }),
            score
        ]);
    }

    static async fromTexts(
        texts: string[],
        metadatas: Record<string, any>[],
        embeddings: EmbeddingsInterface,
        args: IndexedDBVectorStoreArgs<Record<string, any>>
    ): Promise<IndexedDBLangChainVectorStore<Record<string, any>>> {
        const instance = new this(embeddings, args);
        const documents = texts.map((text, i) => new Document({
            pageContent: text,
            metadata: metadatas[i]
        }));
        await instance.addDocuments(documents);
        return instance;
    }

    static async fromDocuments(
        documents: Document[],
        embeddings: EmbeddingsInterface,
        args: IndexedDBVectorStoreArgs<Record<string, any>>
    ): Promise<IndexedDBLangChainVectorStore<Record<string, any>>> {
        const instance = new this(embeddings, args);
        await instance.addDocuments(documents);
        return instance;
    }
}
