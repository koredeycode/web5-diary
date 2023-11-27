export const queryLocalProtocol = async (web5) => {
  return await web5.dwn.protocols.query({
    message: {
      filter: {
        protocol: 'https://koredeycode.tech/reflectify',
      },
    },
  });
};

export const queryRemoteProtocol = async (web5, did) => {
  return await web5.dwn.protocols.query({
    from: did,
    message: {
      filter: {
        protocol: 'https://koredeycode.tech/reflectify',
      },
    },
  });
};

export const installLocalProtocol = async (web5, protocolDefinition) => {
  return await web5.dwn.protocols.configure({
    message: {
      definition: protocolDefinition,
    },
  });
};

export const installRemoteProtocol = async (web5, did, protocolDefinition) => {
  const { protocol } = await web5.dwn.protocols.configure({
    message: {
      definition: protocolDefinition,
    },
  });
  return await protocol.send(did);
};

export const defineNewProtocol = () => {
  return {
    protocol: 'https://koredeycode.tech/reflectify',
    published: true,
    types: {
      diaryEntry: {
        schema: 'https://schema.org/DiaryEntry',
        dataFormats: ['application/json'],
      },
    },
    structure: {
      diaryEntry: {
        $actions: [
          { who: 'anyone', can: 'write' },
          { who: 'author', of: 'diaryEntry', can: 'read' },
        ],
      },
    },
  };
};

export const configureProtocol = async (web5, did) => {
  console.log('this is where we configure our protocol');
  const protocolDefinition = defineNewProtocol();
  const protocolUrl = protocolDefinition.protocol;

  const { protocols: localProtocols, status: localProtocolStatus } =
    await queryLocalProtocol(web5, protocolUrl);
  if (localProtocolStatus.code !== 200 || localProtocols.length === 0) {
    const result = await installLocalProtocol(web5, protocolDefinition);
    console.log({ result });
    console.log('Protocol installed locally');
  }

  const { protocols: remoteProtocols, status: remoteProtocolStatus } =
    await queryRemoteProtocol(web5, did, protocolUrl);
  if (remoteProtocolStatus.code !== 200 || remoteProtocols.length === 0) {
    console.log('installing new protocol');
    const result = await installRemoteProtocol(web5, did, protocolDefinition);
    console.log({ result });
    console.log('Protocol installed remotely');
  }
};

export const constructDiaryEntry = (diaryEntry, did) => {
  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString();

  return {
    ...diaryEntry,
    sender: did,
    timestamp: `${currentDate} ${currentTime}`,
  };
};

export const writeToDwnDiaryEntry = async (web5, diaryEntryObj, did) => {
  try {
    const protocol = defineNewProtocol();
    const { record, status } = await web5.dwn.records.write({
      data: diaryEntryObj,
      message: {
        protocol: protocol.protocol,
        protocolPath: 'diaryEntry',
        schema: protocol.types.diaryEntry.schema,
        recipient: did,
        published: true,
        dataFormat: 'application/json',
      },
    });
    if (status.code == 200) {
      return { ...diaryEntryObj, recordId: record.id };
    }
    return record;
  } catch (error) {
    console.error('Error writing secret message to DWN', error);
  }
};

export const fetchRecords = async (web5, did) => {
  console.log('fetching records ....');
  try {
    const response = await web5.dwn.records.query({
      from: did,
      message: {
        filter: {
          protocol: 'https://koredeycode.tech/reflectify',
          schema: 'https://schema.org/DiaryEntry',
          dataFormat: 'application/json',
        },
        dateSort: 'createdDescending',
      },
    });
    console.log('got this response', response);
    if (response.status.code == 200 && response.records.length > 0) {
      const diaryEntries = await Promise.all(
        response.records.map(async (record) => {
          const data = await record.data.json();
          return { ...data, recordId: record.id };
        }),
      );
      return diaryEntries;
    } else {
      console.error('Error fetching record:', response.status);
      return [];
    }
  } catch (error) {
    console.error('Error in fetchRecord:', error);
  }
};

export const fetchRecord = async (web5, recordId) => {
  try {
    const { record } = await web5.dwn.records.read({
      message: { filter: { recordId } },
    });
    return record;
  } catch (error) {
    console.error('Error in fetchRecord:', error);
    return null;
  }
};

export const updateRecord = async (web5, recordId, newRecord) => {
  try {
    const record = await fetchRecord(web5, recordId);
    const response = await record.update({ data: newRecord });
    console.log(response);
    return record;
  } catch (error) {
    console.error('error in updateRecord');
  }
};

export const deleteRecord = async (web5, recordId, did) => {
  try {
    const deleteResult = await web5.dwn.records.delete({
      from: did,
      message: { recordId },
    });
    // const deleteResult = await record.delete();
    if (deleteResult.status.code == 202) {
      console.log('Record deleted successfully');
    } else {
      console.error('Error deleting record:', deleteResult.status);
    }
  } catch (error) {
    console.error('Error in deleteRecord:', error);
  }
};
