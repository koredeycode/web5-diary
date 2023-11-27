import React, { useEffect, useState } from 'react';

const DiaryForm = ({
  addEntry,
  isUpdate,
  onUpdate,
  cancelUpdate,
  dataToBeUpdated,
}) => {
  const [entryText, setEntryText] = useState('');
  const [entryTags, setEntryTags] = useState([]);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (isUpdate) {
      setEntryText(dataToBeUpdated.text);
      setEntryTags(dataToBeUpdated.tags);
    } else {
      setEntryText('');
      setEntryTags([]);
    }
  }, [dataToBeUpdated]);

  const handleTagChange = (e) => {
    setNewTag(e.target.value);
  };

  const handleAddTag = () => {
    if (newTag.trim() !== '') {
      setEntryTags([...entryTags, newTag.trim().toLowerCase()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (index) => {
    const updatedTags = [...entryTags];
    updatedTags.splice(index, 1);
    setEntryTags(updatedTags);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isUpdate) {
      onUpdate(dataToBeUpdated.recordId, {
        text: entryText,
        tags: entryTags,
        timestamp: dataToBeUpdated.timestamp,
      });
    } else {
      // Create the diary entry object
      const diaryEntry = {
        text: entryText,
        tags: entryTags,
      };

      // Call the addEntry function to add the entry
      addEntry(diaryEntry);
    }

    // Clear the form fields
    setEntryText('');
    setEntryTags([]);
    setNewTag('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-8 p-4 border rounded-lg shadow-lg bg-white"
    >
      <div className="mb-4">
        <label
          htmlFor="entryText"
          className="block text-sm font-medium text-gray-700"
        >
          Reflections:
        </label>
        <textarea
          id="entryText"
          value={entryText}
          onChange={(e) => setEntryText(e.target.value)}
          placeholder="Write your reflections..."
          className="mt-1 p-2 block w-full border rounded-md shadow-sm focus:outline-none focus:border-blue-500"
          rows="4"
          required
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="entryTags"
          className="block text-sm font-medium text-gray-700"
        >
          Tags:
        </label>
        <div className="flex items-center">
          <input
            id="entryTags"
            type="text"
            value={newTag}
            onChange={handleTagChange}
            placeholder="Add tags..."
            className="mt-1 p-2 flex-1 border rounded-md shadow-sm focus:outline-none focus:border-blue-500"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="ml-2 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:border-blue-700 focus:ring focus:ring-blue-200"
          >
            Add
          </button>
        </div>
        {entryTags.length > 0 && (
          <div className="mt-2">
            {entryTags.map((tag, index) => (
              <span key={index} className="text-blue-500 mr-2">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(index)}
                  className="ml-1 text-red-500 focus:outline-none"
                >
                  x
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:border-blue-700 focus:ring focus:ring-blue-200"
      >
        {isUpdate ? 'Update' : 'Create'}
      </button>
      {isUpdate && (
        <button
          type="button"
          onClick={cancelUpdate}
          className="mt-2 w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:border-gray-700 focus:ring focus:ring-gray-200"
        >
          Cancel
        </button>
      )}
    </form>
  );
};

export default DiaryForm;
