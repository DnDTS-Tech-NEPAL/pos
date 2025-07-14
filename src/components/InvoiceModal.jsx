import React, { useRef } from "react";

const InvoiceModal = ({ invoices, onClose }) => {
  const modalRef = useRef();

  // Close if user clicks outside the modal content
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  // Filter invoices
  const taxInvoices = invoices.filter(
    (inv) => inv.custom_invoice_type === "Tax Invoice"
  );
  const abbreviatedInvoices = invoices.filter(
    (inv) => inv.custom_invoice_type === "ABT"
  );

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto font-inter min-h-screen"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl p-6 space-y-8 relative max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-3xl font-bold text-gray-800 border-b pb-4 text-center">
          Past Invoices
        </h2>

        {/* Side-by-side layout */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Tax Invoices Section */}
          <div className="w-full md:w-1/2 space-y-4">
            <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 text-center">
              Tax Invoices
            </h3>
            {taxInvoices.length === 0 ? (
              <p className="text-gray-500 text-center">
                No Tax Invoices found.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full text-sm text-left text-gray-700 divide-y divide-gray-200">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Invoice Name</th>
                      <th className="px-4 py-3">Total (Rs.)</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {taxInvoices.map((inv, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-medium">{inv.name}</td>
                        <td className="px-4 py-3">
                          {inv.grand_total.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <a
                            href={inv.invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
                          >
                            View
                            <svg
                              className="ml-1"
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              viewBox="0 0 24 24"
                            >
                              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Abbreviated Invoices Section */}
          <div className="w-full md:w-1/2 space-y-4">
            <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 text-center">
              Abbreviated Invoices
            </h3>
            {abbreviatedInvoices.length === 0 ? (
              <p className="text-gray-500 text-center">
                No Abbreviated Invoices found.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full text-sm text-left text-gray-700 divide-y divide-gray-200">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Invoice Name</th>
                      <th className="px-4 py-3">Total (Rs.)</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {abbreviatedInvoices.map((inv, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-medium">{inv.name}</td>
                        <td className="px-4 py-3">
                          {inv.grand_total.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <a
                            href={inv.invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition"
                          >
                            View
                            <svg
                              className="ml-1"
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              viewBox="0 0 24 24"
                            >
                              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-6 flex justify-center">
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-800 text-white px-8 py-3 rounded-lg shadow transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
