import { useState, useEffect } from 'react';
import { Web5 } from '@web5/api';

import exportFromIndexDB from '../lib/export';
import {
  configureProtocol,
  constructDiaryEntry,
  writeToDwnDiaryEntry,
  fetchRecords,
  updateRecord,
  deleteRecord,
} from '../lib/utils';

import DiaryForm from '../components/DiaryForm';
import DiaryEntry from '../components/DiaryEntry';

const DashboardPage = () => {
  const [did, setDID] = useState(null);
  const [agentDid, setAgentDid] = useState(null);
  const [web5, setWeb5] = useState(null);
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    (async () => {
      await connectWeb5();
    })();
  }, []);

  const connectWeb5 = async () => {
    console.log('Connecting to Web5...');
    const { web5, did } = await Web5.connect();

    setDID(did);
    setWeb5(web5);
    setAgentDid(web5.agent.agentDid);
    if (web5 && did) {
      await configureProtocol(web5, did);
    }
    const { protocols } = await web5.dwn.protocols.query({
      message: {
        filter: {
          protocol: 'https://koredeycode.tech/reflectify',
        },
      },
    });
    console.log('queried: ', protocols);
    protocols.forEach((protocol) => {
      console.log(protocol.toJSON());
    });
    const records = await fetchRecords(web5, did);
    console.log('records: ', records);
    setDiaryEntries(records);
  };

  const copyDid = () => {
    navigator.clipboard.writeText(did);
  };

  const copyAgentDid = () => {
    navigator.clipboard.writeText(agentDid);
  };

  const exportData = async () => {
    try {
      const data = await exportFromIndexDB();
      console.log(data);
      const jsonString = JSON.stringify(data, null, 2);

      const blob = new Blob([jsonString], { type: 'application/json' });

      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);

      a.download = 'web5-export.json';
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const truncateDid = (didStr, prefixLength = 15, suffixLength = 5) => {
    const prefix = didStr.substring(0, prefixLength);
    const suffix = didStr.substring(didStr.length - suffixLength);
    return `${prefix}.....${suffix}`;
  };
  const handleFormSubmit = async (_data) => {
    // console.log('Record: ', constructDiaryEntry(_data, did));
    const newRecord = await writeToDwnDiaryEntry(
      web5,
      constructDiaryEntry(_data),
      did,
    );
    const newData = {
      ...(await newRecord.data.json()),
      recordId: newRecord.id,
    };
    console.log('new record', newData);
    setDiaryEntries([newData, ...diaryEntries]);
  };

  const handleEdit = async (recordData) => {
    setFormData(recordData);
    setIsUpdate(true);
  };

  const handleDelete = async (recordId) => {
    await deleteRecord(web5, recordId, did);
    setDiaryEntries(
      diaryEntries.filter((entry) => entry.recordId !== recordId),
    );
  };

  const handleUpdate = async (recordId, newRecord) => {
    const updatedRecord = await updateRecord(web5, recordId, newRecord);
    const updatedRecordData = {
      ...(await updatedRecord.data.json()),
      recordId,
    };
    setDiaryEntries(
      diaryEntries.map((entry) =>
        entry.recordId === recordId ? updatedRecordData : entry,
      ),
    );
    setFormData(null);
    setIsUpdate(false);
  };

  if (!web5 || !did) {
    return (
      <div className="h-screen w-full flex justify-center items-center bg-blue-50 p-2">
        <div className="text-2xl">Setting up dashboard....</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <nav className="w-full text-white p-2 bg-blue-500 flex justify-between items-center">
        <h3 className="text-3xl font-bold">Reflectify</h3>
        <div className="flex flex-col gap-2 md:flex-row md:gap-4">
          <div
            className="flex flex-col gap-1 cursor-copy relative group"
            onClick={copyDid}
          >
            <div className="font-bold text-md">DID</div>
            <div>{truncateDid(did)}</div>
            <div className="hidden group-hover:block p-2 bg-black text-white absolute top-[100%] -right-0 max-w-[300px] z-10">
              <p style={{ 'word-wrap': 'break-word' }}>{did}</p>
            </div>
          </div>
          <div
            className="flex flex-col gap-1 cursor-copy relative group"
            onClick={copyAgentDid}
          >
            <div className="font-bold text-md">AGENTDID</div>
            <div>{truncateDid(agentDid)}</div>
            <div className="hidden group-hover:block p-2 bg-black text-white absolute top-[100%] -right-0 max-w-[300px] z-10">
              <p style={{ 'word-wrap': 'break-word' }}>{agentDid}</p>
            </div>
          </div>
        </div>
      </nav>
      <div className="h-screen flex flex-col md:flex-row  bg-blue-50">
        <div className="w-full  p-2 ">
          <DiaryForm
            addEntry={handleFormSubmit}
            isUpdate={isUpdate}
            onUpdate={handleUpdate}
            cancelUpdate={() => {
              setFormData(null);
              setIsUpdate(false);
            }}
            dataToBeUpdated={formData}
          />
        </div>
        <div className="w-full p-2">
          <div className="flex justify-end mb-2">
            <button
              className=" bg-blue-500 text-white py-1 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:border-blue-700 focus:ring focus:ring-blue-200"
              onClick={exportData}
            >
              Export Data
            </button>
          </div>
          {diaryEntries.length === 0 ? (
            <p>No reflections yet. Start by adding one!</p>
          ) : (
            diaryEntries.map((entry, index) => (
              <DiaryEntry
                key={index}
                entry={entry}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
