import React, { useRef } from "react";

const InvoiceModal = ({ invoices, onClose }) => {
  const modalRef = useRef();

  // Close if user clicks outside the modal content
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-auto"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-6 relative"
      >
        <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 text-center">
          Past Invoices
        </h2>

        {invoices.length === 0 ? (
          <p className="text-gray-500 text-center">No invoices found.</p>
        ) : (
          <ul className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {invoices.map((inv, index) => (
             
              <li
                key={index}
                className="p-4 border border-gray-200 rounded-xl shadow-sm bg-gray-50 space-y-3"
              >
                <p className="font-bold">
                    {inv.name}
                </p>
                <p className="text-gray-700">
                  <strong className="text-gray-800">Grand Total:</strong> Rs.
                  {inv.grand_total}
                </p>
                <div className="flex flex-col gap-2">
                  <a
                    href={inv.tax_invoice_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm text-center px-4 py-2 rounded-lg transition"
                  >
                    View Tax Invoice
                  </a>
                  {inv.abbreviated_invoice_url && (
                    <a
                      href={inv.abbreviated_invoice_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 hover:bg-green-700 text-white text-sm text-center px-4 py-2 rounded-lg transition"
                    >
                      View Abbreviated Invoice
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="pt-4 flex justify-center">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
