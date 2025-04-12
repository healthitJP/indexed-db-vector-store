import "fake-indexeddb/auto";
import { IndexedDBLangChainVectorStoreWithHNSW } from "../../src/langchain/Indexeddb_lang_chain_vector_store_with_hnsw";
import { Document } from "@langchain/core/documents";
import { EmbeddingsInterface } from "@langchain/core/embeddings";
import { VectorStoreCoreWithHNSW } from "../../src/core/vector_store_with_hnsw";
import { IStorageAdapter } from "../../src/storage";

interface TestMetadata {
    category: string;
    timestamp: number;
}

describe("IndexedDBLangChainVectorStore", () => {
    let store: IndexedDBLangChainVectorStoreWithHNSW<TestMetadata>;
    let mockEmbeddings: jest.Mocked<EmbeddingsInterface>;
    let mockCore: jest.Mocked<VectorStoreCoreWithHNSW<TestMetadata>>;
    let mockStorage: jest.Mocked<IStorageAdapter<TestMetadata>>;

    beforeEach(() => {
        // Embeddingsのモック
        mockEmbeddings = {
            embedDocuments: jest.fn().mockResolvedValue([[1, 2, 3], [4, 5, 6]]),
            embedQuery: jest.fn().mockResolvedValue([1, 2, 3])
        } as jest.Mocked<EmbeddingsInterface>;

        // Storageのモック
        mockStorage = {
            initialize: jest.fn().mockResolvedValue(undefined),
            addItems: jest.fn().mockResolvedValue(undefined),
            getItems: jest.fn().mockResolvedValue([]),
            getAllItems: jest.fn().mockResolvedValue([]),
            queryItemsByIndex: jest.fn().mockResolvedValue([]),
            deleteItems: jest.fn().mockResolvedValue(undefined)
        };

        // VectorStoreCoreのモック
        mockCore = {
            hnsw: {
                addPoint: jest.fn().mockResolvedValue(undefined),
                deleteIndex: jest.fn().mockResolvedValue(undefined),
                searchKNN: jest.fn().mockResolvedValue([{ id: 1, score: 0.9 }, { id: 2, score: 0.8 }])
            },
            storage: mockStorage,
            addVectors: jest.fn().mockResolvedValue(undefined),
            deleteVectors: jest.fn().mockResolvedValue(undefined),
            similaritySearch: jest.fn().mockResolvedValue([
                { id: 1, vector: [1, 2, 3], text: "test1", metadata: { category: "test1", timestamp: Date.now() } },
                { id: 2, vector: [4, 5, 6], text: "test2", metadata: { category: "test2", timestamp: Date.now() } }
            ]),
            similaritySearchWithScore: jest.fn().mockResolvedValue([
                [{ id: 1, vector: [1, 2, 3], text: "test1", metadata: { category: "test1", timestamp: Date.now() } }, 0.9],
                [{ id: 2, vector: [4, 5, 6], text: "test2", metadata: { category: "test2", timestamp: Date.now() } }, 0.8]
            ])
        } as unknown as jest.Mocked<VectorStoreCoreWithHNSW<TestMetadata>>;

        // VectorStoreCoreの生成をモック
        jest.spyOn(IndexedDBLangChainVectorStoreWithHNSW.prototype, 'addDocuments').mockImplementation(async function(this: IndexedDBLangChainVectorStoreWithHNSW<TestMetadata>, documents: Document[]) {
            const texts = documents.map(doc => doc.pageContent);
            const metadatas = documents.map(doc => doc.metadata as TestMetadata);
            const vectors = await mockEmbeddings.embedDocuments(texts);
            await mockCore.addVectors(vectors, metadatas, texts);
        });

        jest.spyOn(IndexedDBLangChainVectorStoreWithHNSW.prototype, 'similaritySearch').mockImplementation(async function(this: IndexedDBLangChainVectorStoreWithHNSW<TestMetadata>, query: string, k: number, filter?: Partial<TestMetadata>) {
            const queryVector = await mockEmbeddings.embedQuery(query);
            const results = await mockCore.similaritySearch(queryVector, k);
            return results.map(doc => new Document({
                pageContent: doc.text,
                metadata: doc.metadata
            }));
        });

        store = new IndexedDBLangChainVectorStoreWithHNSW(mockEmbeddings, {
            dbName: "testDB",
            tableName: "testTable",
            M: 16,
            efConstruction: 200
        });
    });

    afterEach(async () => {
        // クリーンアップ処理
    });

    test("should add documents and perform similarity search", async () => {
        const documents = [
            new Document({
                pageContent: "test1",
                metadata: { category: "test1", timestamp: Date.now() }
            }),
            new Document({
                pageContent: "test2",
                metadata: { category: "test2", timestamp: Date.now() }
            })
        ];

        await store.addDocuments(documents);

        expect(mockEmbeddings.embedDocuments).toHaveBeenCalledWith(["test1", "test2"]);
        expect(mockCore.addVectors).toHaveBeenCalledWith(
            [[1, 2, 3], [4, 5, 6]],
            [{ category: "test1", timestamp: expect.any(Number) }, { category: "test2", timestamp: expect.any(Number) }],
            ["test1", "test2"]
        );

        const results = await store.similaritySearch("test1", 2);
        expect(mockEmbeddings.embedQuery).toHaveBeenCalledWith("test1");
        expect(mockCore.similaritySearch).toHaveBeenCalledWith([1, 2, 3], 2);
        expect(results).toHaveLength(2);
        expect(results[0].pageContent).toBe("test1");
        expect(results[1].pageContent).toBe("test2");
    });

    test("should perform similarity search with filter", async () => {
        const documents = [
            new Document({
                pageContent: "test1",
                metadata: { category: "test1", timestamp: Date.now() }
            })
        ];

        await store.addDocuments(documents);
        await store.similaritySearch("test1", 1);

        expect(mockCore.similaritySearch).toHaveBeenCalledWith([1, 2, 3], 1);
    });

    test("should create store from texts", async () => {
        const texts = ["test1", "test2"];
        const metadatas = [
            { category: "test1", timestamp: Date.now() },
            { category: "test2", timestamp: Date.now() }
        ];

        const newStore = await IndexedDBLangChainVectorStoreWithHNSW.fromTexts(
            texts,
            metadatas,
            mockEmbeddings,
            { dbName: "testDB", tableName: "testTable", M: 16, efConstruction: 200 }
        );

        expect(mockEmbeddings.embedDocuments).toHaveBeenCalledWith(texts);
        expect(mockCore.addVectors).toHaveBeenCalledWith(
            [[1, 2, 3], [4, 5, 6]],
            metadatas,
            texts
        );

        const results = await newStore.similaritySearch("test1", 2);
        expect(results).toHaveLength(2);
    });

    test("should create store from documents", async () => {
        const documents = [
            new Document({
                pageContent: "test1",
                metadata: { category: "test1", timestamp: Date.now() }
            }),
            new Document({
                pageContent: "test2",
                metadata: { category: "test2", timestamp: Date.now() }
            })
        ];

        const newStore = await IndexedDBLangChainVectorStoreWithHNSW.fromDocuments(
            documents,
            mockEmbeddings,
            { dbName: "testDB", tableName: "testTable", M: 16, efConstruction: 200 }
        );

        expect(mockEmbeddings.embedDocuments).toHaveBeenCalledWith(["test1", "test2"]);
        expect(mockCore.addVectors).toHaveBeenCalledWith(
            [[1, 2, 3], [4, 5, 6]],
            [{ category: "test1", timestamp: expect.any(Number) }, { category: "test2", timestamp: expect.any(Number) }],
            ["test1", "test2"]
        );

        const results = await newStore.similaritySearch("test1", 2);
        expect(results).toHaveLength(2);
    });
}); 