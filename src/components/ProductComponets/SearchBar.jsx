import { useState, useRef, useEffect, useMemo } from "react";
import { Search, X } from "lucide-react";

const normalize = (str) => str?.toLowerCase().replace(/[\s-]/g, "") || "";

const SearchBar = ({
  inputProduct,
  setInputProduct,
  allItems = [],
  placeholderText = "Search by name, code, or barcode...",
  onBarcodeMatch,
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

  useEffect(() => {
    const trimmedInput = inputProduct.trim();
    if (!trimmedInput) return;

    const normalizedQuery = normalize(trimmedInput);

    const matchedProduct = allItems.find(
      (item) => normalize(item.barcode) === normalizedQuery
    );

    if (matchedProduct) {
      onBarcodeMatch?.(matchedProduct);
      setInputProduct("");
      setIsFocused(false);
    }
  }, [inputProduct, allItems, onBarcodeMatch, setInputProduct]);

  const handleClearInput = () => {
    setInputProduct("");
    inputRef.current?.focus();
  };

  const filteredItems = useMemo(() => {
    const query = inputProduct.toLowerCase().trim();
    if (query.length < 2) return [];

    const tokens = query.split(/\s+/).map((token) => normalize(token));

    return allItems.filter(({ item_name, item_code, barcode }) => {
      const fields = [item_name, item_code, barcode].map(normalize);
      return fields.some((field) =>
        tokens.every((token) => field.includes(token))
      );
    });
  }, [inputProduct, allItems]);

  return (
    <div ref={containerRef} className="relative w-[38rem]">
      <label
        className={`flex items-center gap-3 px-3 rounded-full border transition-all duration-200 shadow-sm ${
          isFocused
            ? "border-[#fa81a5] ring-2 ring-[#ffe4ee]"
            : "border-gray-300"
        } bg-white text-gray-700`}
      >
        <Search
          className={`text-base sm:text-lg transition-colors duration-200 ${
            isFocused ? "text-[#fa81a5]" : "text-gray-400"
          }`}
        />
        <input
          type="text"
          placeholder={placeholderText}
          className="flex-grow p-1 m-0 text-gray-900 placeholder-gray-400 whitespace-nowrap text-ellipsis focus:outline-none bg-transparent text-sm sm:text-base"
          value={inputProduct}
          onChange={(e) => setInputProduct(e.target.value)}
          onFocus={() => setIsFocused(true)}
          ref={inputRef}
          autoComplete="off"
          spellCheck="false"
          enterKeyHint="search"
          aria-controls="search-dropdown-list"
          aria-expanded={isFocused && filteredItems.length > 0}
        />
        {inputProduct && (
          <button
            type="button"
            onClick={handleClearInput}
            className="text-gray-500 hover:text-gray-700 focus:outline-none transition-colors duration-200"
            aria-label="Clear search input"
            style={{ touchAction: "manipulation" }}
          >
            <X className="text-base sm:text-lg" />
          </button>
        )}
      </label>
    </div>
  );
};

export default SearchBar;
