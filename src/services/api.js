const API_BASE_URL =
  import.meta.env.VITE_API_URL || "/api";

// API utility functions
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const config = { ...defaultOptions, ...options };

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    const parseBody = async () => {
      if (isJson) return await response.json();
      const text = await response.text();
      return { _nonJson: true, text };
    };

    const body = await parseBody();

    if (!response.ok) {
      if (isJson) {
        throw new Error(body?.error || `API error: ${response.status}`);
      }
      throw new Error(
        body?.text
          ? `API error: ${response.status} - ${body.text.slice(0, 140)}`
          : `API error: ${response.status}`,
      );
    }

    // Successful but non-json (shouldn't happen for our API, but keep safe)
    return isJson ? body : body.text;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Categories API
export const categoriesAPI = {
  async getAll() {
    return apiCall("/categories");
  },

  async getById(id) {
    return apiCall(`/categories/${id}`);
  },

  async create(data) {
    return apiCall("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(id, data) {
    return apiCall(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async delete(id) {
    // Keep delete on collection endpoint to avoid hosts that block methods on /categories/:id.
    return apiCall("/categories", {
      method: "POST",
      body: JSON.stringify({ _action: "delete", id }),
    });
  },
};

// Contacts API
export const contactsAPI = {
  /** Uses dedicated fetch so error responses include `{ persistence, emailStatus }` on the thrown error. */
  async submit(data) {
    const url = `${API_BASE_URL}/contacts/submit`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const contentType = response.headers.get("content-type") || "";
      const isJson = contentType.includes("application/json");
      const body = isJson
        ? await response.json()
        : { _nonJson: true, text: await response.text() };

      if (!response.ok) {
        const err = new Error(
          typeof body?.error === "string"
            ? body.error
            : `API error: ${response.status}`,
        );
        err.status = response.status;
        err.apiBody = body;
        throw err;
      }
      return body;
    } catch (error) {
      if (error?.apiBody) throw error;
      console.error(`API Error (/contacts/submit):`, error);
      throw error;
    }
  },

  async getAll() {
    return apiCall("/contacts");
  },

  async markAsRead(id) {
    return apiCall(`/contacts/${id}`, {
      method: "PATCH",
    });
  },

  async delete(id) {
    return apiCall(`/contacts/${id}`, {
      method: "DELETE",
    });
  },
};

// Orders API
export const ordersAPI = {
  async create(data) {
    return apiCall("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getAll() {
    return apiCall("/orders");
  },

  async getById(id) {
    return apiCall(`/orders/${id}`);
  },

  async updateStatus(id, data) {
    return apiCall(`/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async delete(id) {
    return apiCall(`/orders/${id}`, {
      method: "DELETE",
    });
  },

  async sendConfirmationEmail(order) {
    return apiCall("/orders", {
      method: "POST",
      body: JSON.stringify({
        _action: "sendConfirmationEmail",
        order,
      }),
    });
  },

  async sendStatusEmail(order, status) {
    return apiCall("/orders", {
      method: "POST",
      body: JSON.stringify({
        _action: "sendStatusEmail",
        order,
        status,
      }),
    });
  },
};

// Products API
export const productsAPI = {
  async getAll() {
    return apiCall("/products");
  },

  async getById(id) {
    return apiCall(`/products/${id}`);
  },

  async create(data) {
    return apiCall("/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(id, data) {
    return apiCall(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async delete(id) {
    return apiCall(`/products/${id}`, {
      method: "DELETE",
    });
  },
};

// Payments API (Razorpay)
export const paymentsAPI = {
  async createRazorpayOrder(data) {
    return apiCall("/payments/razorpay/order", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async verifyRazorpayPayment(data) {
    return apiCall("/payments/razorpay/verify", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
