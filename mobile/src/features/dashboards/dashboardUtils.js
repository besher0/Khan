import { API_ORIGIN } from '../../services/api';

export function formatSyp(value) {
  return `${new Intl.NumberFormat('ar-SY').format(Number(value) || 0)} ل.س`;
}

export function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(Number(value) || 0);
}

export function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('ar-SY').format(date);
}

export function statusLabel(status) {
  const map = {
    ACTIVE: 'نشط',
    APPROVED: 'نشط',
    PENDING: 'جديد',
    PREPARING: 'قيد التجهيز',
    OUT_FOR_DELIVERY: 'قيد التوصيل',
    DELIVERED: 'مكتمل',
    CONFIRMED: 'مؤكد',
    CANCELLED: 'ملغي',
    DRAFT: 'مسودة',
    OUT_OF_STOCK: 'نفدت الكمية',
    PAID: 'مكتمل',
    AVAILABLE: 'متاح',
    BLOCKED: 'محظور',
    REJECTED: 'مرفوض',
  };
  return map[status] || status || 'غير محدد';
}

export function statusTone(status) {
  if (['CANCELLED', 'REJECTED', 'BLOCKED', 'OUT_OF_STOCK'].includes(status)) return 'red';
  if (['PREPARING', 'PENDING', 'DRAFT'].includes(status)) return 'amber';
  if (['OUT_FOR_DELIVERY'].includes(status)) return 'purple';
  return 'green';
}

export function displayName(user) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.phone || user?.email || '-';
}

export function roleLabel(role) {
  if (role === 'ADMIN') return 'مدير النظام';
  if (role === 'OPS') return 'مسؤول العمليات';
  if (role === 'MERCHANT') return 'صاحب متجر';
  return 'مستخدم';
}

export function remoteImage(url) {
  if (!url) return null;
  if (url.startsWith('http')) return { uri: url };
  return { uri: `${API_ORIGIN}${url}` };
}

export function getProductImage(item, index = 0) {
  return item?.image || remoteImage(item?.images?.[0]?.url || item?.product?.images?.[0]?.url || item?.thumbnailUrl);
}
