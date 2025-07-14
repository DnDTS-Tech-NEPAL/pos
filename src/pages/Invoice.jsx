import { useState, useEffect, useRef, useMemo } from "react";
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

  // --- Data Fetching Effect ---
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

  // --- Pagination Reset Effect (when filters or search change) ---
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedType, invoiceQuery]);

  // --- Dynamic Items Per Page Calculation Effect ---
  useEffect(() => {
    function calculateItemsPerPage() {
      // Ensure the container is available and rendered
      if (!containerRef.current) return;

      const containerHeight = containerRef.current.clientHeight;
      const headerHeight = 40;
      const approxRowHeight = 48;

      const availableHeight = containerHeight - headerHeight;

      // Calculate how many rows fit, ensuring a minimum of 5 and a maximum of 25.
      let rowsThatFit = Math.floor(availableHeight / approxRowHeight);
      const clampedRows = Math.min(Math.max(rowsThatFit, 5), 25);

      if (clampedRows > 0) {
        setItemsPerPage(clampedRows);
      }
    }

    // Run calculation on mount, window resize, and crucially, when 'loading' finishes.
    calculateItemsPerPage();
    window.addEventListener("resize", calculateItemsPerPage);

    return () => window.removeEventListener("resize", calculateItemsPerPage);
  }, [loading]); // 'loading' dependency handles the initial load timing issue

  // --- Memoized Invoice Lists and Filtering ---
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

  // --- Pagination Logic --- (Unchanged)
  const totalPages = Math.ceil(displayedInvoices.length / itemsPerPage);
  const paginatedInvoices = displayedInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Function to clear the search query
  const clearSearch = () => {
    setInvoiceQuery("");
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Navbar (Header) */}
      <div className="sticky top-0 z-50 bg-white shadow px-4 py-3 border-b border-gray-200 shrink-0">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center justify-between max-w-7xl mx-auto">
          <img
            src={FALLBACK_IMAGE_URL}
            alt="POS Logo"
            className="h-12 w-auto object-contain"
          />

          {/* Search Bar Container */}
          <div className="relative w-full lg:w-[30rem]">
            <input
              type="text"
              placeholder="🔍 Search by invoice name, customer, tax ID, or phone..."
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
              value={invoiceQuery}
              onChange={(e) => setInvoiceQuery(e.target.value)}
            />

            {/* Clear Search Button (Cross Icon) */}
            {invoiceQuery && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="Clear search"
              >
                {/* SVG for a simple 'X' icon */}
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

      {/* Page Content */}
      <div className="flex flex-col flex-grow bg-gray-50 py-8 px-4 font-sans overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full flex flex-col h-full space-y-6">
          {/* Filter Tabs */}
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

          {/* Table Container and Content */}
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
              {/* This is the container we measure for dynamic rows */}
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
                      <th className="px-4 py-3 min-w-[140px]">Action</th>
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
                            <a
                              href={inv.invoice_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium text-white ${
                                selectedType === "tax"
                                  ? "bg-blue-600 hover:bg-blue-700"
                                  : "bg-green-600 hover:bg-green-700"
                              } transition`}
                            >
                              View Invoice
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
