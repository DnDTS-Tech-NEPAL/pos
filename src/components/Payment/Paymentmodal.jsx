import { useState, useMemo } from "react";
import { X, Check, ArrowRight } from "lucide-react";
import { sendOrderToServer, BillConfirm1 } from "../../api";
import BillConfirm from "./BillConfirm";

const PaymentModal = ({
  total,
  customer,
  orders,
  setShowPaymentMethods,
  setOrders,
  setMessage,
  setCustomer,
  redeemedPoints,
  discountAmount,
  discountType,
}) => {
  const [selectedMethods, setSelectedMethods] = useState([]);
  const [remarks, setRemarks] = useState("");
  const [showBillConfirm, setShowBillConfirm] = useState(false);
  const [orderResponseData, setOrderResponseData] = useState(null);

  const allPaymentMethods = [
    {
      name: "fonePay",
      logo: "/logos/fonepay.png",
      color: "from-[#fa81a5] to-[#ff9a9e]",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-300",
    },
    {
      name: "eSewa",
      logo: "/logos/esewa.png",
      color: "from-[#fa81a5] to-[#ff9a9e]",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-300",
    },
    {
      name: "Khalti",
      logo: "/logos/khalti.png",
      color: "from-[#fa81a5] to-[#ff9a9e]",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-300",
    },
    {
      name: "Cash",
      logo: "/logos/cash.webp",
      color: "from-[#fa81a5] to-[#ff9a9e]",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-300",
    },
    {
      name: "Card",
      logo: "/logos/cash.webp",
      color: "from-[#fa81a5] to-[#ff9a9e]",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-300",
    },
  ];

  const { totalPaid, remainingBalance } = useMemo(() => {
    const paid = selectedMethods.reduce(
      (sum, method) => sum + Number(method.amount || 0),
      0
    );
    const remaining = total - paid;
    return { totalPaid: paid, remainingBalance: remaining };
  }, [selectedMethods, total]);

  const resetModalState = () => {
    setSelectedMethods([]);
    setMessage({ text: "", type: "" });
    setRemarks("");
  };

  const handleModalClose = () => {
    resetModalState();
    setShowPaymentMethods(false);
  };

  const handleMethodToggle = (methodName) => {
    const isSelected = selectedMethods.some((m) => m.name === methodName);
    const methodInfo = allPaymentMethods.find((m) => m.name === methodName);

    if (isSelected) {
      setSelectedMethods((prev) => prev.filter((m) => m.name !== methodName));
    } else {
      const newSelected = [
        ...selectedMethods,
        { ...methodInfo, amount: "0", transactionCode: "" },
      ];
      if (newSelected.length === 1) {
        newSelected[0].amount = total.toFixed(2);
      } else {
        const totalSoFar = newSelected.reduce(
          (sum, m) => sum + Number(m.amount || 0),
          0
        );
        const remaining = total - totalSoFar;
        newSelected[newSelected.length - 1].amount =
          remaining > 0 ? remaining.toFixed(2) : "0";
      }
      setSelectedMethods(newSelected);
    }
  };

  const handleAmountChange = (methodName, value) => {
    if (isNaN(value)) return;
    setSelectedMethods((prev) =>
      prev.map((m) => (m.name === methodName ? { ...m, amount: value } : m))
    );
  };

  const handleTransactionCodeChange = (methodName, value) => {
    setSelectedMethods((prev) =>
      prev.map((m) =>
        m.name === methodName ? { ...m, transactionCode: value } : m
      )
    );
  };

  const handleConfirmPayment = async () => {
    if (remainingBalance > 0.01) {
      setMessage({
        text: "Remaining balance must be 0 or negative (return to customer).",
        type: "error",
      });
      return;
    }

    const paymentDetails = selectedMethods
      .filter((m) => Number(m.amount) > 0)
      .map((m) => ({
        mode_of_payment: m.name,
        amount: Number(m.amount),
        reference_no: m.transactionCode || "",
      }));

    if (paymentDetails.length === 0) {
      setMessage({ text: "Enter valid payment amount.", type: "error" });
      return;
    }

    const cart = orders.map((item) => ({
      item_code: item.itemCode,
      quantity: item.quantity,
      rate: item.price,
    }));

    const payload = {
      customer: customer.phone || customer.id || customer.name || "",
      cart,
      discount_amount: discountType === "flat" ? discountAmount : 0,
      discount_percent: discountType === "percent" ? discountAmount : 0,
      redeemed_points: redeemedPoints,
      payments: paymentDetails,
      remarks,
    };

    setMessage({ text: "Sending order...", type: "info" });

    try {
      const data = await sendOrderToServer(payload);
      setOrderResponseData(data);

      if (data.status?.toLowerCase?.() === "success") {
        setMessage({ text: "Checkout successful!", type: "success" });
        // Show bill confirmation dialog instead of resetting immediately
        setShowBillConfirm(true);
        return;
      }

      setMessage({ text: "Invalid response from server.", type: "error" });
    } catch (error) {
      setMessage({ text: error.message, type: "error" });
    }
  };

  const handleBillConfirmYes = async () => {
    const payload = {
      invoice_name: orderResponseData.invoice_name,
      invoice_type: "Tax Invoice",
    };
    const data = await BillConfirm1(payload);
    console.log(data);
    window.open(data, "_blank");
    // Handle bill printing logic here
    console.log("Printing bill...");

    // Reset all states after bill confirmation
    setCustomer({});
    setOrders([]);
    resetModalState();
    setShowPaymentMethods(false);
    setShowBillConfirm(false);
  };

  const handleBillConfirmNo = async () => {
    // Reset all states without printing
    const payload = {
      invoice_name: orderResponseData.invoice_name,
      invoice_type: "Abbreviated Tax Invoice",
    };
    const data = await BillConfirm1(payload);

    window.open(data, "_blank");

    setCustomer({});
    setOrders([]);
    resetModalState();
    setShowPaymentMethods(false);
    setShowBillConfirm(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-5xl mx-auto max-h-[95vh] overflow-hidden shadow-2xl">
          <div className=" bg-[#15459c] px-4 py-3 text-white relative">
            <div className="relative flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold">Complete Payment</h2>
                <p className="text-pink-100 text-sm">Choose payment method</p>
              </div>
              <button
                onClick={handleModalClose}
                className="p-2 hover:bg-white/10 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-4 overflow-y-auto max-h-[calc(95vh-60px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left - Payment Methods */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-800 mb-2">
                    Payment Methods
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {allPaymentMethods.map((method) => {
                      const isSelected = selectedMethods.some(
                        (m) => m.name === method.name
                      );
                      return (
                        <button
                          key={method.name}
                          onClick={() => handleMethodToggle(method.name)}
                          className={`relative p-3 rounded-lg border text-center text-sm transition-all duration-200 ${
                            isSelected
                              ? `${method.borderColor} ${method.bgColor} shadow-md scale-[1.02]`
                              : "border-gray-200 hover:border-pink-300 hover:shadow-sm"
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r bg-[#15459c] rounded-full flex items-center justify-center shadow-sm">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                          <img
                            src={method.logo}
                            alt={method.name}
                            className="h-6 w-6 mx-auto mb-1 object-contain"
                          />
                          <div>{method.name}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedMethods.length > 0 && (
                  <div>
                    <h3 className="text-base font-semibold text-gray-800 mb-2">
                      Payment Details
                    </h3>
                    <div className="space-y-3">
                      {selectedMethods.map((method) => (
                        <div
                          key={method.name}
                          className="grid grid-cols-12 items-center gap-3 p-2"
                        >
                          <div className="col-span-2 flex items-center gap-2">
                            <img
                              src={method.logo}
                              className="h-5 w-5 object-contain"
                            />
                            <span className="text-sm">{method.name}</span>
                          </div>
                          <div className="col-span-5 relative gap-3">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                              Rs.
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={method.amount}
                              onChange={(e) =>
                                handleAmountChange(method.name, e.target.value)
                              }
                              className="w-full pl-10 pr-2 py-1.5 text-sm border border-[#15459c] rounded-md focus:outline-none focus:ring-2 focus:ring-[#15459c]"
                            />
                          </div>
                          <div className="col-span-5">
                            <input
                              type="text"
                              placeholder="Reference code "
                              value={method.transactionCode || ""}
                              onChange={(e) =>
                                handleTransactionCodeChange(
                                  method.name,
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-1.5 text-sm border border-[#15459c] rounded-md focus:outline-none focus:ring-2 focus:ring-[#15459c]]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right - Summary and Remarks */}
              <div className="space-y-4">
                <div className="bg-white border border-gray-100 rounded-lg p-4">
                  <h3 className="text-base font-semibold text-gray-800 mb-3">
                    Payment Summary
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Amount:</span>
                      <span className="font-semibold">
                        Rs. {total.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount Paid:</span>
                      <span className="text-[#15459c]] font-semibold">
                        Rs. {totalPaid.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      {remainingBalance >= 0 ? (
                        <>
                          <span>Remaining Balance:</span>
                          <span className="text-orange-600 font-semibold">
                            Rs. {remainingBalance.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <>
                          <span>Return to Customer:</span>
                          <span className="text-green-600 font-semibold">
                            Rs. {Math.abs(remainingBalance).toFixed(2)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-700 font-medium block mb-1">
                    Remarks (optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter any remarks..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#15459c]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleModalClose}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmPayment}
                    disabled={totalPaid < total}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center gap-2 ${
                      totalPaid >= total
                        ? " bg-[#15459c] text-white hover:scale-105 transition"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Confirm Payment
                    {totalPaid >= total && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showBillConfirm && (
        <BillConfirm
          onYes={handleBillConfirmYes}
          onNo={handleBillConfirmNo}
          total={total}
        />
      )}
    </>
  );
};

export default PaymentModal;
