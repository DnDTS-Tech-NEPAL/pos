import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleMinus,
  faCirclePlus,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";

const OrderItem = ({ order, setOrders }) => {
  const { orderId: id, name, price, quantity, stock_qty } = order;

  const handleQuantityChange = (type) => {
    if (type === "delete") {
      setOrders((prevOrders) =>
        prevOrders.filter((item) => item.orderId !== id)
      );
    } else if (type === "plus") {
      if (quantity + 1 > stock_qty) {
        alert(`Only ${stock_qty} units available in stock.`);
        return;
      }
      setOrders((prevOrders) =>
        prevOrders.map((item) =>
          item.orderId === id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else if (type === "minus") {
      setOrders((prevOrders) =>
        prevOrders
          .map((item) =>
            item.orderId === id
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
          .filter((item) => item.quantity > 0)
      );
    }
  };

  const handlePriceChange = (e) => {
    let newPrice = parseFloat(e.target.value);
    if (isNaN(newPrice) || newPrice < 0) newPrice = 0;

    setOrders((prevOrders) =>
      prevOrders.map((item) =>
        item.orderId === id ? { ...item, price: newPrice } : item
      )
    );
  };
  console.log(order)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 border border-gray-200 rounded-xl shadow bg-white transition-all duration-200">
      {/* Image */}
      <img
        src={order.img || order.image}
        alt={name}
        className="w-14 h-14 sm:w-12 sm:h-12 object-cover rounded-md"
      />

      {/* Content */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between flex-1 w-full gap-2 sm:gap-4">
        <div className="flex flex-col sm:flex-1">
          <div className="flex gap-4">
            <h3 className="font-medium text-sm text-gray-800">{name}</h3>
            <div className="text-sm font-semibold text-green-600">
              {order.discount > 0 ? `${order.discount}% off` : ""}
            </div>
          </div>

          <div className="flex items-center mt-1 gap-1">
            <button
              onClick={() => handleQuantityChange("minus")}
              className="text-gray-600 hover:text-black text-lg cursor-pointer"
              aria-label="Decrease quantity"
            >
              <FontAwesomeIcon icon={faCircleMinus} />
            </button>
            <span className="px-2 py-0.5 text-sm text-center font-medium bg-gray-100 rounded min-w-[28px]">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange("plus")}
              className="text-gray-600 hover:text-black text-lg cursor-pointer"
              aria-label="Increase quantity"
            >
              <FontAwesomeIcon icon={faCirclePlus} />
            </button>

            {/* ✅ Editable price input */}

            <input
              type="number"
              inputMode="decimal"
              pattern="[0-9]*"
              value={price}
              onChange={handlePriceChange}
              onWheel={(e) => e.currentTarget.blur()} // Prevent trackpad/scroll wheel change
              className="ml-3 w-[80px] text-sm font-semibold border border-gray-300 rounded px-2 py-1 text- focus:outgray-700 appearance-none     [&::-webkit-outer-spin-button]:m-0 
                                                  [&::-webkit-inner-spin-button]:appearance-none line-none"
              min="0"
              step="0.01"
              title="Edit price"
            />
          </div>
        </div>

        <div className="flex flex-col items-end justify-center gap-1">
          <button
            onClick={() => handleQuantityChange("delete")}
            className="text-red-400 hover:text-red-600 text-sm cursor-pointer"
            aria-label="Delete item"
          >
            <FontAwesomeIcon icon={faTrashAlt} />
          </button>

          <div className="text-sm font-semibold text-gray-700">
            Rs. {(price * quantity).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderItem;
