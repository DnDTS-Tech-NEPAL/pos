import React, { useState } from "react";

const FALLBACK_IMAGE_URL =
  "https://edumart.dndts.net/files/shiva.png";

const Card = ({ product, setOrders, orders, className = "", setMessage }) => {
  const [zoomPosition, setZoomPosition] = useState({ x: "50%", y: "50%" });

  const handleClick = () => {
    if (typeof product.stock_qty !== "number" || product.stock_qty <= 0) {
      setMessage({
        type: "error",
        text: "This item is out of stock!",
      });
      return;
    }

    const existingOrder = orders.find(
      (order) => order.itemCode === product.item_code
    );

    if (existingOrder) {
      if (existingOrder.quantity + 1 > product.stock_qty) {
        setMessage({
          type: "error",
          text: `Only ${product.stock_qty} units of "${product.item_name}" available in stock.`,
        });
        return;
      }

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.itemCode === product.item_code
            ? { ...order, quantity: order.quantity + 1 }
            : order
        )
      );
    } else {
      console.log(product)
      setOrders((prevOrders) => [
        {
          orderId: product.barcode|| Math.random().toString(36).substr(2, 9),
          itemCode: product.item_code,
          name: product.item_name,
          price:
            product.standard_rate || product.prices?.[0]?.price_list_rate || 0,
          img:
            product.custom_image_1_link || product.image || FALLBACK_IMAGE_URL,
          quantity: 1,
          stock_qty: product.stock_qty,
          discount: product.discount || 0,
          taxRate :product.tax_rate||0,
        },
        ...prevOrders,
      ]);
    }
  };

  const isOutOfStock =
    typeof product.stock_qty === "number" && product.stock_qty <= 0;

  const handleMouseMove = (e) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - bounds.left) / bounds.width) * 100;
    const y = ((e.clientY - bounds.top) / bounds.height) * 100;
    setZoomPosition({ x: `${x}%`, y: `${y}%` });
  };

  const handleMouseLeave = () => {
    setZoomPosition({ x: "50%", y: "50%" });
  };

  // Price to display:
  const price =
    product.standard_rate || product.prices?.[0]?.price_list_rate || 0;

  return (
    <div
      onClick={handleClick}
      className={`bg-white rounded-2xl shadow-sm border border-gray-50 ${
        isOutOfStock
          ? "opacity-50 cursor-not-allowed"
          : "hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer"
      } flex flex-col overflow-hidden relative h-65 ${className}`}
    >
      {/* Stock Badge */}
      {typeof product.stock_qty === "number" && (
        <div
          className={`absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-sm ${
            product.stock_qty === 0 ? "bg-red-500" : "bg-green-600"
          } text-white`}
        >
          {product.stock_qty}
        </div>
      )}

      {/* Image with zoom */}
      <div
        className="bg-gray-100 h-40 flex items-center justify-center overflow-hidden relative"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={
            product.custom_image_1_link || product.image || FALLBACK_IMAGE_URL
          }
          alt={product.item_name}
          className="object-cover h-full w-full transition-transform duration-200 hover:scale-200"
          style={{
            transformOrigin: `${zoomPosition.x} ${zoomPosition.y}`,
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = FALLBACK_IMAGE_URL;
          }}
        />

        {/* Price badge - blue, top-left */}
        <div className="absolute bottom-2 left-2 z-10 px-2 py-0.5 rounded-full bg-[#15459c] text-white text-xs font-semibold shadow-sm">
          Rs. {price.toFixed(2)}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 p-3 ">
        <h3 className="text-sm sm:text-base font-medium text-gray-800 line-clamp-2 leading-snug">
          {product.item_name}
        </h3>
        {product.item_code && (
          <p className="text-xs text-gray-500">{product.item_code}</p>
        )}
      </div>
    </div>
  );
};

export default Card;
