# IndexedDB Vector Store for LangChain

A LangChain compatible vector store implementation using IndexedDB for browser-based applications.

[![npm version](https://badge.fury.io/js/indexed-db-vector-store.svg)](https://www.npmjs.com/package/indexed-db-vector-store)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 Compatible with LangChain's vector store interface
- 💾 Browser-based storage using IndexedDB
- 🔍 Support for metadata filtering
- ⚡ Efficient similarity search
- 📦 Zero dependencies (except for LangChain and Dexie)

## Installation

```bash
npm install indexed-db-vector-store
```

## Usage

```typescript
import { IndexedDBLangChainVectorStore } from 'indexed-db-vector-store';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';

// Initialize the vector store
const vectorStore = new IndexedDBLangChainVectorStore({
  embeddings: new OpenAIEmbeddings(),
  dbName: 'my-vector-store',
  tableName: 'documents'
});

// Add documents
await vectorStore.addDocuments([
  { pageContent: 'Hello world', metadata: { source: 'test' } }
]);

// Search for similar documents
const results = await vectorStore.similaritySearch('Hello', 1);
console.log(results);
```

## API Reference

### Constructor

```typescript
new IndexedDBLangChainVectorStore({
  embeddings: EmbeddingsInterface,
  dbName: string,
  tableName: string,
  metadata?: Record<string, any>
})
```

### Methods

- `addDocuments(documents: Document[]): Promise<void>`
- `addVectors(vectors: number[][], documents: Document[]): Promise<void>`
- `similaritySearch(query: string, k: number, filter?: Record<string, any>): Promise<Document[]>`
- `similaritySearchVectorWithScore(query: number[], k: number, filter?: Record<string, any>): Promise<[Document, number][]>`

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run tests
npm test
```

## License

MIT License

Copyright (c) 2025 Ushida Yosei

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
