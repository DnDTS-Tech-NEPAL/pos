"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { getCustomerInvoices } from "../api";
import MessageAlert from "../components/MessageAlert";
import InvoiceTable from "../components/Invoice/InvoiceTable";
import CancelInvoiceModal from "../components/Invoice/CancelInvoiceModal";

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
      const rowsThatFit = Math.floor(availableHeight / approxRowHeight);
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
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-grow bg-gray-50 py-8 px-4 font-sans overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full flex flex-col h-full space-y-6">
          {/* Toggle Buttons */}
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

          {/* Content Area */}
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
              <div ref={containerRef}>
                <InvoiceTable
                  paginatedInvoices={paginatedInvoices}
                  selectedType={selectedType}
                  setSelectedInvoiceToCancel={setSelectedInvoiceToCancel}
                  setShowCancelPopup={setShowCancelPopup}
                />
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

      {/* Cancel Modal */}
      {showCancelPopup && (
        <CancelInvoiceModal
          selectedInvoiceToCancel={selectedInvoiceToCancel}
          cancelRemark={cancelRemark}
          setCancelRemark={setCancelRemark}
          setShowCancelPopup={setShowCancelPopup}
          setSelectedInvoiceToCancel={setSelectedInvoiceToCancel}
          fetchInvoices={fetchInvoices}
          setMessage={setMessage}
        />
      )}
    </div>
  );
};

export default InvoicePage;
