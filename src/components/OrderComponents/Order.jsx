import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faRupee,
  faPercent,
} from "@fortawesome/free-solid-svg-icons";
import OrderItem from "./OrderItem";

const Order = ({
  orders,
  setOrders,
  handleSendOrder,
  setTotal,
  customer = {},
  redeemedPoints,
  setRedeemedPoints,
  discount,
  setDiscount,
  discountType,
  setDiscountType,
}) => {
  const [isDiscountInputFocused, setIsDiscountInputFocused] = useState(false);

  const handleClearCart = () => {
    setOrders([]);
  };

  const sanitizeDiscount = (value, type, subtotal) => {
    if (type === "percent") {
      return value > 100 ? 100 : value < 0 ? 0 : value;
    } else {
      return value > subtotal ? subtotal : value < 0 ? 0 : value;
    }
  };

  const subtotal = orders.reduce(
    (sum, item) => sum + item.price * (item.quantity || 0),
    0
  );

  const manualDiscountValue =
    discountType === "percent" ? (discount / 100) * subtotal : discount;

  const redeemDiscount =
    Math.min(redeemedPoints, customer.total_points || 0) *
    (customer.conversion_factor || 0);

  const totalDiscount = manualDiscountValue + redeemDiscount;

  const discountRatio = subtotal > 0 ? totalDiscount / subtotal : 0;

  let afterDiscount = 0;

  orders.forEach((item) => {
    const qty = item.quantity || 0;
    const itemSubtotal = item.price * qty;
    const discountedSubtotal = itemSubtotal * (1 - discountRatio);
    afterDiscount += discountedSubtotal;
  });

  const finalTotal = afterDiscount;

  useEffect(() => {
    setTotal(parseFloat(finalTotal.toFixed(2)));
  }, [finalTotal, setTotal]);

  useEffect(() => {
    setDiscount((currentDiscount) =>
      sanitizeDiscount(currentDiscount, discountType, subtotal)
    );
  }, [discountType, subtotal, setDiscount]);

  const handleDiscountChange = (e) => {
    const cleaned = e.target.value.replace(/[^\d.]/g, "");
    const dotCount = (cleaned.match(/\./g) || []).length;
    if (dotCount > 1) return;

    const val = parseFloat(cleaned) || 0;
    setDiscount(sanitizeDiscount(val, discountType, subtotal));
  };

  const handleDiscountTypeChange = (type) => {
    setDiscountType(type);
    setDiscount((currentDiscount) =>
      sanitizeDiscount(currentDiscount, type, subtotal)
    );
  };

  const handleRedeemedPointsChange = (e) => {
    const val = parseInt(e.target.value.replace(/\D/g, ""), 10);
    setRedeemedPoints(
      isNaN(val) ? 0 : Math.min(val, customer.total_points || 0)
    );
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto p-4 max-h-[55vh]">
        <div className="space-y-3 overflow-auto">
          {orders.map((order) => (
            <OrderItem
              key={order.orderId}
              order={order}
              setOrders={setOrders}
            />
          ))}
        </div>

        {orders.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 py-8">
            <FontAwesomeIcon icon={faShoppingCart} className="text-4xl mb-3" />
            <p className="text-lg">Your cart is empty</p>
            <p className="text-sm">Add items to start your order</p>
          </div>
        )}
      </div>

      <div className="p-3 sticky bottom-0 bg-white border-t border-gray-200">
        <div className="space-y-0">
          <div className="flex justify-between items-center pb-2">
            <span className="font-bold">Subtotal</span>
            <span className="font-medium text-[#d1161b]">
              Rs. {subtotal.toFixed(2)}
            </span>
          </div>

          {/* Discount and Redeem Points */}
          <div className="flex flex-col border-t border-gray-100 pt-2">
            <div className="flex gap-2 mb-2">
              {/* Discount Section */}
              <div className="flex items-center gap-2 flex-1">
                <label className="font-bold">Discount</label>
                <div className="flex rounded-lg overflow-hidden border border-gray-200">
                  <button
                    onClick={() => handleDiscountTypeChange("flat")}
                    className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                      discountType === "flat"
                        ? "bg-[#d1161b] text-white"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Rs
                  </button>
                  <button
                    onClick={() => handleDiscountTypeChange("percent")}
                    className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                      discountType === "percent"
                        ? "bg-[#d1161b] text-white"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    %
                  </button>
                </div>
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={discount}
                    onChange={handleDiscountChange}
                    onFocus={() => setIsDiscountInputFocused(true)}
                    onBlur={() => setIsDiscountInputFocused(false)}
                    placeholder="Add discount"
                    className={`w-full text-sm border border-[#d1161b] rounded-lg px-3 py-1.5 pr-8    [&::-webkit-outer-spin-button]:appearance-none 
                                                  [&::-webkit-outer-spin-button]:m-0 
                                                  [&::-webkit-inner-spin-button]:appearance-none 
                                                    [&::-webkit-inner-spin-button]:m-0focus:outline-none focus:ring-1 ${
                                                      isDiscountInputFocused
                                                        ? "focus:ring-[#d1161b] focus:border-[#d1161b]"
                                                        : "focus:ring-gray-300 focus:border-gray-300"
                                                    }`}
                  />
                  <FontAwesomeIcon
                    icon={discountType === "flat" ? faRupee : faPercent}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>

              {/* Redeem Points */}
              <div className="flex items-center justify-end gap-2 w-[45%]">
                <label className="font-bold whitespace-nowrap">
                  Redeem Points
                </label>
                <input
                  type="text"
                  value={redeemedPoints}
                  onChange={handleRedeemedPointsChange}
                  placeholder={`Max: ${customer.total_points || 0}`}
                  className="w-full text-sm  border border-[#d1161b] rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:ring-1 focus:ring-[#d1161b] focus:border-[#d1161b]"
                />
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center font-semibold border-t border-gray-100 pt-2">
            <span className="font-bold">Total</span>
            <span className="text-[#d1161b]">Rs. {finalTotal.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={handleClearCart}
              className="w-full px-3 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer font-medium text-sm"
            >
              Clear Cart
            </button>
            <button
              onClick={handleSendOrder}
              className="w-full px-3 py-2 bg-[#15459c] text-white font-medium rounded-lg cursor-pointer transition-colors text-sm"
            >
              Pay Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;
