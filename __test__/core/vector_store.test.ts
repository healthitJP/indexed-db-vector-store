import { VectorStoreCore } from "../../src/core/vector_store";
import { IStorageAdapter } from "../../src/storage";
import { VectorDocument } from "../../src/core/schema";

interface TestMetadata {
    category: string;
    timestamp: number;
}

describe("VectorStoreCore", () => {
    let store: VectorStoreCore<TestMetadata>;
    let mockAdapter: jest.Mocked<IStorageAdapter<TestMetadata>>;

    beforeEach(() => {
        // IStorageAdapterのモックを作成
        mockAdapter = {
            initialize: jest.fn().mockResolvedValue(undefined),
            addItems: jest.fn().mockResolvedValue(undefined),
            getItems: jest.fn().mockResolvedValue([]),
            getAllItems: jest.fn().mockResolvedValue([]),
            queryItemsByIndex: jest.fn().mockResolvedValue([]),
            deleteItems: jest.fn().mockResolvedValue(undefined)
        };

        store = new VectorStoreCore<TestMetadata>(mockAdapter);
    });

    test("should add vectors and retrieve them", async () => {
        const vectors = [[1, 2, 3], [4, 5, 6]];
        const metadatas = [
            { category: "test1", timestamp: Date.now() },
            { category: "test2", timestamp: Date.now() }
        ];
        const texts = ["test1", "test2"];

        // モックの設定
        const mockDocuments: VectorDocument<TestMetadata>[] = [
            { id: 1, vector: vectors[0], text: texts[0], metadata: metadatas[0] },
            { id: 2, vector: vectors[1], text: texts[1], metadata: metadatas[1] }
        ];
        mockAdapter.getAllItems.mockResolvedValueOnce(mockDocuments);

        await store.addVectors(vectors, metadatas, texts);
        const results = await store.similaritySearch([1, 2, 3], 2);

        expect(mockAdapter.addItems).toHaveBeenCalledWith(expect.arrayContaining([
            expect.objectContaining({ vector: vectors[0], text: texts[0], metadata: metadatas[0] }),
            expect.objectContaining({ vector: vectors[1], text: texts[1], metadata: metadatas[1] })
        ]));
        expect(results).toHaveLength(2);
        expect(results[0].text).toBe("test1");
        expect(results[1].text).toBe("test2");
    });

    test("should perform similarity search with filter", async () => {
        const vectors = [[1, 2, 3], [4, 5, 6]];
        const metadatas = [
            { category: "test1", timestamp: Date.now() },
            { category: "test2", timestamp: Date.now() }
        ];
        const texts = ["test1", "test2"];

        // モックの設定
        const mockDocuments: VectorDocument<TestMetadata>[] = [
            { id: 1, vector: vectors[0], text: texts[0], metadata: metadatas[0] }
        ];
        mockAdapter.queryItemsByIndex.mockResolvedValueOnce(mockDocuments);

        await store.addVectors(vectors, metadatas, texts);
        const results = await store.similaritySearch([1, 2, 3], 1, { category: "test1" });

        expect(mockAdapter.queryItemsByIndex).toHaveBeenCalledWith({ category: "test1" });
        expect(results).toHaveLength(1);
        expect(results[0].text).toBe("test1");
    });

    test("should delete vectors", async () => {
        const vectors = [[1, 2, 3]];
        const metadatas = [{ category: "test", timestamp: Date.now() }];
        const texts = ["test"];

        await store.addVectors(vectors, metadatas, texts);
        await store.deleteVectors([1]);

        expect(mockAdapter.deleteItems).toHaveBeenCalledWith([1]);
    });

    test("should return empty array when no vectors match filter", async () => {
        const vectors = [[1, 2, 3]];
        const metadatas = [{ category: "test", timestamp: Date.now() }];
        const texts = ["test"];

        // モックの設定
        mockAdapter.queryItemsByIndex.mockResolvedValueOnce([]);

        await store.addVectors(vectors, metadatas, texts);
        const results = await store.similaritySearch([1, 2, 3], 1, { category: "nonexistent" });

        expect(mockAdapter.queryItemsByIndex).toHaveBeenCalledWith({ category: "nonexistent" });
        expect(results).toHaveLength(0);
    });
}); 