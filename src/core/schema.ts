export type BaseDocument<T> = {
    id: number;
    metadata: T;
    text: string;
}

export type VectorDocument<T> = BaseDocument<T> & {
    vector?: number[];
}
  
