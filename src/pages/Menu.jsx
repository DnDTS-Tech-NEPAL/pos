import { useState, useEffect, useMemo } from "react";
import Order from "../components/OrderComponents/Order";
import Product from "../components/ProductComponets/Product";
import SearchBar from "../components/ProductComponets/SearchBar";
import CustomerSearch from "../components/Customer";
import PaymentModal from "../components/Payment/Paymentmodal";
import MessageAlert from "../components/MessageAlert";
import { v4 as uuidv4 } from "uuid";
import api from "../api";

const FALLBACK_IMAGE_URL = "https://edumart.dndts.net/files/shiva.png";

const normalize = (str) => str?.toLowerCase().replace(/[\s-]/g, "") || "";

const Menu = () => {
  const [products, setProducts] = useState([]);
  const [inputProductName, setInputProductName] = useState("");
  const [customer, setCustomer] = useState();
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [total, setTotal] = useState(0);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [redeemedPoints, setRedeemedPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountType, setDiscountType] = useState("flat");

  useEffect(() => {
    api
      .getItems()
      .then((res) => {
        const list = res?.data?.message;
        if (Array.isArray(list)) setProducts(list);
        else
          setMessage({
            text: "Invalid products response format",
            type: "error",
          });
      })
      .catch(() =>
        setMessage({ text: "Failed to load products", type: "error" })
      )
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!message.text) return;
    const timeout = setTimeout(() => setMessage({ text: "", type: "" }), 1000);
    return () => clearTimeout(timeout);
  }, [message]);

  const onBarcodeMatch = (product) => {
    setOrders((prev) => {
      const existingIndex = prev.findIndex(
        (order) => order.orderId === product.barcode
      );

      if (existingIndex >= 0) {
        // Item already exists, increment quantity
        const updated = [...prev]; // Create a new array
        // Create a NEW object for the item you're updating
        updated[existingIndex] = {
          ...updated[existingIndex], // Copy all existing properties
          quantity: updated[existingIndex].quantity + 1, // Increment quantity
        };
        return updated; // Return the new array with the new object
      }

      // Item does not exist, add a new one
      return [
        {
          orderId: uuidv4(),
          itemCode: product.item_code,
          name: product.item_name,
          price: product.standard_rate || 0,
          img:
            product.custom_image_1_link ||
            product.image ||
            "YOUR_FALLBACK_IMAGE_URL", // Use the correct fallback URL
          quantity: 1,
          barcode: product.barcode,
          taxRate: product.tax_rate,
        },
        ...prev,
      ];
    });
  };

  const handleSendOrder = () => {
    if (!customer || Object.keys(customer).length === 0) {
      return setMessage({ text: "Please select a customer", type: "error" });
    }

    if (!orders.length) {
      return setMessage({ text: "No orders to send", type: "error" });
    }
    setShowPaymentMethods(true);
  };

  const filteredProducts = useMemo(() => {
    if (!inputProductName.trim()) return products;

    const tokens = inputProductName
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .map(normalize);

    return products.filter((p) => {
      const fields = [p.item_name, p.item_code, p.barcode].map(normalize);
      return fields.some((field) =>
        tokens.every((token) => field.includes(token))
      );
    });
  }, [inputProductName, products]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-xl text-gray-600 gap-4">
        <svg
          className="animate-spin h-10 w-10 text-[#614c9f]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-label="Loading spinner"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
        Loading POS, please wait...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#222]">
      <MessageAlert message={message} />

      {showPaymentMethods && (
        <PaymentModal
          total={total}
          customer={customer}
          orders={orders}
          setShowPaymentMethods={setShowPaymentMethods}
          setOrders={setOrders}
          setMessage={setMessage}
          redeemedPoints={redeemedPoints}
          setCustomer={setCustomer}
          discountAmount={discountAmount}
          discountType={discountType}
        />
      )}

      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-white shadow-md px-4 py-2 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 w-full">
          <img
            src={FALLBACK_IMAGE_URL}
            alt="POS Logo"
            className="h-12 w-auto object-contain"
          />

          <div className="flex-1">
            <SearchBar
              inputProduct={inputProductName}
              setInputProduct={setInputProductName}
              allItems={products}
              onBarcodeMatch={onBarcodeMatch}
              className="w-full"
            />
          </div>

          <div className="w-full lg:w-auto">
            <CustomerSearch
              customer={customer}
              setCustomer={setCustomer}
              className="w-full"
              setMessage={setMessage}
            />
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 px-2 md:px-4 py-2 overflow-hidden">
        <div className="grid lg:grid-cols-2  h-screen">
          <div className=" overflow-y-auto">
            <Product
              products={filteredProducts}
              orders={orders}
              setOrders={setOrders}
              setMessage={setMessage}
            />
          </div>
          <div className="lg:col-span-1 border-t lg:border-t-0  border-gray-200 pt-4 lg:pt-6  overflow-y-auto">
            <Order
              orders={orders}
              setOrders={setOrders}
              handleSendOrder={handleSendOrder}
              setTotal={setTotal}
              redeemedPoints={redeemedPoints}
              setRedeemedPoints={setRedeemedPoints}
              customer={customer}
              discount={discountAmount} // ✅ pass value correctly
              setDiscount={setDiscountAmount} // ✅ pass setter correctly
              discountType={discountType}
              setDiscountType={setDiscountType}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
