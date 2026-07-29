import { Platform } from 'react-native';

const fallbackBaseUrl = Platform.select({
  android: 'http://10.0.2.2:4000/api/v1',
  default: 'http://localhost:4000/api/v1',
});

const runtimeEnv = typeof process !== 'undefined' && process.env ? process.env : {};

export const API_BASE_URL = runtimeEnv.EXPO_PUBLIC_API_URL || runtimeEnv.VITE_API_URL || fallbackBaseUrl;
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v\d+\/?$/, '');

const SESSION_KEYS = {
  customer: 'khan.customer.session',
  merchant: 'khan.merchant.session',
  admin: 'khan.admin.session',
};

function getStorage() {
  return typeof window !== 'undefined' ? window.localStorage : null;
}

function readSession(area = 'customer') {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(SESSION_KEYS[area]);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSession(session, area = 'customer') {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(SESSION_KEYS[area], JSON.stringify(session));
}

function clearSession(area = 'customer') {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(SESSION_KEYS[area]);
}

function authHeaders(area) {
  const token = readSession(area)?.tokens?.accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function makeQuery(query = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  });
  const text = params.toString();
  return text ? `?${text}` : '';
}

export async function apiFetch(path, options = {}) {
  const { authArea, json = true, headers, ...fetchOptions } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers: {
      Accept: 'application/json',
      ...(json ? { 'Content-Type': 'application/json' } : {}),
      ...(authArea ? authHeaders(authArea) : {}),
      ...headers,
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.message || data?.error || `فشل طلب API: ${response.status}`;
    throw new Error(Array.isArray(message) ? message.join('، ') : message);
  }

  return data;
}

function post(path, body, options) {
  return apiFetch(path, {
    method: 'POST',
    body: JSON.stringify(body),
    ...options,
  });
}

function patch(path, body, options) {
  return apiFetch(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
    ...options,
  });
}

function del(path, options) {
  return apiFetch(path, {
    method: 'DELETE',
    ...options,
  });
}

function upload(path, file, options) {
  const body = new FormData();
  body.append('file', file);
  return apiFetch(path, {
    method: 'POST',
    body,
    json: false,
    ...options,
  });
}

async function loginAs(area, credentials) {
  const session = await post('/auth/login', credentials);
  writeSession(session, area);
  return session;
}

export const authApi = {
  getSession: readSession,
  setSession: writeSession,
  clearSession,
  login: (credentials, area = 'customer') => loginAs(area, credentials),
  register: async (payload, area = 'customer') => {
    const session = await post('/auth/register', payload);
    writeSession(session, area);
    return session;
  },
  refresh: async (area = 'customer') => {
    const refreshToken = readSession(area)?.tokens?.refreshToken;
    if (!refreshToken) throw new Error('لا توجد جلسة محفوظة');
    const updated = await post('/auth/refresh', { refreshToken });
    const session = { ...readSession(area), tokens: updated.tokens };
    writeSession(session, area);
    return session;
  },
  ensureMerchantSession: () =>
    readSession('merchant') ||
    loginAs('merchant', { phone: '0999000001', password: 'Password123!' }),
  ensureAdminSession: () =>
    readSession('admin') ||
    loginAs('admin', { phone: '0990000001', password: 'Password123!' }),
};

export const uploadsApi = {
  file: (file, area = 'admin') => upload('/uploads', file, { authArea: area }),
};

export const catalogApi = {
  home: () => apiFetch('/home'),
  categories: () => apiFetch('/categories'),
  products: (query = {}) => apiFetch(`/products${makeQuery(query)}`),
  product: (id) => apiFetch(`/products/${id}`),
  store: (id) => apiFetch(`/stores/${id}`),
  storeProducts: (id, query = {}) => apiFetch(`/stores/${id}/products${makeQuery(query)}`),
  search: (query = {}) => apiFetch(`/search${makeQuery(query)}`),
  reels: (query = {}) => apiFetch(`/reels${makeQuery(query)}`),
  coupons: (query = {}) => apiFetch(`/coupons${makeQuery(query)}`),
};

export const cartApi = {
  get: () => apiFetch('/cart', { authArea: 'customer' }),
  addItem: (productId, quantity = 1) =>
    post('/cart/items', { productId, quantity }, { authArea: 'customer' }),
  updateItem: (itemId, quantity) =>
    patch(`/cart/items/${itemId}`, { quantity }, { authArea: 'customer' }),
  removeItem: (itemId) => del(`/cart/items/${itemId}`, { authArea: 'customer' }),
};

export const ordersApi = {
  checkout: (payload) => post('/orders/checkout', payload, { authArea: 'customer' }),
  mine: () => apiFetch('/orders/my', { authArea: 'customer' }),
  get: (id) => apiFetch(`/orders/${id}`, { authArea: 'customer' }),
};

export const favoritesApi = {
  list: () => apiFetch('/favorites', { authArea: 'customer' }),
  add: (productId) => post(`/favorites/${productId}`, null, { authArea: 'customer' }),
  remove: (productId) => del(`/favorites/${productId}`, { authArea: 'customer' }),
};

export const reviewsApi = {
  create: (payload) => post('/reviews', payload, { authArea: 'customer' }),
  store: (storeId) => apiFetch(`/reviews/stores/${storeId}`),
  product: (productId) => apiFetch(`/reviews/products/${productId}`),
};

export const paymentsApi = {
  initiateShamCash: (orderId) =>
    post('/payments/sham-cash/initiate', { orderId }, { authArea: 'customer' }),
  shamCashCallback: (payload, secret) =>
    post('/payments/sham-cash/callback', payload, {
      headers: secret ? { 'x-sham-cash-secret': secret } : undefined,
    }),
};

export const merchantApi = {
  store: () => apiFetch('/merchant/store', { authArea: 'merchant' }),
  createStore: (payload) => post('/merchant/store', payload, { authArea: 'merchant' }),
  updateStore: (payload) => patch('/merchant/store', payload, { authArea: 'merchant' }),
  products: () => apiFetch('/merchant/products', { authArea: 'merchant' }),
  createProduct: (payload) => post('/merchant/products', payload, { authArea: 'merchant' }),
  updateProduct: (id, payload) => patch(`/merchant/products/${id}`, payload, { authArea: 'merchant' }),
  archiveProduct: (id) => del(`/merchant/products/${id}`, { authArea: 'merchant' }),
  orders: () => apiFetch('/merchant/orders', { authArea: 'merchant' }),
  coupons: () => apiFetch('/merchant/coupons', { authArea: 'merchant' }),
  createCoupon: (payload) => post('/merchant/coupons', payload, { authArea: 'merchant' }),
  updateCoupon: (id, payload) => patch(`/merchant/coupons/${id}`, payload, { authArea: 'merchant' }),
  reels: () => apiFetch('/merchant/reels', { authArea: 'merchant' }),
  createReel: (payload) => post('/merchant/reels', payload, { authArea: 'merchant' }),
  updateReel: (id, payload) => patch(`/merchant/reels/${id}`, payload, { authArea: 'merchant' }),
  wallet: () => apiFetch('/merchant/wallet', { authArea: 'merchant' }),
};

export const adminApi = {
  createCategory: (payload) => post('/admin/categories', payload, { authArea: 'admin' }),
  packages: () => apiFetch('/admin/packages', { authArea: 'admin' }),
  createPackage: (payload) => post('/admin/packages', payload, { authArea: 'admin' }),
  updatePackage: (id, payload) => patch(`/admin/packages/${id}`, payload, { authArea: 'admin' }),
  stores: () => apiFetch('/admin/stores', { authArea: 'admin' }),
  createStore: (payload) => post('/admin/stores', payload, { authArea: 'admin' }),
  assignStorePackage: (id, packageId) =>
    post(`/admin/stores/${id}/subscription`, { packageId }, { authArea: 'admin' }),
  updateStoreStatus: (id, status) => patch(`/admin/stores/${id}/status`, { status }, { authArea: 'admin' }),
  orders: () => apiFetch('/admin/orders', { authArea: 'admin' }),
  updateOrderStatus: (id, payload) => patch(`/admin/orders/${id}/status`, payload, { authArea: 'admin' }),
  payments: () => apiFetch('/admin/payments', { authArea: 'admin' }),
  confirmPayment: (id, payload) => patch(`/admin/payments/${id}/confirm`, payload, { authArea: 'admin' }),
  deliveryEvents: () => apiFetch('/admin/delivery-events', { authArea: 'admin' }),
  createDeliveryEvent: (payload) => post('/admin/delivery-events', payload, { authArea: 'admin' }),
  users: () => apiFetch('/admin/users', { authArea: 'admin' }),
  updateUserStatus: (id, status) => patch(`/admin/users/${id}/status`, { status }, { authArea: 'admin' }),
  reviews: () => apiFetch('/admin/reviews', { authArea: 'admin' }),
  approveReview: (id) => patch(`/admin/reviews/${id}/approve`, {}, { authArea: 'admin' }),
  rejectReview: (id) => patch(`/admin/reviews/${id}/reject`, {}, { authArea: 'admin' }),
};

export const marketplaceApi = catalogApi;
