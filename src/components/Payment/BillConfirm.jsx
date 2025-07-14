import { useRef } from "react";
const BillConfirm = ({ onSelect, onCancel, total }) => {
  const modalRef = useRef();

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onCancel(); // Separate cancel logic
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-60 p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="relative p-6 rounded-xl bg-white shadow-md border border-gray-100 max-w-sm mx-auto text-center space-y-4"
      >
        {/* Close (×) Button */}
        <button
          onClick={onCancel}
          className="absolute top-2 right-2 text-gray-400 cursor-pointer hover:text-gray-700 text-xl"
        >
          &times;
        </button>

        <h3 className="text-lg font-semibold text-gray-800">
          Choose the Bill Format
        </h3>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => onSelect("Tax Invoice")}
            className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg shadow"
          >
            Tax Invoice
          </button>
          {total <= 10000 && (
            <button
              onClick={() => onSelect("ABT")}
              className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg shadow"
            >
              Abbreviated Tax Invoice
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillConfirm;
