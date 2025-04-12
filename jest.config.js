export default {
  preset: 'ts-jest',  
  testEnvironment: 'node', 
  setupFilesAfterEnv: [
    'fake-indexeddb/auto'  
  ],
};