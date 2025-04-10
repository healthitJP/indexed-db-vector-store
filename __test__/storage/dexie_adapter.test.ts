import "fake-indexeddb/auto";
import { DexieStorageAdapter } from "../../src/storage/dexie_adapter";
import { VectorDocument } from "../../src/core/schema";

interface TestMetadata {
    category: string;
    timestamp: number;
}

describe("DexieStorageAdapter", () => {
    let adapter: DexieStorageAdapter<TestMetadata>;
    const dbName = "testDB";
    const tableName = "testTable";

    beforeEach(async () => {
        adapter = new DexieStorageAdapter<TestMetadata>(dbName, tableName);
        await adapter.initialize();
    });

    afterEach(async () => {
        await adapter.deleteItems([1, 2, 3]);
    });

    test("should add and retrieve items", async () => {
        const items: VectorDocument<TestMetadata>[] = [
            {
                id: 1,
                vector: [1, 2, 3],
                text: "test1",
                metadata: { category: "test", timestamp: Date.now() }
            },
            {
                id: 2,
                vector: [4, 5, 6],
                text: "test2",
                metadata: { category: "test", timestamp: Date.now() }
            }
        ];

        await adapter.addItems(items);
        const retrieved = await adapter.getItems([1, 2]);
        
        expect(retrieved).toHaveLength(2);
        expect(retrieved[0].text).toBe("test1");
        expect(retrieved[1].text).toBe("test2");
    });

    test("should query items by metadata", async () => {
        const items: VectorDocument<TestMetadata>[] = [
            {
                id: 1,
                vector: [1, 2, 3],
                text: "test1",
                metadata: { category: "test1", timestamp: Date.now() }
            },
            {
                id: 2,
                vector: [4, 5, 6],
                text: "test2",
                metadata: { category: "test2", timestamp: Date.now() }
            }
        ];

        await adapter.addItems(items);
        const results = await adapter.queryItemsByIndex({ category: "test1" });
        
        expect(results).toHaveLength(1);
        expect(results[0].text).toBe("test1");
    });

    test("should delete items", async () => {
        const items: VectorDocument<TestMetadata>[] = [
            {
                id: 1,
                vector: [1, 2, 3],
                text: "test1",
                metadata: { category: "test", timestamp: Date.now() }
            }
        ];

        await adapter.addItems(items);
        await adapter.deleteItems([1]);
        const retrieved = await adapter.getItems([1]);
        
        expect(retrieved).toHaveLength(0);
    });

    test("should get all items", async () => {
        const items: VectorDocument<TestMetadata>[] = [
            {
                id: 1,
                vector: [1, 2, 3],
                text: "test1",
                metadata: { category: "test", timestamp: Date.now() }
            },
            {
                id: 2,
                vector: [4, 5, 6],
                text: "test2",
                metadata: { category: "test", timestamp: Date.now() }
            }
        ];

        await adapter.addItems(items);
        const allItems = await adapter.getAllItems();
        
        expect(allItems).toHaveLength(2);
    });
}); 