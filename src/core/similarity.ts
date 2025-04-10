
import { Result, SimilarityError } from './type';

export const cosineSimilarity = (vectorA: number[], vectorB: number[]): Result<number, SimilarityError> => {
    if (vectorA.length === 0 || vectorB.length === 0) {
        return { success: false, error: { code: 'EMPTY_VECTOR', message: 'Vector cannot be empty' } };
    }
    if (vectorA.length !== vectorB.length) {
        return { success: false, error: { code: 'DIMENSION_MISMATCH', message: 'Vector dimensions do not match' } };
    }
    const magnitudeA = Math.sqrt(vectorA.reduce((acc, value) => acc + value * value, 0));
    const magnitudeB = Math.sqrt(vectorB.reduce((acc, value) => acc + value * value, 0));
    if (magnitudeA === 0 || magnitudeB === 0) {
        return { success: false, error: { code: 'ZERO_VECTOR', message: 'Vector magnitude cannot be zero' } };
    }
    const dotProduct = vectorA.reduce((acc, value, index) => acc + value * vectorB[index], 0);
    return { success: true, value: dotProduct / (magnitudeA * magnitudeB) };
}

export const cosineDistance = (vectorA: number[], vectorB: number[]): Result<number, SimilarityError> => {
    const result = cosineSimilarity(vectorA, vectorB);
    if (!result.success) {
        return result;
    }
    return { success: true, value: 1 - result.value };
}

export const euclideanDistance = (vectorA: number[], vectorB: number[]): Result<number, SimilarityError> => {
    if (vectorA.length === 0 || vectorB.length === 0) {
        return { success: false, error: { code: 'EMPTY_VECTOR', message: 'Vector cannot be empty' } };
    }
    if (vectorA.length !== vectorB.length) {
        return { success: false, error: { code: 'DIMENSION_MISMATCH', message: 'Vector dimensions do not match' } };
    }
    if (vectorA.every(v => v === 0) || vectorB.every(v => v === 0)) {
        return { success: false, error: { code: 'ZERO_VECTOR', message: 'Vector cannot be all zeros' } };
    }
    return { success: true, value: Math.sqrt(vectorA.reduce((acc, value, index) => acc + (value - vectorB[index]) ** 2, 0)) };
}



