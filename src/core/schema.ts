export type VectorDocument<T> ={
    id: number;
    metadata: T;
    text: string;
    vector?: number[];
}
  