import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faCirclePlus,
  faTimes,
  faUserTag,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // React Router v6
import { searchCustomers, createCustomer } from "../api";

const CustomerSearch = ({ customer, setCustomer, setMessage }) => {
  const [customers, setCustomers] = useState([]);
  const [inputCustomer, setInputCustomer] = useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);

  const [newCustomerFullName, setNewCustomerFullName] = useState("");
  const [newCustomerEmailAddress, setNewCustomerEmailAddress] = useState("");
  const [newCustomerPhoneNumber, setNewCustomerPhoneNumber] = useState("");
  const [newCustomerDOB, setNewCustomerDOB] = useState("");
  const searchInputRef = useRef(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(inputCustomer);
    }, 700);
    return () => clearTimeout(handler);
  }, [inputCustomer]);

  useEffect(() => {
    const fetchSearchedCustomers = async () => {
      if (!debouncedSearchTerm.trim()) {
        setCustomers([]);
        return;
      }

      setIsLoadingSearch(true);
      try {
        const results = await searchCustomers(debouncedSearchTerm);
        setCustomers(results);
      } catch (error) {
        console.error("Search error:", error);
        setCustomers([]);
      } finally {
        setIsLoadingSearch(false);
      }
    };

    fetchSearchedCustomers();
  }, [debouncedSearchTerm]);

  const handleOpenSearchModal = () => {
    setIsSearchModalOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const handleCloseSearchModal = () => {
    setIsSearchModalOpen(false);
    setShowAddForm(false);
    setInputCustomer("");
    setDebouncedSearchTerm("");
    setCustomers([]);
    setNewCustomerFullName("");
    setNewCustomerEmailAddress("");
    setNewCustomerPhoneNumber("");
    setNewCustomerDOB("");
  };

  const handleAddClick = () => {
    if (!isSearchModalOpen) setIsSearchModalOpen(true);
    setShowAddForm(true);
    setInputCustomer("");
    setDebouncedSearchTerm("");
    setCustomers([]);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (!newCustomerFullName.trim() || !newCustomerPhoneNumber.trim()) {
      setMessage({
        type: "error",
        text: "Full Name and Phone are required.",
      });
      return;
    }

    // if (
    //   newCustomerEmailAddress.trim() &&
    //   !/\S+@\S+\.\S+/.test(newCustomerEmailAddress.trim())
    // ) {
    //   setMessage({ type: "error", text: "Invalid email format." });
    //   return;
    // }

    const payload = {
      dob: newCustomerDOB.trim(),
      full_name: newCustomerFullName.trim(),
      email_address: newCustomerEmailAddress.trim(),
      phone_number: newCustomerPhoneNumber.trim(),
    };

    try {
      await createCustomer(payload);

      const apiNewCustomer = {
        name: payload.phone_number,
        email_address: payload.email_address,
        full_name: payload.full_name,
        total_points: 0,
      };

      setCustomers((prev) => [apiNewCustomer, ...prev]);
      setCustomer(apiNewCustomer);
      setMessage({ type: "success", text: "Customer added successfully!" });
      handleCloseSearchModal();
    } catch (error) {
      console.error("Add error:", error);
      setMessage({
        type: "error",
        text: error?.response?.data?.message || "Failed to add customer.",
      });
    }
  };

  // New: navigate to /invoice page with customer name as query param
  const goToInvoicesPage = () => {
    navigate(`/invoice`);
  };

  return (
    <>
      <div className="flex flex-col w-[25rem] sm:flex-row gap-4">
        <div
          className="flex items-center justify-between bg-[var(--primary-color)] border border-[#15459c] rounded-full px-4 py-2 shadow-md w-2/3 text-[#15459c] font-medium text-sm cursor-pointer"
          onClick={goToInvoicesPage}
        >
          <span className=" text-left">View Past Invoices</span>
        </div>

        {customer?.name && customer.name !== "Walk In Customer" ? (
          <div
            className="flex items-center justify-between bg-[var(--primary-color)] border border-[#15459c] rounded-full px-4 py-2 shadow-md w-full text-[#15459c] font-medium text-sm cursor-pointer"
            onClick={handleOpenSearchModal}
          >
            <FontAwesomeIcon icon={faUserTag} className="mr-2 text-[#15459c]" />
            <span className="truncate flex-grow text-left">
              {customer.full_name}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCustomer({});
              }}
              className="ml-3 text-[#15459c] hover:text-red-500 transition"
              title="Clear customer"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleOpenSearchModal}
            className="flex items-center justify-center bg-white border border-gray-300 rounded-full px-4 py-2 shadow-sm hover:border-[#15459c] hover:ring-2 hover:ring-[--primary-color] transition w-full text-gray-700 text-sm font-medium"
          >
            <FontAwesomeIcon icon={faSearch} className="mr-2 text-gray-400" />
            <span className="flex-grow text-center">Select Customer</span>
            <FontAwesomeIcon
              icon={faCirclePlus}
              className="ml-2 text-[#15459c]"
            />
          </button>
        )}
      </div>

      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto relative flex flex-col">
            <button
              onClick={handleCloseSearchModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>

            {!showAddForm ? (
              <>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Search & Select Customer
                </h3>

                <div className="flex items-center border border-gray-300 rounded-full px-3 py-2.5 mb-4 bg-white shadow-sm focus-within:border-[#15459c] focus-within:ring-2 focus-within:ring-[--primary-color]">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="text-gray-400 ml-1 mr-2"
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search by name, full name or taxid..."
                    value={inputCustomer}
                    onChange={(e) => setInputCustomer(e.target.value)}
                    className="flex-grow text-base text-gray-800 bg-transparent outline-none"
                  />
                  {inputCustomer && (
                    <button
                      onClick={() => setInputCustomer("")}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  )}
                </div>

                <button
                  onClick={handleAddClick}
                  className="mb-4 w-full py-2.5 px-4 rounded-lg bg-[#15459c] text-white font-medium hover:bg-[#1e56c5] shadow-md transition"
                >
                  <FontAwesomeIcon icon={faCirclePlus} className="mr-2" />
                  Add New Customer
                </button>

                {isLoadingSearch ? (
                  <p className="text-center text-gray-500 py-10">
                    Searching...
                  </p>
                ) : customers.length > 0 ? (
                  <ul className="flex-grow overflow-y-auto border-t pt-3">
                    {customers.map((custItem) => (
                      <li
                        key={custItem.name}
                        className="p-3.5 cursor-pointer hover:bg-[--primary-color] hover:text-white transition border-b flex items-start"
                        onClick={() => {
                          setCustomer(custItem);
                          handleCloseSearchModal();
                        }}
                      >
                        <div>
                          <div className="font-semibold text-gray-800">
                            {custItem.full_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Phone: {custItem.phone_number || custItem.name}
                          </div>
                          {custItem.tax_id && (
                            <div className="text-sm text-gray-500">
                              Tax Id: {custItem.tax_id}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-gray-500 py-10">
                    {inputCustomer.trim()
                      ? "No customers found."
                      : "Start typing to search or click Add New Customer."}
                  </p>
                )}
              </>
            ) : (
              <form onSubmit={handleAddSubmit} className="flex flex-col h-full">
                <h3 className="text-xl font-bold text-gray-800 mb-5">
                  Add New Customer
                </h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={newCustomerFullName}
                    onChange={(e) => setNewCustomerFullName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[--primary-color] focus:border-[#15459c]"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newCustomerPhoneNumber}
                    onChange={(e) => setNewCustomerPhoneNumber(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#15459c] focus:border-[#15459c]"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Address (Optional)
                  </label>
                  <input
                    type="text"
                    value={newCustomerEmailAddress}
                    onChange={(e) => setNewCustomerEmailAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#15459c] focus:border-[#15459c]"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Tax Id (Optional)
                  </label>
                  <input
                    type="text"
                    value={newCustomerDOB}
                    onChange={(e) => setNewCustomerDOB(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[--primary-color] focus:border-[#15459c]"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-auto">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#15459c] text-white hover:bg-[#1e56c5] rounded-md"
                  >
                    Add Customer
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerSearch;
