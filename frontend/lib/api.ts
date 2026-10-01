const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000/api";

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type Product = {
  id: number;
  seller: number;
  seller_name: string;
  category: number | null;
  title: string;
  description: string;
  image: string | null;
  price_per_unit: string;
  unit: string;
  stock_quantity: number;
  province: number;
  city: number;
  is_approved: boolean;
  is_active: boolean;
  created_at: string;
};

export type ProductCategory = {
  id: number;
  name: string;
};

export type Province = {
  id: number;
  name: string;
  cities: City[];
};

export type City = {
  id: number;
  name: string;
  province: number;
};

export type CartItem = {
  id: number;
  product: number;
  product_detail: Product;
  quantity: number;
  subtotal: string;
};

export type Cart = {
  id: number;
  items: CartItem[];
  total: string;
};

export type OrderItem = {
  id: number;
  product: number;
  product_title: string;
  seller: number;
  quantity: number;
  unit_price: string;
  subtotal: string;
};

export type Order = {
  id: number;
  order_number: string;
  buyer: number;
  status: OrderStatus;
  total_amount: string;
  shipping_address: string;
  items: OrderItem[];
  created_at: string;
};

export type SellerOrderItem = {
  id: number;
  product: number;
  product_title: string;
  quantity: number;
  unit_price: string;
  subtotal: string;
};

export type SellerOrder = {
  id: number;
  order_number: string;
  buyer_name: string;
  buyer_mobile: string;
  status: OrderStatus;
  shipping_address: string;
  items: SellerOrderItem[];
  seller_subtotal: string;
  created_at: string;
};

export type Notification = {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

/* =========================================================
   API FETCH
========================================================= */

export async function apiFetch(
  path: string,
  options: RequestInit = {}
) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null;

  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData)) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  } else {
    headers.delete("Content-Type");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await res.text();

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }

    throw new Error(
      `API error: 401 ${
        text || "توکن نامعتبر یا منقضی شده است"
      }`
    );
  }

  if (!res.ok) {
    throw new Error(
      `API error: ${res.status} ${text || "خطای سرور"}`
    );
  }

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("پاسخ سرور JSON معتبر نیست.");
  }
}

/* =========================================================
   PRODUCTS
========================================================= */

export function getProducts() {
  return apiFetch("/products/");
}

export function getMyProducts() {
  return apiFetch("/products/mine/");
}

export function getCategories() {
  return apiFetch("/products/categories/");
}

export async function createProduct(data: {
  category: string;
  title: string;
  description: string;
  image: File;
  price_per_unit: string;
  unit: string;
  stock_quantity: string;
  province: string;
  city: string;
}) {
  const formData = new FormData();

  formData.append("category", data.category);
  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("image", data.image);
  formData.append("price_per_unit", data.price_per_unit);
  formData.append("unit", data.unit);
  formData.append("stock_quantity", data.stock_quantity);
  formData.append("province", data.province);
  formData.append("city", data.city);

  return apiFetch("/products/", {
    method: "POST",
    body: formData,
  });
}

export async function updateProduct(
  id: number,
  data: {
    category: string;
    title: string;
    description: string;
    image?: File;
    price_per_unit: string;
    unit: string;
    stock_quantity: string;
    province: string;
    city: string;
    is_active?: boolean;
  }
) {
  const formData = new FormData();

  formData.append("category", data.category);
  formData.append("title", data.title);
  formData.append("description", data.description);

  if (data.image) {
    formData.append("image", data.image);
  }

  formData.append("price_per_unit", data.price_per_unit);
  formData.append("unit", data.unit);
  formData.append("stock_quantity", data.stock_quantity);
  formData.append("province", data.province);
  formData.append("city", data.city);

  if (typeof data.is_active !== "undefined") {
    formData.append(
      "is_active",
      String(data.is_active)
    );
  }

  return apiFetch(`/products/${id}/`, {
    method: "PATCH",
    body: formData,
  });
}

export function deleteProduct(id: number) {
  return apiFetch(`/products/${id}/`, {
    method: "DELETE",
  });
}

/* =========================================================
   ADMIN PRODUCTS
========================================================= */

export function getAdminProducts() {
  return apiFetch("/products/admin/");
}

export function approveProduct(id: number) {
  return apiFetch(`/products/admin/${id}/approve/`, {
    method: "POST",
  });
}

/*
  دلیل رد اختیاری است.
  این تغییر خطای:
  Expected 1 arguments, but got 2
  را برطرف می‌کند.
*/
export function rejectProduct(
  id: number,
  reason?: string
) {
  return apiFetch(`/products/admin/${id}/reject/`, {
    method: "POST",
    body: JSON.stringify(
      reason
        ? { reason }
        : {}
    ),
  });
}

export function adminDeleteProduct(id: number) {
  return apiFetch(`/products/admin/${id}/`, {
    method: "DELETE",
  });
}

/* =========================================================
   LOCATIONS
========================================================= */

export function getProvinces() {
  return apiFetch("/locations/provinces/");
}

export function getCities(provinceId: number) {
  return apiFetch(
    `/locations/cities/?province=${provinceId}`
  );
}

/* =========================================================
   CART
========================================================= */

export function getMyCart() {
  return apiFetch("/cart/");
}

export function getCart() {
  return getMyCart();
}

export function addToCart(
  productId: number,
  quantity: number = 1
) {
  return apiFetch("/cart/items/", {
    method: "POST",
    body: JSON.stringify({
      product: productId,
      quantity,
    }),
  });
}

export function updateCartItem(
  itemId: number,
  quantity: number
) {
  return apiFetch(`/cart/items/${itemId}/`, {
    method: "PATCH",
    body: JSON.stringify({
      quantity,
    }),
  });
}

export function removeCartItem(itemId: number) {
  return apiFetch(`/cart/items/${itemId}/`, {
    method: "DELETE",
  });
}

/* =========================================================
   ORDERS
========================================================= */

export async function getMyOrders(): Promise<{
  count: number;
  next: string | null;
  previous: string | null;
  results: Order[];
}> {
  return apiFetch("/orders/");
}

export async function createOrder(
  shippingAddress: string
): Promise<Order> {
  return apiFetch("/orders/", {
    method: "POST",
    body: JSON.stringify({
      shipping_address: shippingAddress,
    }),
  });
}

export async function getOrder(
  id: number
): Promise<Order> {
  return apiFetch(`/orders/${id}/`);
}

export async function getSellerOrders() {
  return apiFetch("/orders/seller/");
}

export async function updateSellerOrderStatus(
  orderId: number,
  newStatus: OrderStatus
) {
  return apiFetch(`/orders/${orderId}/status/`, {
    method: "PATCH",
    body: JSON.stringify({
      status: newStatus,
    }),
  });
}

export async function confirmDelivery(
  orderId: number,
  deliveryCode: string
) {
  return apiFetch(
    `/orders/${orderId}/confirm-delivery/`,
    {
      method: "POST",
      body: JSON.stringify({
        delivery_code: deliveryCode,
      }),
    }
  );
}

/* =========================================================
   PAYMENTS
========================================================= */

export type PaymentGateway =
  | "ZARINPAL"
  | "PAYPAL";

export type PaymentStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED";

export type Payment = {
  id: number;
  order: number;
  gateway: PaymentGateway;
  status: PaymentStatus;
  amount: string;
  gateway_ref_id: string;
  created_at: string;
  verified_at: string | null;
};

export async function initiatePayment(
  orderId: number,
  gateway: PaymentGateway
) {
  return apiFetch("/payments/initiate/", {
    method: "POST",
    body: JSON.stringify({
      order_id: orderId,
      gateway,
    }),
  });
}

export async function verifyPayment(
  paymentId: number
): Promise<Payment> {
  return apiFetch(
    `/payments/verify/${paymentId}/`,
    {
      method: "POST",
    }
  );
}

/* =========================================================
   NOTIFICATIONS
========================================================= */

export async function getMyNotifications() {
  return apiFetch("/notifications/");
}

export async function markNotificationAsRead(
  notificationId: number
) {
  return apiFetch(
    `/notifications/${notificationId}/read/`,
    {
      method: "PATCH",
    }
  );
}

/*
  Alias برای seller/dashboard
*/
export async function markNotificationRead(
  notificationId: number
) {
  return markNotificationAsRead(notificationId);
}

export async function markAllNotificationsAsRead() {
  return apiFetch(
    "/notifications/read-all/",
    {
      method: "POST",
    }
  );
}

/* =========================================================
   AUTH
========================================================= */

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }
}

export function isAuthenticated() {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(
    localStorage.getItem("access_token")
  );
}

/* =========================================================
   ADMIN REPORTS
========================================================= */

export type AdminPlatformStats = {
  total_orders: number;
  total_revenue: string;
  total_sellers: number;
  total_buyers: number;
  total_products: number;
  approved_products: number;
  pending_products: number;
  inactive_products: number;
  pending_orders: number;
  paid_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  successful_payments: number;
  pending_payments: number;
};

export type AdminSalesSummary = {
  today: string;
  this_week: string;
  this_month: string;
  all_time: string;
};

export type AdminOrderStatusReport = {
  status: string;
  label: string;
  count: number;
};

export type AdminProvinceReport = {
  province_id: number;
  province_name: string;
  product_count: number;
  sold_quantity: number;
  revenue: string;
};

export type AdminFullReport = {
  platform: AdminPlatformStats;
  sales: AdminSalesSummary;
  order_statuses: AdminOrderStatusReport[];
  provinces: AdminProvinceReport[];
};

export function getAdminPlatformStats(): Promise<AdminPlatformStats> {
  return apiFetch("/reports/platform-stats/");
}

export function getAdminFullReport(): Promise<AdminFullReport> {
  return apiFetch("/reports/full-report/");
}