export type Result<T, E> = {
    success: true;
    value: T;
} | {
    success: false;
    error: E;
};

export type SimilarityError = {
    code: 'DIMENSION_MISMATCH' | 'EMPTY_VECTOR' | 'ZERO_VECTOR';
    message: string;
};


