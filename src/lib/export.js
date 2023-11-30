const exportFromIndexDB = async () => {
  const allDatabases = [];

  try {
    let databases;

    try {
      // Try to use indexedDB.databases() if available
      databases = await indexedDB.databases();
    } catch (databasesError) {
      console.warn(
        'indexedDB.databases() is not available. Using manual list of databases.',
      );

      // If indexedDB.databases() is not available, use a manual list of databases
      databases = [
        { name: 'level-js-DATA/AGENT/APPDATA' },
        { name: 'level-js-DATA/AGENT/DID_RESOLVERCACHE' },
        { name: 'level-js-DATA/AGENT/DWN_DATASTORE' },
        { name: 'level-js-DATA/AGENT/DWN_EVENTLOG' },
        { name: 'level-js-DATA/AGENT/DWN_MESSAGEINDEX' },
        { name: 'level-js-DATA/AGENT/DWN_MESSAGESTORE' },
        { name: 'level-js-DATA/AGENT/SYNC_STORE' },
      ];
    }

    if (databases.length === 0) {
      console.log('No IndexedDB databases found.');
      return;
    }

    for (const databaseInfo of databases) {
      const { name: databaseName } = databaseInfo;
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open(databaseName);
        request.onerror = (event) => reject(event.target.error);
        request.onsuccess = (event) => resolve(event.target.result);
      });

      const databaseObject = {
        name: databaseName,
        stores: [],
      };

      const objectStoreNames = Array.from(db.objectStoreNames);

      for (const objectStoreName of objectStoreNames) {
        const storeData = {
          name: objectStoreName,
          data: [],
        };

        const transaction = db.transaction(objectStoreName, 'readonly');
        const objectStore = transaction.objectStore(objectStoreName);
        const cursor = objectStore.openCursor();

        await new Promise((resolve, reject) => {
          cursor.onsuccess = (event) => {
            const cursor = event.target.result;

            if (cursor) {
              const keyArray = Array.from(new Uint8Array(cursor.key));
              const valueArray = Array.from(cursor.value);
              storeData.data.push({ key: keyArray, value: valueArray });

              // convert the keys and value to readable format
              // const key = String.fromCharCode.apply(
              //   null,
              //   new Uint8Array(cursor.key),
              // );
              // const value = String.fromCharCode.apply(null, cursor.value);
              // storeData.data.push({ key, value });

              cursor.continue();
            } else {
              resolve();
            }
          };

          cursor.onerror = (event) => reject(event.target.error);
        });

        databaseObject.stores.push(storeData);
      }

      allDatabases.push(databaseObject);
      db.close();
    }

    return allDatabases;
  } catch (error) {
    console.error('Error exporting IndexedDB to raw array JSON:', error);
    throw error;
  }
};

export default exportFromIndexDB;
