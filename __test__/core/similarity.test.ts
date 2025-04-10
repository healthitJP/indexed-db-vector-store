import { cosineSimilarity, cosineDistance, euclideanDistance } from "../../src/core/similarity";


describe("Similarity Calculations", () => {
    describe("cosineSimilarity", () => {
        test("should calculate correct cosine similarity", () => {
            const vectorA = [1, 2, 3];
            const vectorB = [4, 5, 6];
            const result = cosineSimilarity(vectorA, vectorB);
            
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value).toBeCloseTo(0.9746, 4);
            }
        });

        test("should return error for empty vectors", () => {
            const vectorA: number[] = [];
            const vectorB = [1, 2, 3];
            const result = cosineSimilarity(vectorA, vectorB);
            
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe("EMPTY_VECTOR");
                expect(result.error.message).toBe("Vector cannot be empty");
            }
        });

        test("should return error for dimension mismatch", () => {
            const vectorA = [1, 2];
            const vectorB = [1, 2, 3];
            const result = cosineSimilarity(vectorA, vectorB);
            
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe("DIMENSION_MISMATCH");
                expect(result.error.message).toBe("Vector dimensions do not match");
            }
        });

        test("should return error for zero vectors", () => {
            const vectorA = [0, 0, 0];
            const vectorB = [1, 2, 3];
            const result = cosineSimilarity(vectorA, vectorB);
            
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe("ZERO_VECTOR");
                expect(result.error.message).toBe("Vector magnitude cannot be zero");
            }
        });
    });

    describe("cosineDistance", () => {
        test("should calculate correct cosine distance", () => {
            const vectorA = [1, 2, 3];
            const vectorB = [4, 5, 6];
            const result = cosineDistance(vectorA, vectorB);
            
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value).toBeCloseTo(0.0254, 4);
            }
        });

        test("should propagate errors from cosineSimilarity", () => {
            const vectorA: number[] = [];
            const vectorB = [1, 2, 3];
            const result = cosineDistance(vectorA, vectorB);
            
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe("EMPTY_VECTOR");
            }
        });
    });

    describe("euclideanDistance", () => {
        test("should calculate correct euclidean distance", () => {
            const vectorA = [1, 2, 3];
            const vectorB = [4, 5, 6];
            const result = euclideanDistance(vectorA, vectorB);
            
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value).toBeCloseTo(5.1962, 4);
            }
        });

        test("should return error for empty vectors", () => {
            const vectorA: number[] = [];
            const vectorB = [1, 2, 3];
            const result = euclideanDistance(vectorA, vectorB);
            
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe("EMPTY_VECTOR");
            }
        });

        test("should return error for dimension mismatch", () => {
            const vectorA = [1, 2];
            const vectorB = [1, 2, 3];
            const result = euclideanDistance(vectorA, vectorB);
            
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe("DIMENSION_MISMATCH");
            }
        });

        test("should return error for zero vectors", () => {
            const vectorA = [0, 0, 0];
            const vectorB = [0, 0, 0];
            const result = euclideanDistance(vectorA, vectorB);
            
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe("ZERO_VECTOR");
            }
        });
    });
}); 