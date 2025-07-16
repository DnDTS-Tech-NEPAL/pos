"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { getCustomerInvoices, CancelInvoice } from "../api";
import MessageAlert from "../components/MessageAlert";

const FALLBACK_IMAGE_URL = "https://edumart.dndts.net/files/shiva.png";

const InvoicePage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState("tax");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7);
  const [invoiceQuery, setInvoiceQuery] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [cancelRemark, setCancelRemark] = useState("");
  const [selectedInvoiceToCancel, setSelectedInvoiceToCancel] = useState(null);

  const containerRef = useRef(null);

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

  useEffect(() => {
    fetchInvoices();
  }, [showCancelPopup]);

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

  useEffect(() => {
    if (!message.text) return;
    const timeout = setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    return () => clearTimeout(timeout);
  }, [message]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <MessageAlert message={message} />

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
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <line
                    x1="18"
                    y1="6"
                    x2="6"
                    y2="18"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <line
                    x1="6"
                    y1="6"
                    x2="18"
                    y2="18"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-grow bg-gray-50 py-8 px-4 font-sans overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full flex flex-col h-full space-y-6">
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

      {/* Cancel Popup Modal */}
      {showCancelPopup && (
        <div className="fixed inset-0 z-50 bg-black/50 bg-opacity-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Cancel Invoice
            </h2>
            <p className="text-sm text-gray-600">
              Are you sure you want to cancel invoice{" "}
              <strong>{selectedInvoiceToCancel}</strong>?
            </p>
            <textarea
              placeholder="Enter cancellation remark..."
              value={cancelRemark}
              onChange={(e) => setCancelRemark(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              rows={3}
              required
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowCancelPopup(false);
                  setCancelRemark("");
                  setSelectedInvoiceToCancel(null);
                }}
                className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                disabled={!cancelRemark.trim()}
                onClick={async () => {
                  try {
                    const data = await CancelInvoice({
                      invoice_name: selectedInvoiceToCancel,
                      remarks: cancelRemark,
                    });

                    if (data.status === "success") {
                      setMessage({ text: data.message, type: "success" });
                      await fetchInvoices();
                    } else {
                      console.log(data.status);
                      setMessage({
                        text: "Cancellation failed.",
                        type: "error",
                      });
                    }
                  } catch {
                    setMessage({
                      text: "Failed to cancel invoice.",
                      type: "error",
                    });
                  } finally {
                    setShowCancelPopup(false);
                    setCancelRemark("");
                    setSelectedInvoiceToCancel(null);
                  }
                }}
                className="px-4 py-2 text-sm rounded bg-red-600 hover:bg-red-700 text-white"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicePage;
