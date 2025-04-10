import { VectorDocument } from '../core/schema';

// ストレージに保存するアイテムの型定義
export type StoredItem = {
  id: string;
  vector: number[];
  metadata: Record<string, any>;
}

// メタデータ検索用のフィルター型定義
export type MetadataFilter = {
  [key: string]: any;
}

// ストレージアダプターのインターフェース定義
export interface IStorageAdapter<T> {
  // データベースの初期化
  initialize(): Promise<void>;

  // アイテムの追加
  addItems(items: VectorDocument<T>[]): Promise<void>;

  // 指定IDのアイテム取得
  getItems(ids: number[]): Promise<VectorDocument<T>[]>;

  // 全アイテム取得
  getAllItems(): Promise<VectorDocument<T>[]>;

  // メタデータによる検索
  queryItemsByIndex(filter: Partial<T>): Promise<VectorDocument<T>[]>;

  // アイテムの削除
  deleteItems(ids: number[]): Promise<void>;
}
