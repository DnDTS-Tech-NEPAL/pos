import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faCirclePlus,
  faTimes,
  faUserTag,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useRef, useEffect } from "react";
import { searchCustomers, createCustomer } from "../api"; // ✅ Updated API imports

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
        const results = await searchCustomers(debouncedSearchTerm); // ✅ Updated
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

    if (
      newCustomerEmailAddress.trim() &&
      !/\S+@\S+\.\S+/.test(newCustomerEmailAddress.trim())
    ) {
      setMessage({ type: "error", text: "Invalid email format." });
      return;
    }

    const payload = {
      dob: newCustomerDOB.trim(),
      full_name: newCustomerFullName.trim(),
      email_address: newCustomerEmailAddress.trim(),
      phone_number: newCustomerPhoneNumber.trim(),
    };

    try {
      await createCustomer(payload); // ✅ Updated

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

  return (
    <>
      {customer?.name && customer.name !== "Walk In Customer" ? (
        <div className="flex gap-3">
          <div className="flex items-center justify-between bg-[#ffe4ee] border border-[#ff9a9e] rounded-full px-4 py-2 shadow-md w-full max-w-sm mx-auto text-[#a00030] font-semibold text-sm cursor-pointer">
            <span className="truncate flex-grow text-left">
              Points:{customer.total_points}
            </span>
          </div>
          <div
            className="flex items-center justify-between bg-[#ffe4ee] border border-[#ff9a9e] rounded-full px-4 py-2 shadow-md w-full max-w-sm mx-auto text-[#a00030] font-semibold text-sm cursor-pointer"
            onClick={handleOpenSearchModal}
          >
            <FontAwesomeIcon icon={faUserTag} className="mr-2 text-[#fa81a5]" />
            <span className="truncate flex-grow text-left">
              {customer.full_name}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCustomer({});
              }}
              className="ml-3 text-[#ff9a9e] hover:text-[#fa81a5]"
              title="Clear customer"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleOpenSearchModal}
          className="flex items-center justify-center bg-white border border-gray-300 rounded-full px-4 py-2 shadow-sm hover:border-[#fa81a5] hover:ring-2 hover:ring-[#ffe4ee] w-full max-w-sm mx-auto text-gray-700 text-sm font-medium"
        >
          <FontAwesomeIcon icon={faSearch} className="mr-2 text-gray-400" />
          <span className="flex-grow text-center">Select Customer</span>
          <FontAwesomeIcon icon={faCirclePlus} className="ml-2 text-[#fa81a5]" />
        </button>
      )}

      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm ">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col relative">
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
                <div className="flex items-center border border-gray-300 rounded-full p-2.5 mb-4 bg-white shadow-sm focus-within:border-[#fa81a5] focus-within:ring-2 focus-within:ring-[#ffe4ee]">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="text-gray-400 ml-1 mr-2"
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search by name, full name or email..."
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
                  className="mb-4 w-full py-2.5 px-4 rounded-lg bg-[#fa81a5] text-white font-medium hover:bg-[#ff9a9e] shadow-md"
                >
                  <FontAwesomeIcon icon={faCirclePlus} className="mr-2" />
                  Add New Customer
                </button>

                {isLoadingSearch ? (
                  <p className="text-center text-gray-500 py-10">Searching...</p>
                ) : customers.length > 0 ? (
                  <ul className="flex-grow overflow-y-auto border-t pt-3">
                    {customers.map((custItem) => (
                      <li
                        key={custItem.name}
                        className="p-3.5 cursor-pointer hover:bg-[#ffe4ee] border-b flex items-start"
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
                          {custItem.email_address && (
                            <div className="text-sm text-gray-500">
                              Email: {custItem.email_address}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ffe4ee] focus:border-[#ff9a9e]"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ffe4ee] focus:border-[#ff9a9e]"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={newCustomerEmailAddress}
                    onChange={(e) => setNewCustomerEmailAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ffe4ee] focus:border-[#ff9a9e]"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Date of Birth (Optional)
                  </label>
                  <input
                    type="date"
                    value={newCustomerDOB}
                    onChange={(e) => setNewCustomerDOB(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ffe4ee] focus:border-[#ff9a9e]"
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
                    className="px-4 py-2 bg-[#fa81a5] text-white hover:bg-[#ff9a9e] rounded-md"
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
