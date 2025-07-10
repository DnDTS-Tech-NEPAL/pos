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
  const lastMatchedBarcodeRef = useRef(null);

  // --- Outside click effect (keep as is) ---
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

  // --- Barcode Matching Effect ---
  useEffect(() => {
    console.log(
      `[EFFECT] Start - inputProduct: '${inputProduct}', lastMatchedBarcodeRef: '${lastMatchedBarcodeRef.current}'`
    );

    const trimmedInput = inputProduct.trim();

    if (!trimmedInput) {
      // If input is cleared or empty, reset the last matched barcode
      console.log(
        "[EFFECT] Input empty. Resetting lastMatchedBarcodeRef.current to null."
      );
      lastMatchedBarcodeRef.current = null;
      return;
    }

    const normalizedQuery = normalize(trimmedInput);
    console.log(`[EFFECT] Normalized Query: '${normalizedQuery}'`);

    // Check if this barcode has already been matched and handled in this cycle
    if (lastMatchedBarcodeRef.current === normalizedQuery) {
      console.warn(
        `[EFFECT] Barcode '${normalizedQuery}' already matched and handled. Skipping re-call.`
      );
      return; // Exit early if already processed
    }

    const matchedProduct = allItems.find(
      (item) => normalize(item.barcode) === normalizedQuery
    );

    if (matchedProduct) {
      console.log("[EFFECT] === MATCH FOUND! ===");
      console.log("[EFFECT] Calling onBarcodeMatch with:", matchedProduct);
      onBarcodeMatch?.(matchedProduct);

      // Store the barcode that just caused a match
      lastMatchedBarcodeRef.current = normalizedQuery;
      console.log(
        `[EFFECT] lastMatchedBarcodeRef.current set to: '${lastMatchedBarcodeRef.current}'`
      );

      console.log(
        "[EFFECT] Setting inputProduct to empty and setIsFocused(false)."
      );
      setInputProduct("");
      setIsFocused(false);
    } else {
      console.log("[EFFECT] No match found for query:", normalizedQuery);
    }
    console.log("[EFFECT] End.");
  }, [inputProduct, allItems, onBarcodeMatch, setInputProduct]);

  const handleClearInput = () => {
    console.log(
      "[CLEAR BUTTON] Clearing input. Resetting lastMatchedBarcodeRef.current to null."
    );
    setInputProduct("");
    inputRef.current?.focus();
    lastMatchedBarcodeRef.current = null; // Also reset on manual clear
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
            ? "border-[#d1161b] ring-2 ring-[#ffe4ee]"
            : "border-gray-300"
        } bg-white text-gray-700`}
      >
        <Search
          className={`text-base sm:text-lg transition-colors duration-200 ${
            isFocused ? "text-[#d1161b]" : "text-gray-400"
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
