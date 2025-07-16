import { CancelInvoice } from "../../api"; // Import the CancelInvoice function from ../api";

const CancelInvoiceModal = ({
  selectedInvoiceToCancel,
  cancelRemark,
  setCancelRemark,
  setShowCancelPopup,
  setSelectedInvoiceToCancel,
  fetchInvoices,
  setMessage,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Cancel Invoice</h2>
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
  );
};

export default CancelInvoiceModal;
