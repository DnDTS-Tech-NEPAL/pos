// components/InvoiceTable.js
"use client";
import React from "react";

const InvoiceTable = ({
  paginatedInvoices,
  selectedType,
  setSelectedInvoiceToCancel,
  setShowCancelPopup,
}) => {
  return (
    <div className="rounded-xl border border-gray-200 shadow-sm overflow-y-auto flex-grow min-h-0">
      <table className="min-w-full table-auto text-sm text-left text-gray-700">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs sticky top-0 z-10">
          <tr>
            <th className="px-4 py-3 min-w-[160px]">Invoice</th>
            <th className="px-4 py-3 min-w-[140px]">Customer</th>
            <th className="px-4 py-3 min-w-[120px]">Phone</th>
            <th className="px-4 py-3 min-w-[120px]">Tax ID</th>
            <th className="px-4 py-3 min-w-[100px]">Total</th>
            <th className="px-4 py-3 min-w-[200px]">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {paginatedInvoices.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
                No matching invoices found.
              </td>
            </tr>
          ) : (
            paginatedInvoices.map((inv, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-medium">{inv.name}</td>
                <td className="px-4 py-3 truncate">
                  {inv.custom_full_name || "N/A"}
                </td>
                <td className="px-4 py-3 truncate">{inv.customer || "N/A"}</td>
                <td className="px-4 py-3 truncate">{inv.tax_id || "N/A"}</td>
                <td className="px-4 py-3">
                  {inv.grand_total?.toFixed(2) || "0.00"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-4 flex-wrap">
                    {inv.invoice_url ? (
                      <>
                        <a
                          href={inv.invoice_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1 px-4 py-2 rounded-md text-sm font-semibold text-white shadow-sm transition ${
                            selectedType === "tax"
                              ? "bg-blue-600 hover:bg-blue-700"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          View Invoice
                        </a>
                        <button
                          onClick={() => {
                            setSelectedInvoiceToCancel(inv.name);
                            setShowCancelPopup(true);
                          }}
                          className="flex items-center justify-center w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v1h6V4a1 1 0 00-1-1m-4 0h4"
                            />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <button
                        className="w-28 py-2 rounded-md bg-red-600 text-gray-50 cursor-not-allowed"
                        disabled
                      >
                        Cancelled
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceTable;
