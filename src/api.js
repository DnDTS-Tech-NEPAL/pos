import axios from "axios";

const LOGIN_BASE_URL = "https://crm.dndts.net/api/method/checkuser";
let API_BASE = ""; // Default fallback
let AUTH_TOKEN = null;

const apiClient = axios.create();

// Request interceptor to add auth token if present
apiClient.interceptors.request.use(
  (config) => {
    if (AUTH_TOKEN) {
      config.headers["Authorization"] = `${AUTH_TOKEN}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (optional global error handling)
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    // Example: logout on 401 Unauthorized if needed
    if (err.response && err.response.status === 401) {
      api.logout();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

const api = {
  /**
   * Fetch dynamic base URL using email during login (Step 1)
   */
  getBaseUrlByEmail: async ({ email }) => {
    try {
      const res = await axios.post(LOGIN_BASE_URL, {
        username: email,
      });

      const baseUrl = res?.data?.data;
      console.log(baseUrl);

      if (!baseUrl) {
        throw new Error("Base URL not found in response.");
      }

      API_BASE = baseUrl;
      localStorage.setItem("api_base_url", baseUrl);

      return baseUrl;
    } catch (err) {
      throw new Error(
        err?.response?.data?.message || "Failed to retrieve base URL."
      );
    }
  },

  /**
   * Login with email & password (Step 2)
   */
  // Step 2: loginWithPassword is now POST to `${API_BASE}/login`
  loginWithPassword: async ({ email, password }) => {
    if (!API_BASE) {
      throw new Error("API base URL is not initialized.");
    }
    try {
      const response = await axios.post(`${API_BASE}/frappe.val.api.login`, {
        usr: email,
        pwd: password,
      });

      // Default to "customer" token if none found
      const token = response?.data?.auth?.token;
      console.log(response);

      AUTH_TOKEN = token;
      localStorage.setItem("auth_token", token);
      console.log(AUTH_TOKEN);

      return token;
    } catch (err) {
      throw new Error(err?.response?.data?.message || "Login failed.");
    }
  },

  /**
   * Initialize API base URL from localStorage
   */
  initializeApiBase: () => {
    const stored = localStorage.getItem("api_base_url");
    if (stored) API_BASE = stored;
  },

  /**
   * Initialize auth token from localStorage
   */
  initializeAuthToken: () => {
    const token = localStorage.getItem("auth_token");
    if (token) AUTH_TOKEN = token;
  },

  /**
   * Returns current API base
   */
  getApiBase: () => API_BASE,

  /**
   * Check if logged in (base_url and auth token exist)
   */
  isAuthenticated: () => {
    return (
      !!localStorage.getItem("api_base_url") &&
      !!localStorage.getItem("auth_token")
    );
  },

  /**
   * Logout user
   */
  logout: () => {
    AUTH_TOKEN = null;
    API_BASE = ""; // reset
    localStorage.removeItem("auth_token");
    localStorage.removeItem("api_base_url");
  },

  // POS / Business Methods 👇

  /**
   * Fetch all items
   */
  getItems: () => apiClient.get(`${API_BASE}/itemstest`),

  /**
   * Search customers
   */
  searchCustomers: async (searchTerm) => {
    const response = await apiClient.post(`${API_BASE}/customers_pos`, {
      customer: searchTerm,
    });
    return response.data.message || [];
  },

  /**
   * Get invoices for a customer
   */
  getCustomerInvoices: async (payload) => {
    const response = await apiClient.post(`${API_BASE}/invoice_list`, {
      customer: payload,
    });
    return response.data.data || [];
  },

  /**
   * Create customer
   */
  createCustomer: async (payload) => {
    const response = await apiClient.post(
      `${API_BASE}/create_customer_pos`,
      payload
    );
    return response.data;
  },

  /**
   * Send order to create invoice
   */
  sendOrderToServer: async (payload) => {
    try {
      const response = await apiClient.post(
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
   * Bill confirmation (print)
   */
  BillConfirm1: async (payload) => {
    try {
      const response = await apiClient.post(
        `${API_BASE}/invoice_print`,
        payload
      );
      return response?.data.message;
    } catch (error) {
      console.error("Invoice print error", error);
      throw new Error(
        error?.response?.data?.error || "Failed to process invoice print."
      );
    }
  },

  /**
   * Cancel invoice
   */
  CancelInvoice: async (payload) => {
    try {
      const response = await apiClient.post(
        `${API_BASE}/cancel_invoice`,
        payload
      );
      return response?.data;
    } catch (error) {
      console.error("Cancel invoice error", error);
      throw new Error(
        error?.response?.data?.error || "Failed to cancel invoice."
      );
    }
  },
};

export default api;

export const {
  getBaseUrlByEmail,
  initializeApiBase,
  initializeAuthToken,
  getApiBase,
  logout,
  isAuthenticated,
  getItems,
  searchCustomers,
  createCustomer,
  sendOrderToServer,
  BillConfirm1,
  getCustomerInvoices,
  CancelInvoice,
  loginWithPassword,
} = api;
