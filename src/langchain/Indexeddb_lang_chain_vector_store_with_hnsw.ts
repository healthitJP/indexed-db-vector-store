import { VectorStore } from '@langchain/core/vectorstores';
import { Document } from '@langchain/core/documents';
import { EmbeddingsInterface } from '@langchain/core/embeddings';
import { VectorStoreCoreWithHNSW } from '../core/vector_store_with_hnsw';
import { HNSWWithDB } from 'hnsw';
import { DexieStorageAdapterForHNSW } from '../storage/dexie_adapter_for_hnsw';
export interface IndexedDBVectorStoreArgsWithHNSW<T extends Record<string, any>> {
    dbName: string;
    tableName: string;
    metadata?: T;
    M: number;
    efConstruction: number;
}

export class IndexedDBLangChainVectorStoreWithHNSW<T extends Record<string, any>> extends VectorStore {
    private core: VectorStoreCoreWithHNSW<T> | null = null;
    public embeddings: EmbeddingsInterface;

    constructor(embeddings: EmbeddingsInterface, args: IndexedDBVectorStoreArgsWithHNSW<T>) {
        super(embeddings, {});
        this.embeddings = embeddings;
        this.initialize(args);
    }

    private async initialize(args: IndexedDBVectorStoreArgsWithHNSW<T>) {
        const hnsw = await HNSWWithDB.create(args.M, args.efConstruction, args.dbName+"_hnsw");
        const storage = new DexieStorageAdapterForHNSW<T>(args.dbName, args.tableName+"_storage");
        this.core = new VectorStoreCoreWithHNSW<T>(storage, hnsw);
    }

    _vectorstoreType(): string {
        return 'indexeddb';
    }

    async addDocuments(documents: Document[]): Promise<void> {
        const texts = documents.map(doc => doc.pageContent);
        const metadatas = documents.map(doc => doc.metadata as T);
        const vectors = await this.embeddings.embedDocuments(texts);
        await this.core!.addVectors(vectors, metadatas, texts);
    }

    async addVectors(vectors: number[][], documents: Document[]): Promise<void> {
        const texts = documents.map(doc => doc.pageContent);
        const metadatas = documents.map(doc => doc.metadata as T);
        await this.core!.addVectors(vectors, metadatas, texts);
    }

    async similaritySearch(query: string, k: number): Promise<Document[]> {
        const queryVector = await this.embeddings.embedQuery(query);
        const results = await this.core!.similaritySearch(queryVector, k);
        return results.map(doc => new Document({
            pageContent: doc.text,
            metadata: doc.metadata
        }));
    }

    async similaritySearchVectorWithScore(query: number[], k: number): Promise<[Document, number][]> {
        const results = await this.core!.similaritySearchWithScore(query, k);
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
        metadatas: object[] | object,
        embeddings: EmbeddingsInterface,
        dbConfig: IndexedDBVectorStoreArgsWithHNSW<Record<string, any>>
    ): Promise<IndexedDBLangChainVectorStoreWithHNSW<Record<string, any>>> {
        const instance = new this(embeddings, dbConfig);
        const documents = texts.map((text, i) => new Document({
            pageContent: text,
            metadata: Array.isArray(metadatas) ? metadatas[i] : metadatas
        }));
        await instance.addDocuments(documents);
        return instance;
    }

    static async fromDocuments(
        documents: Document[],
        embeddings: EmbeddingsInterface,
        dbConfig: IndexedDBVectorStoreArgsWithHNSW<Record<string, any>>
    ): Promise<IndexedDBLangChainVectorStoreWithHNSW<Record<string, any>>> {
        const instance = new this(embeddings, dbConfig);
        await instance.addDocuments(documents);
        return instance;
    }
}
