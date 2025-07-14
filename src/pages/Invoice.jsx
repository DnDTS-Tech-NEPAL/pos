import { useState, useEffect } from "react";
import { getCustomerInvoices } from "../api";

const InvoicePage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState("tax");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 7;

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCustomerInvoices();
        setInvoices(data || []);
      } catch (err) {
        setError("Failed to load invoices.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // reset to first page when switching type
  }, [selectedType]);

  const taxInvoices = invoices.filter(
    (i) => i.custom_invoice_type === "Tax Invoice"
  );
  const abbreviatedInvoices = invoices.filter(
    (i) => i.custom_invoice_type === "ABT"
  );

  const displayedInvoices =
    selectedType === "tax" ? taxInvoices : abbreviatedInvoices;

  const totalPages = Math.ceil(displayedInvoices.length / itemsPerPage);
  const paginatedInvoices = displayedInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-inter">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex gap-4 mb-8 overflow-x-auto">
          <button
            onClick={() => setSelectedType("tax")}
            className={`flex-shrink-0 px-6 py-2 rounded-md mt-3 font-semibold cursor-pointer transition whitespace-nowrap ${
              selectedType === "tax"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-blue-500 hover:text-white"
            }`}
          >
            Tax Invoices
          </button>
          <button
            onClick={() => setSelectedType("abt")}
            className={`flex-shrink-0 px-6 py-2 rounded-md mt-3 cursor-pointer font-semibold transition whitespace-nowrap ${
              selectedType === "abt"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-green-500 hover:text-white"
            }`}
          >
            Abbreviated Invoices
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading invoices...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : invoices.length === 0 ? (
          <p className="text-center text-gray-500">No invoices found.</p>
        ) : (
          <>
            <div
              className="overflow-auto rounded-lg border border-gray-200 shadow-sm max-w-full"
              style={{ maxHeight: "70vh" }}
            >
              <table className="min-w-full text-sm text-left text-gray-700 table-fixed">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg w-[40%] min-w-[200px]">
                      Invoice Name
                    </th>
                    <th className="px-4 py-3 w-[30%] min-w-[120px]">
                      Grand Total (Rs.)
                    </th>
                    <th className="px-4 py-3 rounded-tr-lg w-[30%] min-w-[160px]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {paginatedInvoices.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-4 text-center text-gray-500"
                      >
                        {selectedType === "tax"
                          ? "No Tax Invoices found."
                          : "No Abbreviated Invoices found."}
                      </td>
                    </tr>
                  ) : (
                    paginatedInvoices.map((inv, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-4 font-medium truncate">
                          {inv.name}
                        </td>
                        <td className="px-4 py-4">
                          {inv.grand_total.toFixed(2)}
                        </td>
                        <td className="px-4 py-4">
                          <a
                            href={inv.invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center px-3 py-1.5 text-xs font-medium text-white rounded-md transition ${
                              selectedType === "tax"
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "bg-green-600 hover:bg-green-700"
                            }`}
                          >
                            View Invoice
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
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 gap-2 flex-wrap">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                  disabled={currentPage === 1}
                >
                  Prev
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 text-sm rounded ${
                      currentPage === i + 1
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  className="px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InvoicePage;
