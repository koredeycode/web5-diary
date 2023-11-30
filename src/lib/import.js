const importToIndexDB = async (importData) => {
  try {
    for (const database of importData) {
      const { name: databaseName, stores } = database;

      const openRequest = indexedDB.open(databaseName, 1);

      openRequest.onerror = (event) => {
        console.error('Error opening database:', event.target.error);
      };

      await new Promise((resolve, reject) => {
        openRequest.onsuccess = (event) => {
          const db = event.target.result;

          // Close the current connection to allow the upgrade to complete
          db.close();

          resolve();
        };

        openRequest.onupgradeneeded = (event) => {
          const db = event.target.result;

          // Create object stores based on the importData if they don't exist
          for (const store of stores) {
            if (!db.objectStoreNames.contains(store.name)) {
              db.createObjectStore(store.name);
            }
          }
        };

        openRequest.onblocked = (event) => {
          console.error('Database upgrade blocked:', event.target.error);
          reject(event.target.error);
        };
      });

      // Open a new connection after the upgrade is complete
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open(databaseName, 1);

        request.onerror = (event) => reject(event.target.error);

        request.onsuccess = (event) => resolve(event.target.result);
      });

      for (const store of stores) {
        const { name: storeName, data } = store;

        const transaction = db.transaction(storeName, 'readwrite');
        const objectStore = transaction.objectStore(storeName);

        // Clear existing data in the object store to avoid duplicates
        objectStore.clear();

        for (const item of data) {
          const keyArrayBuffer = new Uint8Array(item.key).buffer;
          const valueUint8Array = new Uint8Array(item.value);

          objectStore.add(valueUint8Array, keyArrayBuffer);
        }
      }

      db.close();
    }

    console.log('Import successful!');
  } catch (error) {
    console.error('Error importing raw array JSON to IndexedDB:', error);
    throw error;
  }
};

export default importToIndexDB;
