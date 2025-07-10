import React, { useRef } from "react";
import Card from "./Card";

const Product = ({ products, setOrders, orders, setMessage }) => {
  const productGridRef = useRef(null);

  return (
    <div className="p-4 sm:p-6 rounded-xl shadow-lg h-full flex flex-col overflow-hidden">
      <section
        ref={productGridRef}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4 overflow-y-auto pr-1 custom-scrollbar"
        style={{ maxHeight: "calc(100vh - 120px)" }}
      >
        {products.length > 0 ? (
          products.slice(0, 20).map((product, index) => (
            <div key={product.item_code || index}>
              <Card
                product={product}
                setOrders={setOrders}
                orders={orders}
                setMessage={setMessage}
              />
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500 py-16 text-lg italic">
            No products found.
          </p>
        )}
      </section>
    </div>
  );
};

export default Product;
