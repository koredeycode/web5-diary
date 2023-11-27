import React, { useState } from 'react';

const DiaryEntry = ({ entry, onDelete, onEdit }) => {
  const [showFullText, setShowFullText] = useState(entry.text.length <= 100);

  const toggleFullText = () => {
    setShowFullText(!showFullText);
  };

  return (
    <div className="mb-6 border p-4 bg-white shadow-lg ">
      <div className="mb-4">
        <p className="text-gray-800">
          {showFullText ? entry.text : `${entry.text.substring(0, 100)}...`}
        </p>
        {entry.text.length > 100 && (
          <button
            onClick={toggleFullText}
            className="text-blue-500 underline cursor-pointer focus:outline-none"
          >
            {showFullText ? 'Show Less' : 'Show More'}
          </button>
        )}
      </div>

      <div className="flex justify-between items-center">
        {entry.timestamp && (
          <span className="flex-1 text-gray-500 text-sm">
            {entry.timestamp}
          </span>
        )}

        {entry.tags && (
          <div className="flex-1">
            {entry.tags.map((tag, index) => (
              <span key={index} className="text-blue-500 mr-2">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-around">
        <button
          type="button"
          onClick={() => onEdit(entry)}
          className="bg-green-500 text-white py-1 px-2 rounded-md hover:bg-green-600 focus:outline-none focus:border-green-700 focus:ring focus:ring-green-200"
        >
          Update
        </button>
        <button
          type="button"
          onClick={() => onDelete(entry.recordId)}
          className="bg-red-500 text-white py-1 px-2 rounded-md hover:bg-red-600 focus:outline-none focus:border-red-700 focus:ring focus:ring-red-200"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default DiaryEntry;
