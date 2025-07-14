import { useState, useRef, useEffect, useMemo } from "react";
import { Search, X } from "lucide-react";

const normalize = (str) => str?.toLowerCase().replace(/[\s-]/g, "") || "";

const InvoiceSearchBar = ({
  inputValue,
  setInputValue,
  allInvoices = [],
  placeholderText = "Search invoice, tax ID, customer name or phone...",
  onMatchSelect,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClearInput = () => {
    setInputValue("");
    inputRef.current?.focus();
  };

  const filteredInvoices = useMemo(() => {
    const query = inputValue.toLowerCase().trim();
    if (query.length < 2) return [];

    const tokens = query.split(/\s+/).map((token) => normalize(token));

    return allInvoices.filter(
      ({ name, tax_id, custom_full_name, customer }) => {
        const fields = [
          name, // invoice name
          tax_id,
          custom_full_name,
          customer, // phone or ID
        ].map(normalize);

        return fields.some((field) =>
          tokens.every((token) => field.includes(token))
        );
      }
    );
  }, [inputValue, allInvoices]);

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <label
        className={`flex items-center gap-3 px-3 rounded-md border transition-all duration-200 shadow-sm ${
          isFocused ? "border-blue-600 ring-2 ring-blue-100" : "border-gray-300"
        } bg-white text-gray-700`}
      >
        <Search
          className={`transition-colors duration-200 ${
            isFocused ? "text-blue-600" : "text-gray-400"
          }`}
        />
        <input
          type="text"
          placeholder={placeholderText}
          className="flex-grow p-2 text-sm bg-transparent focus:outline-none text-gray-900 placeholder-gray-400"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          ref={inputRef}
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClearInput}
            className="text-gray-500 hover:text-gray-700"
          >
            <X />
          </button>
        )}
      </label>

      {isFocused && filteredInvoices.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto text-sm">
          {filteredInvoices.map((invoice, idx) => (
            <li
              key={idx}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onMatchSelect?.(invoice);
                setIsFocused(false);
                setInputValue("");
              }}
            >
              <div className="font-medium">{invoice.name}</div>
              <div className="text-gray-500 text-xs">
                {invoice.custom_full_name} • {invoice.tax_id} •{" "}
                {invoice.customer}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InvoiceSearchBar;
