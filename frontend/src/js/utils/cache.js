// IndexedDB cache utility
class CredentialCache {
  static DB_NAME = 'vc-viewer-cache';
  static STORE_NAME = 'credentials';
  static VERSION = 1;

  static async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
          store.createIndex('type', 'type');
          store.createIndex('timestamp', 'timestamp');
        }
      };
    });
  }

  static async store(credential) {
    const db = await this.init();
    const id = credential.id || crypto.randomUUID();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);

      const request = store.put({
        id,
        credential,
        type: credential.type[credential.type.length - 1],
        timestamp: Date.now()
      });

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  static async get(id) {
    const db = await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result?.credential || null);
      request.onerror = () => reject(request.error);
    });
  }

  static async getByType(type) {
    const db = await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const index = store.index('type');
      const request = index.getAll(type);

      request.onsuccess = () => resolve(request.result.map(r => r.credential));
      request.onerror = () => reject(request.error);
    });
  }

  static async clear() {
    const db = await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  static async clearOld(maxAge = 7 * 24 * 60 * 60 * 1000) { // 1 week default
    const db = await this.init();
    const cutoff = Date.now() - maxAge;
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const index = store.index('timestamp');
      const range = IDBKeyRange.upperBound(cutoff);
      const request = index.openCursor(range);

      let deleted = 0;
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          deleted++;
          cursor.continue();
        } else {
          resolve(deleted);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
}

// Export for use in other files
export default CredentialCache; 