import React from "react";

const BilConfirm = ({ onYes, onNo }) => {
  return (
    <div className="p-4 rounded-xl bg-white shadow-md border border-gray-100 max-w-sm mx-auto text-center space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">
        Do you want to print the bill?
      </h3>
      <div className="flex justify-center gap-4">
        <button
          onClick={onYes}
          className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg shadow"
        >
          Yes
        </button>
        <button
          onClick={onNo}
          className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg shadow"
        >
          No
        </button>
      </div>
    </div>
  );
};

export default BilConfirm;
