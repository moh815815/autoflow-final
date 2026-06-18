// frontend/src/services/api.js
// ============================================
// طبقة الـ API — تربط الواجهة بالـ Backend
// ============================================
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// ===== Axios instance =====
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ===== Request interceptor — attach token =====
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('autoflow_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

// ===== Response interceptor — handle errors =====
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('autoflow_token');
      localStorage.removeItem('autoflow_user');
      window.location.href = '/login';
    }
    const message = error.response?.data?.error || 'حدث خطأ غير متوقع';
    return Promise.reject(new Error(message));
  }
);

// ============================================
// AUTH
// ============================================
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
  logout: () => api.post('/auth/logout'),
};

// ============================================
// WORKFLOWS
// ============================================
export const workflowsAPI = {
  list: (params) => api.get('/workflows', { params }),
  get: (id) => api.get(`/workflows/${id}`),
  create: (data) => api.post('/workflows', data),
  update: (id, data) => api.put(`/workflows/${id}`, data),
  delete: (id) => api.delete(`/workflows/${id}`),
  run: (id, data) => api.post(`/workflows/${id}/run`, data),
  toggle: (id) => api.patch(`/workflows/${id}/toggle`),
  runs: (id, params) => api.get(`/workflows/${id}/runs`, { params }),
  runDetail: (id, runId) => api.get(`/workflows/${id}/runs/${runId}`),
  templates: () => api.get('/workflows/templates/all'),
  useTemplate: (templateId, data) => api.post(`/workflows/templates/${templateId}/use`, data),
};

// ============================================
// INTEGRATIONS
// ============================================
export const integrationsAPI = {
  list: () => api.get('/integrations'),
  create: (data) => api.post('/integrations', data),
  update: (id, data) => api.put(`/integrations/${id}`, data),
  delete: (id) => api.delete(`/integrations/${id}`),
  test: (id) => api.post(`/integrations/${id}/test`),
};

// ============================================
// EMPLOYEES
// ============================================
export const employeesAPI = {
  list: (params) => api.get('/employees', { params }),
  get: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
};

// ============================================
// ATTENDANCE
// ============================================
export const attendanceAPI = {
  list: (params) => api.get('/attendance', { params }),
  manual: (data) => api.post('/attendance/manual', data),
};

// ============================================
// PAYROLL
// ============================================
export const payrollAPI = {
  list: (params) => api.get('/payroll', { params }),
  calculate: (data) => api.post('/payroll/calculate', data),
  approve: (data) => api.post('/payroll/approve', data),
  distribute: (data) => api.post('/payroll/distribute', data),
  payslip: (empId, month, year) => api.get(`/payroll/${empId}/${month}/${year}`),
};

// ============================================
// LEAVE
// ============================================
export const leaveAPI = {
  list: (params) => api.get('/leave', { params }),
  create: (data) => api.post('/leave', data),
  approve: (id) => api.patch(`/leave/${id}/approve`),
  reject: (id, data) => api.patch(`/leave/${id}/reject`, data),
};

// ============================================
// ORDERS
// ============================================
export const ordersAPI = {
  list: (params) => api.get('/orders', { params }),
  updateStatus: (id, data) => api.patch(`/orders/${id}/status`, data),
};

// ============================================
// CUSTOMERS (CRM)
// ============================================
export const customersAPI = {
  list: (params) => api.get('/customers', { params }),
  create: (data) => api.post('/customers', data),
  updateStage: (id, stage) => api.patch(`/customers/${id}/stage`, { stage }),
};

// ============================================
// PRODUCTS
// ============================================
export const productsAPI = {
  list: (params) => api.get('/products', { params }),
  create: (data) => api.post('/products', data),
  updateQty: (id, data) => api.patch(`/products/${id}/quantity`, data),
};

// ============================================
// INVOICES
// ============================================
export const invoicesAPI = {
  list: () => api.get('/invoices'),
  create: (data) => api.post('/invoices', data),
  markPaid: (id) => api.patch(`/invoices/${id}/mark-paid`),
};

// ============================================
// REPORTS
// ============================================
export const reportsAPI = {
  dashboard: () => api.get('/reports/dashboard'),
  runsChart: () => api.get('/reports/runs-chart'),
  topWorkflows: () => api.get('/reports/top-workflows'),
  hr: (params) => api.get('/reports/hr', { params }),
  finance: (params) => api.get('/reports/finance', { params }),
};

// ============================================
// NOTIFICATIONS
// ============================================
export const notificationsAPI = {
  list: () => api.get('/notifications'),
  readAll: () => api.patch('/notifications/read-all'),
  read: (id) => api.patch(`/notifications/${id}/read`),
};

// ============================================
// BILLING
// ============================================
export const billingAPI = {
  subscription: () => api.get('/billing/subscription'),
  invoices: () => api.get('/billing/invoices'),
  checkout: (data) => api.post('/billing/checkout', data),
};

// ============================================
// FILE UPLOAD
// ============================================
export const uploadAPI = {
  upload: (file, field = 'file') => {
    const formData = new FormData();
    formData.append(field, file);
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export default api;
