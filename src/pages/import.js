import { useState } from 'react';
import { useRouter } from 'next/router';

import importToIndexDB from '../lib/import';

const ImportPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [importedData, setImportedData] = useState(null);
  const [error, setError] = useState(false);

  const handleFileUpload = async (event) => {
    try {
      console.log('handling file upload');

      const file = event.target.files[0];

      const data = await parseJsonFile(file);
      setImportedData(data);
      console.log(data);
      setError(false);
    } catch (error) {
      setError(true);
    }
  };

  const importData = async () => {
    try {
      setLoading(true);
      await importToIndexDB(importedData);
      router.push('/dashboard');
    } catch (error) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const parseJsonFile = async (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = (event) => resolve(JSON.parse(event.target.result));
      fileReader.onerror = (error) => reject(error);
      fileReader.readAsText(file);
    });
  };

  return (
    <div className="h-screen w-screen  bg-blue-50 flex flex-col justify-center items-center gap-4">
      <h1 className="text-3xl font-bold ">Import Data</h1>
      <p className="">Carry your reflections along with you !!</p>
      <input
        className=""
        type="file"
        onChange={handleFileUpload}
        accept=".json"
      />
      <button
        className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:border-blue-700 focus:ring focus:ring-blue-200"
        onClick={importData}
      >
        Import
      </button>
      {loading && <p className="">Importing your data...</p>}
      {error && <p className="text-red-500">Error importing your data...</p>}
    </div>
  );
};

export default ImportPage;
