import { useState } from 'react';
import { useRouter } from 'next/router';

const IndexPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleConnectClick = () => {
    setLoading(true);

    router.push('/dashboard');
  };

  const handleImportClick = () => {
    // Redirect to the import page
    router.push('/import');
  };

  return (
    <div className="h-screen w-screen bg-blue-50 flex flex-col justify-center items-center gap-4">
      <h1 className="text-5xl font-bold ">Reflectify</h1>
      <p className="text-xl">Reflect your thoughts</p>
      <div>
        <button
          className="bg-blue-500 text-white text-lg m-2 py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:border-blue-700 focus:ring focus:ring-blue-200"
          onClick={handleConnectClick}
        >
          Connect
        </button>
        <button
          className="bg-blue-500 text-white text-lg m-2 py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:border-blue-700 focus:ring focus:ring-blue-200"
          onClick={handleImportClick}
        >
          Import
        </button>
      </div>
    </div>
  );
};

export default IndexPage;
