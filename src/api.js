import axios from "axios";

const API_BASE = "https://edumart.dndts.net/api/method";

const api = {
  /**
   * Fetch all items
   */
  getItems: () => axios.get(`${API_BASE}/items`),

  /**
   * Search for customers
   */
  searchCustomers: async (searchTerm) => {
    const response = await axios.post(`${API_BASE}/customers_pos`, {
      customer: searchTerm,
    });
    return response.data.message || [];
  },
  getCustomerInvoices: async (payload) => {
    const response = await axios.post(`${API_BASE}/invoice_list`,{
      customer: payload
    });
    return response.data.data || [];
  },

  /**
   * Create a new customer
   */
  createCustomer: async (payload) => {
    const response = await axios.post(
      `${API_BASE}/create_customer_pos`,
      payload
    );
    return response.data;
  },

  /**
   * Send order to server to create invoice
   */
  sendOrderToServer: async (payload) => {
    try {
      const response = await axios.post(
        `${API_BASE}/create_invoice_pos`,
        payload
      );
      return response?.data.message;
    } catch (error) {
      console.error("Order send error", error);
      throw new Error(
        error?.response?.data?.error || "Failed to process payment."
      );
    }
  },

  /**
   * Optional Bill Confirmation API call (same as sendOrderToServer?)
   */
  BillConfirm1: async (payload) => {
    try {
      const response = await axios.post(`${API_BASE}/invoice_print`, payload);
      console.log("this",response)
      return response?.data.message;
    } catch (error) {
      console.error("Order send error", error);
      throw new Error(
        error?.response?.data?.error || "Failed to process payment."
      );
    }
  },
};

export default api;

// Optional: Named exports for direct usage
export const {
  getItems,
  searchCustomers,
  createCustomer,
  sendOrderToServer,
  BillConfirm1,
  getCustomerInvoices
} = api;
