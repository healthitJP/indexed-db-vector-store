import { VectorStoreCoreWithHNSW } from "../../src/core/vector_store_with_hnsw";
import { DexieStorageAdapterForHNSW } from "../../src/storage/dexie_adapter_for_hnsw";
import { VectorDocument } from "../../src/core/schema";
import { HNSWWithDB } from "hnsw";

// モックのために型定義
interface TestMetadata {
    category: string;
    timestamp: number;
}

jest.mock("hnsw");

describe("VectorStoreCoreWithHNSW", () => {
    let store: VectorStoreCoreWithHNSW<TestMetadata>;
    let mockStorage: jest.Mocked<DexieStorageAdapterForHNSW<TestMetadata>>;
    let mockHNSW: jest.Mocked<HNSWWithDB>;

    beforeEach(() => {
        // Storageのモック
        mockStorage = {
            initialize: jest.fn().mockResolvedValue(undefined),
            addItems: jest.fn().mockResolvedValue(undefined),
            getItems: jest.fn().mockResolvedValue([]),
            getAllItems: jest.fn().mockResolvedValue([]),
            queryItemsByIndex: jest.fn().mockResolvedValue([]),
            deleteItems: jest.fn().mockResolvedValue(undefined)
        } as unknown as jest.Mocked<DexieStorageAdapterForHNSW<TestMetadata>>;

        // HNSWのモック
        mockHNSW = {
            addPoint: jest.fn().mockResolvedValue(undefined),
            deleteIndex: jest.fn().mockResolvedValue(undefined),
            searchKNN: jest.fn().mockResolvedValue([
                { id: 1, score: 0.9 },
                { id: 2, score: 0.8 }
            ])
        } as unknown as jest.Mocked<HNSWWithDB>;

        store = new VectorStoreCoreWithHNSW<TestMetadata>(mockStorage, mockHNSW);
    });

    test("should add vectors and retrieve them", async () => {
        const vectors = [[1, 2, 3], [4, 5, 6]];
        const metadatas = [
            { category: "test1", timestamp: Date.now() },
            { category: "test2", timestamp: Date.now() }
        ];
        const texts = ["test1", "test2"];

        const mockDocuments: VectorDocument<TestMetadata>[] = [
            { id: expect.any(Number), vector: vectors[0], text: texts[0], metadata: metadatas[0] },
            { id: expect.any(Number), vector: vectors[1], text: texts[1], metadata: metadatas[1] }
        ];

        mockStorage.getItems.mockResolvedValueOnce(mockDocuments);

        await store.addVectors(vectors, metadatas, texts);

        expect(mockStorage.addItems).toHaveBeenCalledWith(expect.arrayContaining([
            expect.objectContaining({ vector: vectors[0], text: texts[0], metadata: metadatas[0] }),
            expect.objectContaining({ vector: vectors[1], text: texts[1], metadata: metadatas[1] })
        ]));

        expect(mockHNSW.addPoint).toHaveBeenCalledTimes(2);
    });

    test("should perform similarity search", async () => {
        const queryVector = [1, 2, 3];
        const k = 2;

        const mockDocuments: VectorDocument<TestMetadata>[] = [
            { id: 1, vector: [1, 2, 3], text: "test1", metadata: { category: "test1", timestamp: Date.now() } },
            { id: 2, vector: [4, 5, 6], text: "test2", metadata: { category: "test2", timestamp: Date.now() } }
        ];

        mockStorage.getItems.mockResolvedValueOnce(mockDocuments);

        const results = await store.similaritySearch(queryVector, k);

        expect(mockHNSW.searchKNN).toHaveBeenCalledWith(queryVector, k);
        expect(results).toHaveLength(2);
        expect(results[0].text).toBe("test1");
        expect(results[1].text).toBe("test2");
    });

    test("should perform similarity search with score", async () => {
        const queryVector = [1, 2, 3];
        const k = 2;

        const mockDocuments: VectorDocument<TestMetadata>[] = [
            { id: 1, vector: [1, 2, 3], text: "test1", metadata: { category: "test1", timestamp: Date.now() } },
            { id: 2, vector: [4, 5, 6], text: "test2", metadata: { category: "test2", timestamp: Date.now() } }
        ];

        mockStorage.getItems.mockResolvedValueOnce(mockDocuments);

        const results = await store.similaritySearchWithScore(queryVector, k);

        expect(mockHNSW.searchKNN).toHaveBeenCalledWith(queryVector, k);
        expect(results).toHaveLength(2);
        expect(results[0][0].text).toBe("test1");
        expect(results[0][1]).toBe(0.9);
        expect(results[1][0].text).toBe("test2");
        expect(results[1][1]).toBe(0.8);
    });

    test("should delete vectors", async () => {
        await store.deleteVectors();

        expect(mockStorage.deleteItems).toHaveBeenCalled();
        expect(mockHNSW.deleteIndex).toHaveBeenCalled();
    });

    test("should throw error when vector is missing", async () => {
        const vectors = [undefined];
        const metadatas = [{ category: "test", timestamp: Date.now() }];
        const texts = ["test"];

        await expect(store.addVectors(vectors as any, metadatas, texts))
            .rejects
            .toThrow('no vector');
    });
});