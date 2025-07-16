import { useState, useEffect, useRef, useMemo } from "react";
// Assuming getCustomerInvoices is defined elsewhere or mocked for this example
import { getCustomerInvoices } from "../api";

const FALLBACK_IMAGE_URL = "https://edumart.dndts.net/files/shiva.png";

const InvoicePage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState("tax");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7);
  const [invoiceQuery, setInvoiceQuery] = useState("");
  const containerRef = useRef(null);

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
    setCurrentPage(1);
  }, [selectedType, invoiceQuery]);

  useEffect(() => {
    function calculateItemsPerPage() {
      if (!containerRef.current) return;

      const containerHeight = containerRef.current.clientHeight;
      const headerHeight = 40;
      const approxRowHeight = 48;

      const availableHeight = containerHeight - headerHeight;
      let rowsThatFit = Math.floor(availableHeight / approxRowHeight);
      const clampedRows = Math.min(Math.max(rowsThatFit, 5), 25);

      if (clampedRows > 0) {
        setItemsPerPage(clampedRows);
      }
    }

    calculateItemsPerPage();
    window.addEventListener("resize", calculateItemsPerPage);
    return () => window.removeEventListener("resize", calculateItemsPerPage);
  }, [loading]);

  const taxInvoices = useMemo(
    () => invoices.filter((i) => i.custom_invoice_type === "Tax Invoice"),
    [invoices]
  );

  const abbreviatedInvoices = useMemo(
    () => invoices.filter((i) => i.custom_invoice_type === "ABT"),
    [invoices]
  );

  const displayedInvoices = useMemo(() => {
    const list = selectedType === "tax" ? taxInvoices : abbreviatedInvoices;
    const query = invoiceQuery.trim().toLowerCase();
    if (!query) return list;

    return list.filter((inv) => {
      const name = inv.name?.toLowerCase() || "";
      const taxId = inv.tax_id?.toLowerCase() || "";
      const customer = inv.customer?.toLowerCase() || "";
      const fullName = inv.custom_full_name?.toLowerCase() || "";
      return (
        name.includes(query) ||
        taxId.includes(query) ||
        customer.includes(query) ||
        fullName.includes(query)
      );
    });
  }, [invoiceQuery, selectedType, taxInvoices, abbreviatedInvoices]);

  const totalPages = Math.ceil(displayedInvoices.length / itemsPerPage);
  const paginatedInvoices = displayedInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearSearch = () => setInvoiceQuery("");

  const handleCancelInvoice = (invoiceName) => {
    alert(`Cancel clicked for ${invoiceName}`);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white shadow px-4 py-3 border-b border-gray-200 shrink-0">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center justify-between max-w-7xl mx-auto">
          <a
            href="/"
            className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
          >
            <img
              src={FALLBACK_IMAGE_URL}
              alt="POS Logo"
              className="h-12 w-auto object-contain cursor-pointer"
            />
          </a>
          <div className="relative w-full lg:w-[30rem]">
            <input
              type="text"
              placeholder="🔍 Search by invoice name, customer, tax ID, or phone..."
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
              value={invoiceQuery}
              onChange={(e) => setInvoiceQuery(e.target.value)}
            />
            {invoiceQuery && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="Clear search"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-grow bg-gray-50 py-8 px-4 font-sans overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full flex flex-col h-full space-y-6">
          {/* Invoice Type Filters */}
          <div className="flex gap-3 flex-wrap shrink-0">
            <button
              onClick={() => setSelectedType("tax")}
              className={`px-5 py-2 text-sm rounded-md font-medium transition ${
                selectedType === "tax"
                  ? "bg-blue-600 text-white shadow"
                  : "bg-gray-200 text-gray-700 hover:bg-blue-500 hover:text-white"
              }`}
            >
              Tax Invoices
            </button>
            <button
              onClick={() => setSelectedType("abt")}
              className={`px-5 py-2 text-sm rounded-md font-medium transition ${
                selectedType === "abt"
                  ? "bg-green-600 text-white shadow"
                  : "bg-gray-200 text-gray-700 hover:bg-green-500 hover:text-white"
              }`}
            >
              Abbreviated Invoices
            </button>
          </div>

          {/* Loading, Error, and Empty States */}
          {loading ? (
            <div className="flex-grow flex items-center justify-center">
              <p className="text-gray-500 text-sm">Loading invoices...</p>
            </div>
          ) : error ? (
            <div className="flex-grow flex items-center justify-center">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex-grow flex items-center justify-center">
              <p className="text-gray-500 text-sm">No invoices found.</p>
            </div>
          ) : (
            <>
              {/* Invoice Table */}
              <div
                ref={containerRef}
                className="rounded-xl border border-gray-200 shadow-sm overflow-y-auto flex-grow min-h-0"
              >
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
                        <td
                          colSpan={6}
                          className="px-4 py-4 text-center text-gray-500"
                        >
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
                          <td className="px-4 py-3 truncate">
                            {inv.customer || "N/A"}
                          </td>
                          <td className="px-4 py-3 truncate">
                            {inv.tax_id || "N/A"}
                          </td>
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
                                    onClick={() =>
                                      handleCancelInvoice(inv.name)
                                    }
                                    aria-label={`Cancel invoice ${inv.name}`}
                                    className="flex items-center justify-center w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md transition"
                                    type="button"
                                    title="Cancel Invoice"
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
                                  aria-label={`Cancelled invoice ${inv.name}`}
                                  className="w-28 py-2 rounded-md bg-gray-300 text-gray-600 cursor-not-allowed select-none"
                                  type="button"
                                  disabled
                                  title="Cancelled Invoice"
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6 gap-2 bg-white flex-wrap text-sm shrink-0">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                    disabled={currentPage === 1}
                  >
                    Prev
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 rounded transition ${
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
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
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
    </div>
  );
};

export default InvoicePage;
