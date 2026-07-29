import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import * as Icons from '../../../icons';
import { API_ORIGIN, adminApi, authApi, catalogApi, merchantApi, uploadsApi } from '../../services/api';

const palette = {
  green: '#179B7D',
  greenDark: '#075247',
  greenMid: '#2E6F61',
  greenSoft: '#DFF8EF',
  bg: '#F7F7F3',
  card: '#FFFFFF',
  ink: '#151A1E',
  muted: '#7C8289',
  border: '#E4E8E8',
  line: '#F0F1EF',
  amber: '#F7B531',
  amberSoft: '#FFF4D9',
  red: '#D83B42',
  redSoft: '#FDE4E5',
  purple: '#4F24A6',
  purpleSoft: '#ECE7FA',
  blue: '#245AA6',
  graySoft: '#F3F4F2',
  white: '#FFFFFF',
};

const navItems = [
  ['overview', 'الصفحة الرئيسية', Icons.Home],
  ['stores', 'المتاجر والباقات', Icons.Store],
  ['packages', 'إدارة الباقات', Icons.BadgeCheck],
  ['orders', 'الطلبات', Icons.ShoppingBag],
  ['products', 'المنتجات', Icons.Package],
  ['categories', 'الأقسام', Icons.FolderTree],
  ['reels', 'الريلز', Icons.Video],
  ['offers', 'العروض والكوبونات', Icons.Ticket],
  ['customers', 'العملاء والتقييمات', Icons.Users],
  ['payments', 'الأرباح والمدفوعات', Icons.Banknote],
  ['settings', 'الإعدادات', Icons.Settings],
];

const emptyRemoteData = {
  stores: [],
  packages: [],
  orders: [],
  products: [],
  categories: [],
  coupons: [],
  reels: [],
  payments: [],
  users: [],
  reviews: [],
  deliveryEvents: [],
  wallet: null,
};

function formatSyp(value) {
  return `${new Intl.NumberFormat('ar-SY').format(Number(value) || 0)} ل.س`;
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('ar-SY').format(date);
}

function statusLabel(status) {
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

function statusTone(status) {
  if (['CANCELLED', 'REJECTED', 'BLOCKED', 'OUT_OF_STOCK'].includes(status)) return 'red';
  if (['PREPARING', 'PENDING', 'DRAFT'].includes(status)) return 'amber';
  if (['OUT_FOR_DELIVERY'].includes(status)) return 'purple';
  return 'green';
}

function displayName(user) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.phone || user?.email || '-';
}

function roleLabel(role) {
  if (role === 'ADMIN') return 'مدير النظام';
  if (role === 'OPS') return 'مسؤول العمليات';
  if (role === 'MERCHANT') return 'صاحب متجر';
  return 'مستخدم';
}

function remoteImage(url) {
  if (!url) return null;
  if (url.startsWith('http')) return { uri: url };
  return { uri: `${API_ORIGIN}${url}` };
}

function getProductImage(item, index = 0) {
  return item?.image || remoteImage(item?.images?.[0]?.url || item?.product?.images?.[0]?.url || item?.thumbnailUrl);
}

function getDashboardSectionFromPath() {
  if (typeof window === 'undefined' || !window.location?.pathname) return 'overview';
  const section = window.location.pathname.replace(/\/+$/, '').split('/').pop();
  return navItems.some(([key]) => key === section) ? section : 'overview';
}

function getDashboardModeFromPath() {
  if (typeof window === 'undefined' || !window.location?.pathname) return 'admin';
  return window.location.pathname.includes('/dashboard/merchant') ? 'merchant' : 'admin';
}

function setDashboardSectionPath(section) {
  if (typeof window === 'undefined' || !window.location?.pathname || !window.history?.pushState) return;
  const mode = getDashboardModeFromPath();
  const basePath = `/dashboard/${mode}`;
  const nextPath = section === 'overview' ? basePath : `${basePath}/${section}`;
  if (window.location.pathname !== nextPath) window.history.pushState({}, '', nextPath);
}

function Icon({ glyph: Glyph, color = palette.green, size = 22 }) {
  const Fallback = Icons.Circle || Icons.Dot;
  const Component = Glyph || Fallback;
  return <Component size={size} color={color} strokeWidth={2} />;
}

function visibleNavItems(mode) {
  return mode === 'merchant' ? navItems.filter(([key]) => !['stores', 'packages'].includes(key)) : navItems;
}

function Sidebar({ active, onChange, mode }) {
  return (
    <ScrollView
      style={styles.sidebar}
      contentContainerStyle={styles.sidebarContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.logoBlock}>
        <Text style={styles.logoText}>خان</Text>
        <Text style={styles.logoSub}>K H A N</Text>
      </View>
      <View style={styles.navList}>
        {visibleNavItems(mode).map(([key, label, glyph]) => {
          const selected = key === active;
          return (
            <TouchableOpacity
              key={key}
              style={[styles.navItem, selected && styles.navItemActive]}
              onPress={() => onChange(key)}
            >
              <Icon glyph={glyph} color="#DDF4EE" size={18} />
              <Text style={[styles.navText, selected && styles.navTextActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.supportLine} />
      <TouchableOpacity style={styles.supportItem}>
        <Icon glyph={Icons.Headphones} color="#DDF4EE" size={19} />
        <Text style={styles.navText}>مركز المساعدة</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Topbar({ session, onRefresh, loading }) {
  return (
    <View style={styles.topbar}>
      <View style={styles.userBox}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{session?.user?.firstName?.charAt(0) || 'خ'}</Text>
        </View>
        <View>
          <Text style={styles.userName}>{displayName(session?.user)}</Text>
          <Text style={styles.userRole}>{roleLabel(session?.user?.role)}</Text>
        </View>
        <Icon glyph={Icons.ChevronDown} color={palette.ink} size={20} />
      </View>
      <TouchableOpacity style={styles.bellButton} onPress={onRefresh}>
        <Icon glyph={Icons.Bell} color={palette.white} size={25} />
      </TouchableOpacity>
      <View style={styles.searchBox}>
        <Icon glyph={Icons.Search} color={palette.green} size={27} />
        <TextInput
          style={styles.searchInput}
          placeholder={loading ? 'يتم التحديث...' : 'قم بالبحث هنا'}
          placeholderTextColor="#94999E"
          textAlign="right"
        />
      </View>
    </View>
  );
}

function StatCard({ label, value, hint, delta, icon, tone = 'green' }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, toneStyles[tone]?.soft]}>
        <Icon glyph={icon} color={toneStyles[tone]?.text.color || palette.green} size={28} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <View style={styles.statFooter}>
        <Text style={[styles.statDelta, toneStyles[tone]?.text]}>{delta}</Text>
        <Text style={styles.statHint}>{hint}</Text>
      </View>
    </View>
  );
}

function StatusPill({ status, label }) {
  const tone = statusTone(status);
  return (
    <View style={[styles.statusPill, toneStyles[tone]?.soft]}>
      <Text style={[styles.statusText, toneStyles[tone]?.text]}>{label || statusLabel(status)}</Text>
    </View>
  );
}

function SwitchControl({ active = true, onPress, disabled = false }) {
  return (
    <TouchableOpacity
      style={[styles.switchTrack, active && styles.switchTrackActive, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled || !onPress}
      accessibilityRole="switch"
      accessibilityState={{ checked: active, disabled }}
    >
      <View style={[styles.switchDot, active && styles.switchDotActive]} />
    </TouchableOpacity>
  );
}

function EmptyState({ label = 'لا توجد بيانات' }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>{label}</Text>
    </View>
  );
}

function HeaderTabs({ tabs, active, onChange }) {
  return (
    <View style={styles.tabsBar}>
      {tabs.map((tab) => (
        <TouchableOpacity key={tab.key} style={[styles.tabButton, active === tab.key && styles.tabButtonActive]} onPress={() => onChange(tab.key)}>
          <Text style={[styles.tabButtonText, active === tab.key && styles.tabButtonTextActive]}>{tab.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function FilterRow({ primaryLabel, filterLabel = 'الأحدث', onPrimaryPress, children }) {
  return (
    <View style={styles.filterRow}>
      {primaryLabel ? (
        <TouchableOpacity style={styles.primaryButton} onPress={onPrimaryPress}>
          <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
        </TouchableOpacity>
      ) : <View />}
      <TouchableOpacity style={styles.filterButton}>
        <Icon glyph={Icons.ChevronDown} color={palette.greenMid} size={18} />
        <Text style={styles.filterText}>{filterLabel}</Text>
      </TouchableOpacity>
      {children}
    </View>
  );
}

function ProductThumb({ source, size = 58 }) {
  const thumbStyle = [styles.productThumb, { width: size, height: size, borderRadius: Math.min(16, size / 4) }];
  if (!source) {
    return (
      <View style={[thumbStyle, styles.productThumbPlaceholder]}>
        <Icon glyph={Icons.Package} color={palette.green} size={Math.max(16, size / 2.5)} />
      </View>
    );
  }
  return <Image source={source} style={thumbStyle} />;
}

function FormField({ label, value, onChangeText, placeholder, multiline = false, keyboardType = 'default' }) {
  return (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>{label}</Text>
      <TextInput
        style={[styles.formInput, multiline && styles.formTextArea]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9AA09F"
        textAlign="right"
        multiline={multiline}
        keyboardType={keyboardType}
      />
    </View>
  );
}

function ChoiceField({ label, value, options, onChange }) {
  return (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>{label}</Text>
      <View style={styles.choiceRow}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[styles.choiceButton, value === option.value && styles.choiceButtonActive]}
            onPress={() => onChange(option.value)}
          >
            <Text style={[styles.choiceText, value === option.value && styles.choiceTextActive]}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function UploadField({ label, value, onChange, onError, accept = 'image/*', area = 'admin' }) {
  const [uploading, setUploading] = useState(false);

  const chooseFile = () => {
    if (typeof document === 'undefined') {
      onError?.('رفع الملفات متاح حالياً من نسخة الويب.');
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const uploaded = await uploadsApi.file(file, area);
        onChange(uploaded.url);
      } catch (uploadError) {
        onError?.(uploadError.message || 'تعذر رفع الملف.');
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  const isImage = value && accept.includes('image');

  return (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>{label}</Text>
      <View style={styles.uploadRow}>
        {isImage ? <ProductThumb source={remoteImage(value)} size={58} /> : null}
        <TouchableOpacity style={[styles.uploadButton, uploading && styles.buttonDisabled]} onPress={chooseFile} disabled={uploading}>
          <Icon glyph={Icons.Upload} color={palette.greenDark} size={20} />
          <Text style={styles.uploadButtonText}>{uploading ? 'جاري الرفع...' : value ? 'تغيير الملف' : 'اختيار ملف'}</Text>
        </TouchableOpacity>
      </View>
      {value ? <Text style={styles.uploadValue} numberOfLines={1}>{value}</Text> : null}
    </View>
  );
}

const createTitles = {
  store: 'إضافة متجر جديد',
  subscription: 'تغيير باقة المتجر',
  product: 'إضافة منتج جديد',
  reel: 'رفع ريل جديد',
  coupon: 'إضافة كوبون',
  category: 'إضافة قسم',
  package: 'إضافة باقة جديدة',
};

function initialCreateForm(type) {
  if (type === 'store') return { ownerFirstName: '', ownerLastName: '', ownerPhone: '', ownerPassword: '', storeName: '', description: '', logoUrl: '', bannerUrl: '', openingTime: '', closingTime: '', packageId: '' };
  if (type === 'subscription') return { packageId: '' };
  if (type === 'product') return { name: '', description: '', price: '', stock: '', imageUrl: '', categoryId: '', status: 'DRAFT' };
  if (type === 'reel') return { title: '', videoUrl: '', thumbnailUrl: '', productId: '', status: 'DRAFT' };
  if (type === 'coupon') return { code: '', type: 'PERCENT', value: '', minOrderAmount: '', maxDiscountAmount: '', endsAt: '', usageLimit: '' };
  if (type === 'category') return { name: '', imageUrl: '' };
  if (type === 'package') return { name: '', price: '', durationDays: '30', maxProducts: '', maxReels: '', maxCoupons: '', isActive: true };
  return {};
}

function CreateEntityModal({ type, data, saving, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState(() => initialData || initialCreateForm(type));
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setForm(initialData || initialCreateForm(type));
    setFormError('');
  }, [type, initialData]);

  if (!type) return null;

  const setValue = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    setFormError('');
    try {
      if (type === 'store') {
        if (!form.storeName.trim() || !form.ownerFirstName.trim() || !form.ownerLastName.trim() || !form.ownerPhone.trim() || !form.ownerPassword) {
          throw new Error('اسم المتجر واسم صاحب المتجر ورقم الهاتف وكلمة المرور حقول مطلوبة.');
        }
        if (!form.packageId) throw new Error('اختر باقة للمتجر.');
        if (form.ownerPassword.length < 8) throw new Error('كلمة المرور يجب أن تكون 8 أحرف على الأقل.');
        await onSubmit({
          storeName: form.storeName.trim(),
          ownerFirstName: form.ownerFirstName.trim(),
          ownerLastName: form.ownerLastName.trim(),
          ownerPhone: form.ownerPhone.trim(),
          ownerPassword: form.ownerPassword,
          description: form.description.trim() || undefined,
          logoUrl: form.logoUrl.trim() || undefined,
          bannerUrl: form.bannerUrl.trim() || undefined,
          openingTime: form.openingTime.trim() || undefined,
          closingTime: form.closingTime.trim() || undefined,
          packageId: form.packageId,
        });
      } else if (type === 'subscription') {
        if (!form.packageId) throw new Error('اختر الباقة الجديدة.');
        await onSubmit({ packageId: form.packageId });
      } else if (type === 'product') {
        if (!form.name.trim() || form.price === '' || form.stock === '') throw new Error('اسم المنتج والسعر والمخزون حقول مطلوبة.');
        await onSubmit({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          price: Number(form.price),
          stock: Number(form.stock),
          categoryId: form.categoryId || undefined,
          status: form.status,
          imageUrls: form.imageUrl.trim() ? [form.imageUrl.trim()] : [],
        });
      } else if (type === 'reel') {
        if (!form.title.trim() || !form.videoUrl.trim()) throw new Error('عنوان الريل وملف الفيديو مطلوبان.');
        await onSubmit({
          title: form.title.trim(),
          videoUrl: form.videoUrl.trim(),
          thumbnailUrl: form.thumbnailUrl.trim() || undefined,
          productId: form.productId || undefined,
          status: form.status,
        });
      } else if (type === 'coupon') {
        if (!form.code.trim() || form.value === '') throw new Error('رمز الكوبون وقيمة الخصم مطلوبان.');
        if (form.endsAt && Number.isNaN(new Date(`${form.endsAt}T23:59:59`).getTime())) throw new Error('تاريخ الانتهاء غير صالح. استخدم YYYY-MM-DD.');
        await onSubmit({
          code: form.code.trim(),
          type: form.type,
          value: Number(form.value),
          minOrderAmount: form.minOrderAmount === '' ? undefined : Number(form.minOrderAmount),
          maxDiscountAmount: form.maxDiscountAmount === '' ? undefined : Number(form.maxDiscountAmount),
          endsAt: form.endsAt ? new Date(`${form.endsAt}T23:59:59`).toISOString() : undefined,
          usageLimit: form.usageLimit === '' ? undefined : Number(form.usageLimit),
        });
      } else if (type === 'category') {
        if (!form.name.trim()) throw new Error('اسم القسم مطلوب.');
        await onSubmit({
          name: form.name.trim(),
          imageUrl: form.imageUrl.trim() || undefined,
        });
      } else if (type === 'package') {
        if (!form.name.trim() || form.price === '' || form.durationDays === '' || form.maxProducts === '' || form.maxReels === '' || form.maxCoupons === '') {
          throw new Error('جميع بيانات الباقة مطلوبة.');
        }
        await onSubmit({
          name: form.name.trim(),
          price: Number(form.price),
          durationDays: Number(form.durationDays),
          maxProducts: Number(form.maxProducts),
          maxReels: Number(form.maxReels),
          maxCoupons: Number(form.maxCoupons),
          isActive: form.isActive,
        });
      }
    } catch (submitError) {
      setFormError(submitError.message || 'تعذر حفظ البيانات.');
    }
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.modalClose} onPress={onClose} disabled={saving}>
              <Icon glyph={Icons.X} color={palette.ink} size={22} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{createTitles[type]}</Text>
          </View>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
            {type === 'store' ? (
              <>
                <Text style={styles.formSectionTitle}>بيانات المتجر</Text>
                <FormField label="اسم المتجر *" value={form.storeName} onChangeText={setValue('storeName')} placeholder="اسم المتجر" />
                <FormField label="وصف المتجر" value={form.description} onChangeText={setValue('description')} placeholder="نبذة عن المتجر" multiline />
                <View style={styles.formColumns}>
                  <UploadField label="شعار المتجر" value={form.logoUrl} onChange={setValue('logoUrl')} onError={setFormError} area="admin" />
                  <UploadField label="غلاف المتجر" value={form.bannerUrl} onChange={setValue('bannerUrl')} onError={setFormError} area="admin" />
                </View>
                <View style={styles.formColumns}>
                  <FormField label="وقت الفتح" value={form.openingTime} onChangeText={setValue('openingTime')} placeholder="09:00" />
                  <FormField label="وقت الإغلاق" value={form.closingTime} onChangeText={setValue('closingTime')} placeholder="23:00" />
                </View>
                <Text style={styles.formSectionTitle}>حساب صاحب المتجر</Text>
                <View style={styles.formColumns}>
                  <FormField label="الاسم الأول *" value={form.ownerFirstName} onChangeText={setValue('ownerFirstName')} placeholder="الاسم الأول" />
                  <FormField label="اسم العائلة *" value={form.ownerLastName} onChangeText={setValue('ownerLastName')} placeholder="اسم العائلة" />
                </View>
                <View style={styles.formColumns}>
                  <FormField label="رقم الهاتف *" value={form.ownerPhone} onChangeText={setValue('ownerPhone')} placeholder="09xxxxxxxx" keyboardType="phone-pad" />
                </View>
                <FormField label="كلمة المرور المؤقتة *" value={form.ownerPassword} onChangeText={setValue('ownerPassword')} placeholder="8 أحرف على الأقل" />
                <ChoiceField
                  label="باقة المتجر *"
                  value={form.packageId}
                  onChange={setValue('packageId')}
                  options={data.packages.filter((item) => item.isActive).map((item) => ({ value: item.id, label: `${item.name} · ${item.maxProducts} منتج · ${item.maxReels} ريل` }))}
                />
              </>
            ) : null}

            {type === 'subscription' ? (
              <ChoiceField
                label="اختر الباقة الجديدة"
                value={form.packageId}
                onChange={setValue('packageId')}
                options={data.packages.filter((item) => item.isActive).map((item) => ({ value: item.id, label: `${item.name} · ${formatSyp(item.price)} · ${item.durationDays} يوم` }))}
              />
            ) : null}

            {type === 'product' ? (
              <>
                <FormField label="اسم المنتج *" value={form.name} onChangeText={setValue('name')} placeholder="مثال: سماعات لاسلكية" />
                <View style={styles.formColumns}>
                  <FormField label="السعر بالليرة *" value={form.price} onChangeText={setValue('price')} placeholder="0" keyboardType="numeric" />
                  <FormField label="المخزون *" value={form.stock} onChangeText={setValue('stock')} placeholder="0" keyboardType="numeric" />
                </View>
                <FormField label="الوصف" value={form.description} onChangeText={setValue('description')} placeholder="وصف واضح للمنتج" multiline />
                <UploadField label="صورة المنتج" value={form.imageUrl} onChange={setValue('imageUrl')} onError={setFormError} area="merchant" />
                <ChoiceField label="القسم" value={form.categoryId} onChange={setValue('categoryId')} options={[{ value: '', label: 'بدون قسم' }, ...data.categories.map((item) => ({ value: item.id, label: item.name }))]} />
                <ChoiceField label="حالة المنتج" value={form.status} onChange={setValue('status')} options={[{ value: 'DRAFT', label: 'مسودة' }, { value: 'ACTIVE', label: 'منشور' }]} />
              </>
            ) : null}

            {type === 'reel' ? (
              <>
                <FormField label="عنوان الريل *" value={form.title} onChangeText={setValue('title')} placeholder="عنوان قصير" />
                <UploadField label="ملف الفيديو *" value={form.videoUrl} onChange={setValue('videoUrl')} onError={setFormError} accept="video/*" area="merchant" />
                <UploadField label="صورة الغلاف" value={form.thumbnailUrl} onChange={setValue('thumbnailUrl')} onError={setFormError} area="merchant" />
                <ChoiceField label="المنتج المرتبط" value={form.productId} onChange={setValue('productId')} options={[{ value: '', label: 'بدون منتج' }, ...data.products.map((item) => ({ value: item.id, label: item.name }))]} />
                <ChoiceField label="حالة الريل" value={form.status} onChange={setValue('status')} options={[{ value: 'DRAFT', label: 'مسودة' }, { value: 'ACTIVE', label: 'منشور' }]} />
              </>
            ) : null}

            {type === 'coupon' ? (
              <>
                <FormField label="رمز الكوبون *" value={form.code} onChangeText={setValue('code')} placeholder="KHAN20" />
                <ChoiceField label="نوع الخصم" value={form.type} onChange={setValue('type')} options={[{ value: 'PERCENT', label: 'نسبة مئوية' }, { value: 'FIXED', label: 'مبلغ ثابت' }]} />
                <View style={styles.formColumns}>
                  <FormField label="قيمة الخصم *" value={form.value} onChangeText={setValue('value')} placeholder="0" keyboardType="numeric" />
                  <FormField label="الحد الأدنى للطلب" value={form.minOrderAmount} onChangeText={setValue('minOrderAmount')} placeholder="اختياري" keyboardType="numeric" />
                </View>
                <View style={styles.formColumns}>
                  <FormField label="أقصى خصم" value={form.maxDiscountAmount} onChangeText={setValue('maxDiscountAmount')} placeholder="اختياري" keyboardType="numeric" />
                  <FormField label="عدد مرات الاستخدام" value={form.usageLimit} onChangeText={setValue('usageLimit')} placeholder="اختياري" keyboardType="numeric" />
                </View>
                <FormField label="تاريخ الانتهاء" value={form.endsAt} onChangeText={setValue('endsAt')} placeholder="YYYY-MM-DD" />
              </>
            ) : null}

            {type === 'category' ? (
              <>
                <FormField label="اسم القسم *" value={form.name} onChangeText={setValue('name')} placeholder="مثال: إلكترونيات" />
                <UploadField label="صورة القسم" value={form.imageUrl} onChange={setValue('imageUrl')} onError={setFormError} area="admin" />
              </>
            ) : null}

            {type === 'package' ? (
              <>
                <FormField label="اسم الباقة *" value={form.name} onChangeText={setValue('name')} placeholder="مثال: الباقة الاحترافية" />
                <View style={styles.formColumns}>
                  <FormField label="السعر بالليرة *" value={form.price} onChangeText={setValue('price')} placeholder="0" keyboardType="numeric" />
                  <FormField label="مدة الاشتراك بالأيام *" value={form.durationDays} onChangeText={setValue('durationDays')} placeholder="30" keyboardType="numeric" />
                </View>
                <Text style={styles.formSectionTitle}>حدود استخدام الباقة</Text>
                <View style={styles.formColumns}>
                  <FormField label="عدد المنتجات *" value={form.maxProducts} onChangeText={setValue('maxProducts')} placeholder="0" keyboardType="numeric" />
                  <FormField label="عدد الريلز *" value={form.maxReels} onChangeText={setValue('maxReels')} placeholder="0" keyboardType="numeric" />
                </View>
                <FormField label="عدد الكوبونات *" value={form.maxCoupons} onChangeText={setValue('maxCoupons')} placeholder="0" keyboardType="numeric" />
                <View style={styles.packageActiveRow}>
                  <SwitchControl active={form.isActive} onPress={() => setValue('isActive')(!form.isActive)} />
                  <View>
                    <Text style={styles.formLabel}>الباقة متاحة للاشتراك</Text>
                    <Text style={styles.mutedSmall}>عند تعطيلها تبقى الاشتراكات الحالية كما هي، ولا يمكن تعيينها لمتجر جديد.</Text>
                  </View>
                </View>
              </>
            ) : null}

            {formError ? <Text style={styles.formError}>{formError}</Text> : null}
          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={saving}>
              <Text style={styles.cancelButtonText}>إلغاء</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveButton, saving && styles.buttonDisabled]} onPress={submit} disabled={saving}>
              <Icon glyph={Icons.Check} color="#FFFFFF" size={20} />
              <Text style={styles.saveButtonText}>{saving ? 'جارٍ الحفظ...' : 'حفظ'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function OverviewView({ data }) {
  const totalSales = data.orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  return (
    <>
      <View style={styles.statsGrid}>
        <StatCard label="مبيعات" value={formatNumber(totalSales)} hint="الإجمالي" delta="0" icon={Icons.Banknote} />
        <StatCard label="زائر" value="0" hint="غير متوفر من API" delta="0" icon={Icons.Users} />
        <StatCard label="طلب" value={String(data.orders.length)} hint="الإجمالي" delta="0" icon={Icons.Package} />
        <StatCard label="منتج" value={String(data.products.length)} hint="الإجمالي" delta="0" icon={Icons.ShoppingBag} />
      </View>
      <View style={styles.overviewGrid}>
        <View style={styles.latestOrdersCard}>
          <View style={styles.panelHeader}>
            <TouchableOpacity><Text style={styles.linkText}>عرض الكل</Text></TouchableOpacity>
            <Text style={styles.panelTitle}>أحدث الطلبات</Text>
          </View>
          {data.orders.length ? data.orders.slice(0, 4).map((order, index) => (
            <View key={order.id || index} style={styles.miniOrderRow}>
              <View>
                <Text style={styles.moneySmall}>{formatSyp(order.total)}</Text>
                <Text style={styles.mutedSmall}>{formatDate(order.createdAt)}</Text>
              </View>
              <StatusPill status={order.status} />
              <View style={styles.orderCustomer}>
                <View>
                  <Text style={styles.entityName}>{order.customerName || '-'}</Text>
                  <Text style={styles.mutedSmall}>{order.number || '-'}</Text>
                </View>
                <ProductThumb source={remoteImage(order.items?.[0]?.productImageUrl)} size={52} />
              </View>
            </View>
          )) : <EmptyState />}
        </View>
      </View>
      <View style={styles.bestProducts}>
        <View style={styles.panelHeader}>
          <TouchableOpacity><Text style={styles.linkText}>عرض الكل</Text></TouchableOpacity>
          <Text style={styles.panelTitle}>منتجاتك الأكثر مبيعا</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bestProductsList}>
          {data.products.length ? data.products.slice(0, 5).map((product, index) => (
            <View key={product.id || index} style={styles.bestProductCard}>
              <Image source={getProductImage(product, index)} style={styles.bestProductImage} />
              <View style={styles.bestProductInfo}>
                <Text style={styles.bestProductName}>{product.name || '-'}</Text>
                <Text style={styles.salesText}>{product.sales || 0} مبيع</Text>
                <Text style={styles.priceText}>{formatSyp(product.price)}</Text>
              </View>
            </View>
          )) : <EmptyState />}
        </ScrollView>
      </View>
    </>
  );
}

function StoresView({ data, onAdd, onAssignPackage, onChangeStatus }) {
  const activeStores = data.stores.filter((store) => store.status === 'APPROVED').length;
  return (
    <>
      <View style={styles.statsGrid}>
        <StatCard label="كل المتاجر" value={String(data.stores.length)} hint="الإجمالي" delta={String(activeStores)} icon={Icons.Store} />
        <StatCard label="متاجر نشطة" value={String(activeStores)} hint="معتمدة" delta={String(activeStores)} icon={Icons.CircleCheck} />
        <StatCard label="بانتظار الموافقة" value={String(data.stores.filter((store) => store.status === 'PENDING').length)} hint="معلقة" delta="0" icon={Icons.Clock3} tone="amber" />
        <StatCard label="الباقات" value={String(data.packages.length)} hint="متاحة" delta={String(data.packages.length)} icon={Icons.BadgeCheck} tone="purple" />
      </View>
      <FilterRow primaryLabel="إضافة متجر جديد" onPrimaryPress={onAdd} filterLabel="كل المتاجر" />
      <View style={styles.packageGrid}>
        {data.packages.map((storePackage) => (
          <View key={storePackage.id} style={styles.packageCard}>
            <Text style={styles.packageName}>{storePackage.name}</Text>
            <Text style={styles.packagePrice}>{formatSyp(storePackage.price)} / {storePackage.durationDays} يوم</Text>
            <Text style={styles.packageLimits}>{storePackage.maxProducts} منتج · {storePackage.maxReels} ريل · {storePackage.maxCoupons} كوبون</Text>
          </View>
        ))}
      </View>
      <View style={styles.tableCard}>
        <View style={styles.tableHeader}>
          {['المتجر', 'صاحب المتجر', 'الباقة', 'انتهاء الاشتراك', 'الحالة', 'الإجراءات'].map((item) => <Text key={item} style={styles.tableHeaderText}>{item}</Text>)}
        </View>
        {data.stores.length ? data.stores.map((store) => {
          const subscription = store.subscriptions?.[0];
          return (
            <View key={store.id} style={styles.storeRow}>
              <View style={styles.productEntity}>
                <ProductThumb source={remoteImage(store.logoUrl)} size={52} />
                <View>
                  <Text style={styles.entityName}>{store.name}</Text>
                  <Text style={styles.mutedSmall}>{store.slug}</Text>
                </View>
              </View>
              <View style={styles.tableCell}>
                <Text style={styles.entityName}>{displayName(store.owner)}</Text>
                <Text style={styles.mutedSmall}>{store.owner?.phone || '-'}</Text>
              </View>
              <Text style={styles.tableCell}>{subscription?.package?.name || 'بدون باقة'}</Text>
              <Text style={styles.tableCell}>{formatDate(subscription?.endsAt)}</Text>
              <StatusPill status={store.status} />
              <View style={styles.storeActions}>
                <TouchableOpacity style={styles.smallActionButton} onPress={() => onAssignPackage(store.id)}>
                  <Text style={styles.smallActionText}>تغيير الباقة</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.smallActionButton} onPress={() => onChangeStatus(store.id, store.status === 'APPROVED' ? 'SUSPENDED' : 'APPROVED')}>
                  <Text style={styles.smallActionText}>{store.status === 'APPROVED' ? 'تعليق' : 'اعتماد'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }) : <EmptyState label="لا توجد متاجر بعد" />}
      </View>
    </>
  );
}

function OrdersView({ data, canManage, onStatusChange, actionBusy }) {
  return (
    <>
      <View style={styles.statsGrid}>
        <StatCard label="جديد" value={String(data.orders.filter((o) => o.status === 'PENDING').length)} hint="الإجمالي" delta="0" icon={Icons.Package} />
        <StatCard label="قيد التحضير" value={String(data.orders.filter((o) => o.status === 'PREPARING').length)} hint="الإجمالي" delta="0" icon={Icons.Clock3} tone="purple" />
        <StatCard label="قيد التوصيل" value={String(data.orders.filter((o) => o.status === 'OUT_FOR_DELIVERY').length)} hint="الإجمالي" delta="0" icon={Icons.Truck} tone="amber" />
        <StatCard label="مكتمل" value={String(data.orders.filter((o) => o.status === 'DELIVERED').length)} hint="الإجمالي" delta="0" icon={Icons.CircleCheck} tone="red" />
      </View>
      <HeaderTabs
        active="all"
        onChange={() => {}}
        tabs={[
          { key: 'all', label: 'الكل' },
          { key: 'new', label: 'جديد' },
          { key: 'prep', label: 'قيد التحضير' },
          { key: 'ship', label: 'قيد التوصيل' },
          { key: 'done', label: 'مكتمل' },
          { key: 'cancel', label: 'ملغي' },
        ]}
      />
      <View style={styles.tableCard}>
        {data.orders.length ? data.orders.map((order, index) => (
          <View key={order.id || index} style={styles.orderRow}>
            <View style={styles.rowActionsWide}>
              {canManage ? (
                <>
                  <TouchableOpacity
                    style={[styles.acceptButton, actionBusy === `order-${order.id}` && styles.buttonDisabled]}
                    onPress={() => onStatusChange(order.id, 'CONFIRMED')}
                    disabled={actionBusy === `order-${order.id}` || ['DELIVERED', 'CANCELLED'].includes(order.status)}
                  ><Text style={styles.acceptText}>قبول الطلب</Text></TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.rejectButton, actionBusy === `order-${order.id}` && styles.buttonDisabled]}
                    onPress={() => onStatusChange(order.id, 'CANCELLED')}
                    disabled={actionBusy === `order-${order.id}` || ['DELIVERED', 'CANCELLED'].includes(order.status)}
                  ><Text style={styles.rejectText}>رفض</Text></TouchableOpacity>
                </>
              ) : null}
            </View>
            <Text style={styles.tableCell}>{order.customerPhone || '-'}</Text>
            <Text style={styles.tableCell}>{order.items?.length || 0} منتجات</Text>
            <View style={styles.thumbnailStack}>
              {(order.items || []).slice(0, 3).map((item, itemIndex) => (
                <ProductThumb key={item.id || itemIndex} source={remoteImage(item.productImageUrl)} size={34} />
              ))}
            </View>
            <Text style={styles.tableCell}>{formatSyp(order.total)}</Text>
            <StatusPill status={order.status} />
            <View style={styles.orderCustomer}>
              <View>
                <Text style={styles.entityName}>{order.customerName || '-'}</Text>
                <Text style={styles.mutedSmall}>{order.number || '-'}</Text>
              </View>
              <ProductThumb source={remoteImage(order.items?.[0]?.productImageUrl)} size={54} />
            </View>
          </View>
        )) : <EmptyState />}
      </View>
    </>
  );
}

function ProductsView({ data, canManage, onAdd, onArchive, actionBusy }) {
  const activeCount = data.products.filter((product) => product.status === 'ACTIVE').length;
  const draftCount = data.products.filter((product) => product.status === 'DRAFT').length;
  const stoppedCount = data.products.filter((product) => product.status === 'OUT_OF_STOCK').length;
  const lowStockCount = data.products.filter((product) => Number(product.stock) > 0 && Number(product.stock) <= 5).length;

  return (
    <>
      <View style={styles.statsGrid}>
        <StatCard label="منتج" value={String(data.products.length)} hint="الإجمالي" delta={String(activeCount)} icon={Icons.Package} />
        <StatCard label="نفدت الكمية" value={String(stoppedCount)} hint="غير متاح" delta={String(stoppedCount)} icon={Icons.CircleX} tone="red" />
        <StatCard label="منخفضة المخزون" value={String(lowStockCount)} hint="أقل من 6" delta="0" icon={Icons.TriangleAlert} tone="amber" />
        <StatCard label="مسودة" value={String(draftCount)} hint="غير منشورة" delta={String(draftCount)} icon={Icons.Clock3} tone="purple" />
      </View>
      <HeaderTabs
        active="all"
        onChange={() => {}}
        tabs={[
          { key: 'all', label: `الكل ${data.products.length}` },
          { key: 'active', label: `منشور ${activeCount}` },
          { key: 'draft', label: `مسودة ${draftCount}` },
          { key: 'stop', label: `متوقف ${stoppedCount}` },
        ]}
      />
      <FilterRow primaryLabel={canManage ? 'إضافة منتج جديد' : null} onPrimaryPress={onAdd} filterLabel="جميع الفئات" />
      <View style={styles.tableCard}>
        <View style={styles.tableHeader}>
          {['المنتج', 'الفئة', 'السعر', 'المخزون', 'الحالة', 'الإجراءات'].map((item) => <Text key={item} style={styles.tableHeaderText}>{item}</Text>)}
        </View>
        {data.products.length ? data.products.map((product, index) => (
          <View key={product.id || index} style={styles.productRow}>
            <View style={styles.productEntity}>
              <ProductThumb source={getProductImage(product, index)} size={56} />
              <View>
                <Text style={styles.entityName}>{product.name || '-'}</Text>
                <Text style={styles.mutedSmall}>#{product.id?.slice?.(0, 5) || '-'}</Text>
              </View>
            </View>
            <Text style={styles.tableCell}>{product.category?.name || '-'}</Text>
            <Text style={styles.tableCell}>{formatSyp(product.price)}</Text>
            <Text style={styles.tableCell}>{product.stock ?? 0} قطعة</Text>
            <StatusPill status={product.status} />
            <View style={styles.iconActions}>
              {canManage ? (
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => onArchive(product.id)}
                  disabled={actionBusy === `product-${product.id}` || product.status === 'ARCHIVED'}
                >
                  <Icon glyph={Icons.Trash2} color={palette.red} size={21} />
                </TouchableOpacity>
              ) : <Text style={styles.mutedSmall}>-</Text>}
            </View>
          </View>
        )) : <EmptyState />}
      </View>
    </>
  );
}

function CategoriesView({ data, canManage, onAdd }) {
  return (
    <>
      <HeaderTabs active="all" onChange={() => {}} tabs={[{ key: 'all', label: `كل الأقسام ${data.categories.length}` }]} />
      <FilterRow primaryLabel={canManage ? 'إضافة قسم جديد' : null} onPrimaryPress={onAdd} filterLabel="الأحدث" />
      <View style={styles.tableCard}>
        <View style={styles.tableHeader}>
          {['القسم', 'تاريخ الإضافة'].map((item) => <Text key={item} style={styles.tableHeaderText}>{item}</Text>)}
        </View>
        {data.categories.length ? data.categories.map((category) => (
          <View key={category.id} style={styles.categoryRow}>
            <View style={styles.productEntity}>
              <ProductThumb source={remoteImage(category.imageUrl)} size={48} />
              <Text style={styles.entityName}>{category.name}</Text>
            </View>
            <Text style={styles.tableCell}>{formatDate(category.createdAt)}</Text>
          </View>
        )) : <EmptyState label="لا توجد أقسام بعد" />}
      </View>
    </>
  );
}

function ReelsView({ data, canManage, onAdd }) {
  const reels = data.reels;
  return (
    <>
      <HeaderTabs active="all" onChange={() => {}} tabs={[{ key: 'all', label: `الكل ${reels.length}` }]} />
      <FilterRow primaryLabel={canManage ? 'رفع ريل جديد' : null} onPrimaryPress={onAdd} filterLabel="الأحدث" />
      <View style={styles.reelsGrid}>
        {reels.length ? reels.map((reel, index) => {
          const image = getProductImage(reel, index + 1);
          return (
            <View key={`${reel.id}-${index}`} style={styles.reelCard}>
              {image ? (
                <Image source={image} style={styles.reelImage} />
              ) : (
                <View style={[styles.reelImage, styles.productThumbPlaceholder]}>
                  <Icon glyph={Icons.Video} color={palette.green} size={42} />
                </View>
              )}
              <View style={styles.reelStatus}><Text style={styles.reelStatusText}>{statusLabel(reel.status)}</Text></View>
              <View style={styles.reelMeta}>
                <Text style={styles.reelTitle}>{reel.title || '-'}</Text>
                <View style={styles.reelViews}><Icon glyph={Icons.Play} color={palette.muted} size={16} /><Text style={styles.mutedSmall}>{statusLabel(reel.status)}</Text></View>
              </View>
            </View>
          );
        }) : <EmptyState />}
      </View>
    </>
  );
}

function OffersView({ data, canManage, onAdd, onToggleCoupon, actionBusy }) {
  const rows = data.coupons;
  return (
    <>
      <HeaderTabs active="coupons" onChange={() => {}} tabs={[{ key: 'coupons', label: `الكوبونات ${rows.length}` }]} />
      <FilterRow primaryLabel={canManage ? 'إضافة كوبون' : null} onPrimaryPress={onAdd} filterLabel="الأحدث" />
      <View style={styles.tableCard}>
        <View style={styles.tableHeader}>
          {['الكوبون', 'تاريخ الانتهاء', 'قيمة الخصم', 'الاستخدام', 'الحالة', 'الإجراءات'].map((item) => <Text key={item} style={styles.tableHeaderText}>{item}</Text>)}
        </View>
        {rows.length ? rows.map((coupon, index) => (
          <View key={`${coupon.id}-${index}`} style={styles.productRow}>
            <View style={styles.productEntity}>
              <Icon glyph={Icons.Copy} color={palette.green} size={24} />
              <View>
                <Text style={styles.entityName}>{coupon.code}</Text>
                <Text style={styles.mutedSmall}>اضغط للنسخ</Text>
              </View>
            </View>
            <Text style={styles.tableCell}>{formatDate(coupon.endsAt)}</Text>
            <Text style={styles.tableCell}>{coupon.type === 'PERCENT' ? `${coupon.value || 0}%` : formatSyp(coupon.value)}</Text>
            <Text style={styles.tableCell}>{coupon.usedCount || 0} مرة</Text>
            <StatusPill status={coupon.status || 'ACTIVE'} />
            <View style={styles.iconActions}>
              {canManage ? (
                <SwitchControl
                  active={coupon.status === 'ACTIVE'}
                  onPress={() => onToggleCoupon(coupon.id, coupon.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE')}
                  disabled={actionBusy === `coupon-${coupon.id}`}
                />
              ) : <Text style={styles.mutedSmall}>-</Text>}
            </View>
          </View>
        )) : <EmptyState />}
      </View>
    </>
  );
}

function PackagesView({ data, onAdd, onEdit, onToggle, actionBusy }) {
  const activeCount = data.packages.filter((item) => item.isActive).length;
  return (
    <>
      <View style={styles.statsGrid}>
        <StatCard label="كل الباقات" value={String(data.packages.length)} hint="الإجمالي" delta={String(activeCount)} icon={Icons.BadgeCheck} />
        <StatCard label="الباقات النشطة" value={String(activeCount)} hint="متاحة للمتاجر" delta={String(activeCount)} icon={Icons.CircleCheck} />
      </View>
      <FilterRow primaryLabel="إضافة باقة جديدة" onPrimaryPress={onAdd} filterLabel="إدارة الباقات" />
      <View style={styles.packageManagementGrid}>
        {data.packages.length ? data.packages.map((item) => (
          <View key={item.id} style={[styles.packageManageCard, !item.isActive && styles.packageDisabledCard]}>
            <View style={styles.packageManageHeader}>
              <SwitchControl
                active={item.isActive}
                onPress={() => onToggle(item)}
                disabled={actionBusy === `package-${item.id}`}
              />
              <View style={styles.packageManageTitle}>
                <Text style={styles.packageName}>{item.name}</Text>
                <StatusPill status={item.isActive ? 'ACTIVE' : 'BLOCKED'} label={item.isActive ? 'متاحة' : 'معطلة'} />
              </View>
            </View>
            <Text style={styles.packageManagePrice}>{formatSyp(item.price)}</Text>
            <Text style={styles.packageDuration}>مدة الاشتراك: {item.durationDays} يوم</Text>
            <View style={styles.packageLimitsGrid}>
              <View style={styles.packageLimitItem}><Text style={styles.packageLimitValue}>{item.maxProducts}</Text><Text style={styles.packageLimitLabel}>منتج</Text></View>
              <View style={styles.packageLimitItem}><Text style={styles.packageLimitValue}>{item.maxReels}</Text><Text style={styles.packageLimitLabel}>ريل</Text></View>
              <View style={styles.packageLimitItem}><Text style={styles.packageLimitValue}>{item.maxCoupons}</Text><Text style={styles.packageLimitLabel}>كوبون</Text></View>
            </View>
            <TouchableOpacity style={styles.packageEditButton} onPress={() => onEdit(item)}>
              <Icon glyph={Icons.Pencil} color={palette.greenDark} size={18} />
              <Text style={styles.packageEditText}>تعديل الباقة والصلاحيات</Text>
            </TouchableOpacity>
          </View>
        )) : <EmptyState label="لا توجد باقات بعد" />}
      </View>
    </>
  );
}

function CustomersView({ data, currentUserId, onUserStatus, onReviewStatus, actionBusy }) {
  const [tab, setTab] = useState('customers');
  const users = data.users;
  const reviews = data.reviews;
  return (
    <>
      <HeaderTabs active={tab} onChange={setTab} tabs={[{ key: 'customers', label: 'العملاء' }, { key: 'reviews', label: 'التقييمات' }]} />
      {tab === 'customers' ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tableHorizontalScroll}>
          <View style={[styles.tableCard, styles.customerTable]}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.customerNameColumn]}>المستخدم</Text>
              <Text style={[styles.tableHeaderText, styles.customerRoleColumn]}>الدور</Text>
              <Text style={[styles.tableHeaderText, styles.customerPhoneColumn]}>الهاتف</Text>
              <Text style={[styles.tableHeaderText, styles.customerStatusColumn]}>الحالة</Text>
              <Text style={[styles.tableHeaderText, styles.customerActionColumn]}>الإجراءات</Text>
            </View>
            {users.length ? users.map((user, index) => (
              <View key={`${user.id}-${index}`} style={styles.customerRow}>
              <View style={styles.customerNameColumn}>
                <View style={styles.customerEntity}>
                <View style={styles.grayAvatar} />
                <Text style={styles.entityName}>{displayName(user)}</Text>
                </View>
              </View>
              <Text style={[styles.tableCell, styles.customerRoleColumn]}>{roleLabel(user.role)}</Text>
              <Text style={[styles.tableCell, styles.customerPhoneColumn]}>{user.phone || '-'}</Text>
              <View style={styles.customerStatusColumn}><StatusPill status={user.status || 'ACTIVE'} /></View>
              <View style={styles.customerActionColumn}>
                <SwitchControl
                  active={user.status === 'ACTIVE'}
                  onPress={() => onUserStatus(user.id, user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE')}
                  disabled={user.id === currentUserId || actionBusy === `user-${user.id}`}
                />
              </View>
            </View>
            )) : <EmptyState />}
          </View>
        </ScrollView>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tableHorizontalScroll}>
          <View style={[styles.tableCard, styles.reviewTable]}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.reviewProductColumn]}>المنتج</Text>
              <Text style={[styles.tableHeaderText, styles.reviewUserColumn]}>المستخدم</Text>
              <Text style={[styles.tableHeaderText, styles.reviewDateColumn]}>التاريخ</Text>
              <Text style={[styles.tableHeaderText, styles.reviewRatingColumn]}>التقييم</Text>
              <Text style={[styles.tableHeaderText, styles.reviewCommentColumn]}>التعليق</Text>
              <Text style={[styles.tableHeaderText, styles.reviewActionColumn]}>الإجراءات</Text>
            </View>
            {reviews.length ? reviews.map((review, index) => (
              <View key={`${review.id}-${index}`} style={styles.reviewRow}>
              <View style={styles.reviewProductColumn}>
                <View style={styles.customerEntity}>
                  <ProductThumb source={remoteImage(review.product?.images?.[0]?.url)} size={48} />
                  <Text style={styles.entityName}>{review.product?.name || 'المنتج'}</Text>
                </View>
              </View>
              <View style={styles.reviewUserColumn}>
                <View style={styles.customerEntity}>
                  <View style={styles.grayAvatarSmall} />
                  <Text style={styles.entityName}>{displayName(review.user)}</Text>
                </View>
              </View>
              <Text style={[styles.tableCell, styles.reviewDateColumn]}>{formatDate(review.createdAt)}</Text>
              <Text style={[styles.starsText, styles.reviewRatingColumn]}>{'★'.repeat(review.rating || 0)}</Text>
              <Text style={[styles.reviewComment, styles.reviewCommentColumn]} numberOfLines={2}>{review.comment || '-'}</Text>
              <View style={[styles.reviewActions, styles.reviewActionColumn]}>
                <TouchableOpacity
                  style={styles.reviewApproveButton}
                  onPress={() => onReviewStatus(review.id, 'APPROVED')}
                  disabled={actionBusy === `review-${review.id}` || review.status === 'APPROVED'}
                ><Icon glyph={Icons.Check} color="#FFFFFF" size={17} /></TouchableOpacity>
                <TouchableOpacity
                  style={styles.reviewRejectButton}
                  onPress={() => onReviewStatus(review.id, 'REJECTED')}
                  disabled={actionBusy === `review-${review.id}` || review.status === 'REJECTED'}
                ><Icon glyph={Icons.X} color={palette.red} size={17} /></TouchableOpacity>
              </View>
            </View>
            )) : <EmptyState />}
          </View>
        </ScrollView>
      )}
    </>
  );
}

function PaymentsView({ data }) {
  const payments = data.payments;
  return (
    <>
      <View style={styles.statsGrid}>
        <StatCard label="مدفوعات" value={String(payments.length)} hint="الإجمالي" delta="0" icon={Icons.Package} />
        <StatCard label="معلقة" value={String(payments.filter((payment) => payment.status === 'PENDING').length)} hint="بانتظار التأكيد" delta="0" icon={Icons.CircleX} tone="red" />
        <StatCard label="مؤكدة" value={String(payments.filter((payment) => payment.status === 'PAID' || payment.status === 'CONFIRMED').length)} hint="تمت" delta="0" icon={Icons.TriangleAlert} tone="amber" />
        <StatCard label="محفظة" value={String(data.wallet?.transactions?.length || 0)} hint="حركات" delta="0" icon={Icons.Clock3} tone="purple" />
      </View>
      <View style={styles.paymentsTables}>
        <PaymentTable title="آخر المدفوعات" payments={payments} />
        <PaymentTable title="آخر عمليات السحب" payments={payments} />
      </View>
    </>
  );
}

function PaymentTable({ title, payments }) {
  return (
    <View style={styles.paymentTable}>
      <Text style={styles.panelTitle}>{title}</Text>
      <View style={styles.tableHeader}>
        {['التاريخ', 'المبلغ', 'طريقة السحب', 'الحالة'].map((item) => <Text key={item} style={styles.tableHeaderText}>{item}</Text>)}
      </View>
      {payments.length ? payments.map((payment, index) => (
        <View key={`${payment.id}-${index}`} style={styles.paymentRow}>
          <Text style={styles.tableCell}>{formatDate(payment.createdAt)}</Text>
          <Text style={styles.tableCell}>{formatNumber(payment.amount)} $</Text>
          <Text style={styles.tableCell}>{payment.method === 'SHAM_CASH' ? 'شام كاش' : 'كاش'}</Text>
          <StatusPill status={payment.status} />
        </View>
      )) : <EmptyState />}
    </View>
  );
}

function SettingsView() {
  return (
    <View style={styles.settingsEmpty}>
      <Text style={styles.panelTitle}>الإعدادات</Text>
      <Text style={styles.mutedText}>جهّز إعدادات المتجر، طرق الدفع، الإشعارات، والصلاحيات من هنا.</Text>
    </View>
  );
}

export default function DashboardWorkspace() {
  const { width } = useWindowDimensions();
  const compact = width < 980;
  const [active, setActive] = useState(getDashboardSectionFromPath);
  const [mode, setMode] = useState(getDashboardModeFromPath);
  const [session, setSession] = useState(() => {
    const initialMode = getDashboardModeFromPath();
    return authApi.getSession(initialMode) || authApi.getSession('admin') || authApi.getSession('merchant');
  });
  const [data, setData] = useState(emptyRemoteData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [createType, setCreateType] = useState(null);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [editingPackage, setEditingPackage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionBusy, setActionBusy] = useState('');

  const selectSection = (section) => {
    setActive(section);
    setDashboardSectionPath(section);
  };

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      if (mode === 'merchant') {
        const merchantSession = await authApi.ensureMerchantSession();
        setSession(merchantSession);

        const [products, coupons, reels, wallet, categories] = await Promise.all([
          merchantApi.products(),
          merchantApi.coupons(),
          merchantApi.reels(),
          merchantApi.wallet(),
          catalogApi.categories(),
        ]);

        setData({
          ...emptyRemoteData,
          products,
          categories,
          coupons,
          reels,
          wallet,
        });
        return;
      }

      const adminSession = await authApi.ensureAdminSession();
      setSession(adminSession);
      const [stores, packages, orders, payments, users, reviews, deliveryEvents, categories] = await Promise.all([
        adminApi.stores(),
        adminApi.packages(),
        adminApi.orders(),
        adminApi.payments(),
        adminApi.users(),
        adminApi.reviews(),
        adminApi.deliveryEvents(),
        catalogApi.categories(),
      ]);

      const merchantResults = await Promise.allSettled([
        merchantApi.products(),
        merchantApi.coupons(),
        merchantApi.reels(),
        merchantApi.wallet(),
      ]);

      const products = merchantResults[0].status === 'fulfilled' ? merchantResults[0].value : [];
      const coupons = merchantResults[1].status === 'fulfilled' ? merchantResults[1].value : [];
      const reels = merchantResults[2].status === 'fulfilled' ? merchantResults[2].value : [];
      const wallet = merchantResults[3].status === 'fulfilled' ? merchantResults[3].value : null;

      setData({
        ...emptyRemoteData,
        stores,
        packages,
        categories,
        orders,
        payments,
        users,
        reviews,
        deliveryEvents,
        products,
        coupons,
        reels,
        wallet,
      });
    } catch (loadError) {
      setData(emptyRemoteData);
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [mode]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handlePopState = () => {
      setActive(getDashboardSectionFromPath());
      setMode(getDashboardModeFromPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const createEntity = async (payload) => {
    setSaving(true);
    try {
      if (createType === 'product') await merchantApi.createProduct(payload);
      if (createType === 'reel') await merchantApi.createReel(payload);
      if (createType === 'coupon') await merchantApi.createCoupon(payload);
      if (createType === 'category') await adminApi.createCategory(payload);
      if (createType === 'store') await adminApi.createStore(payload);
      if (createType === 'subscription') await adminApi.assignStorePackage(selectedStoreId, payload.packageId);
      if (createType === 'package') {
        if (editingPackage) await adminApi.updatePackage(editingPackage.id, payload);
        else await adminApi.createPackage(payload);
      }
      setNotice('تمت الإضافة بنجاح.');
      setCreateType(null);
      setSelectedStoreId(null);
      setEditingPackage(null);
      await loadDashboard();
    } finally {
      setSaving(false);
    }
  };

  const changeStoreStatus = async (storeId, status) => {
    setLoading(true);
    setError('');
    try {
      await adminApi.updateStoreStatus(storeId, status);
      setNotice(status === 'APPROVED' ? 'تم اعتماد المتجر.' : 'تم تعليق المتجر.');
      await loadDashboard();
    } catch (statusError) {
      setError(statusError.message);
    } finally {
      setLoading(false);
    }
  };

  const openPackageAssignment = (storeId) => {
    setSelectedStoreId(storeId);
    setCreateType('subscription');
  };

  const openPackageEditor = (storePackage = null) => {
    setEditingPackage(storePackage);
    setCreateType('package');
  };

  const togglePackage = (storePackage) => runAction(
    `package-${storePackage.id}`,
    () => adminApi.updatePackage(storePackage.id, { isActive: !storePackage.isActive }),
    storePackage.isActive ? 'تم تعطيل الباقة.' : 'تم تفعيل الباقة.',
  );

  const runAction = async (key, action, successMessage) => {
    setActionBusy(key);
    setError('');
    try {
      await action();
      setNotice(successMessage);
      await loadDashboard();
    } catch (actionError) {
      setError(actionError.message || 'تعذر تنفيذ الإجراء.');
    } finally {
      setActionBusy('');
    }
  };

  const changeUserStatus = (userId, status) => runAction(
    `user-${userId}`,
    () => adminApi.updateUserStatus(userId, status),
    status === 'ACTIVE' ? 'تم تفعيل المستخدم.' : 'تم حظر المستخدم.',
  );

  const changeReviewStatus = (reviewId, status) => runAction(
    `review-${reviewId}`,
    () => status === 'APPROVED' ? adminApi.approveReview(reviewId) : adminApi.rejectReview(reviewId),
    status === 'APPROVED' ? 'تم اعتماد التقييم.' : 'تم رفض التقييم.',
  );

  const changeOrderStatus = (orderId, status) => runAction(
    `order-${orderId}`,
    () => adminApi.updateOrderStatus(orderId, { status }),
    status === 'CONFIRMED' ? 'تم قبول الطلب.' : 'تم إلغاء الطلب.',
  );

  const archiveProduct = (productId) => runAction(
    `product-${productId}`,
    () => merchantApi.archiveProduct(productId),
    'تمت أرشفة المنتج.',
  );

  const toggleCoupon = (couponId, status) => runAction(
    `coupon-${couponId}`,
    () => merchantApi.updateCoupon(couponId, { status }),
    status === 'ACTIVE' ? 'تم تفعيل الكوبون.' : 'تم تعطيل الكوبون.',
  );

  const merchantCanCreate = mode === 'merchant';
  const adminCanCreate = mode === 'admin';

  const contentBySection = {
    overview: <OverviewView data={data} />,
    stores: <StoresView data={data} onAdd={() => setCreateType('store')} onAssignPackage={openPackageAssignment} onChangeStatus={changeStoreStatus} />,
    packages: <PackagesView data={data} onAdd={() => openPackageEditor()} onEdit={openPackageEditor} onToggle={togglePackage} actionBusy={actionBusy} />,
    orders: <OrdersView data={data} canManage={adminCanCreate} onStatusChange={changeOrderStatus} actionBusy={actionBusy} />,
    products: <ProductsView data={data} canManage={merchantCanCreate} onAdd={() => setCreateType('product')} onArchive={archiveProduct} actionBusy={actionBusy} />,
    categories: <CategoriesView data={data} canManage={adminCanCreate} onAdd={() => setCreateType('category')} />,
    reels: <ReelsView data={data} canManage={merchantCanCreate} onAdd={() => setCreateType('reel')} />,
    offers: <OffersView data={data} canManage={merchantCanCreate} onAdd={() => setCreateType('coupon')} onToggleCoupon={toggleCoupon} actionBusy={actionBusy} />,
    customers: <CustomersView data={data} currentUserId={session?.user?.id} onUserStatus={changeUserStatus} onReviewStatus={changeReviewStatus} actionBusy={actionBusy} />,
    payments: <PaymentsView data={data} />,
    settings: <SettingsView />,
  };
  const content = contentBySection[active] || contentBySection.overview;

  return (
    <View style={[styles.shell, compact && styles.shellCompact]}>
      {!compact ? <Sidebar active={active} onChange={selectSection} mode={mode} /> : null}
      <View style={styles.main}>
        <Topbar session={session} onRefresh={loadDashboard} loading={loading} />
        {compact ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mobileNav}>
            {visibleNavItems(mode).map(([key, label, glyph]) => (
              <TouchableOpacity key={key} style={[styles.mobileNavItem, active === key && styles.mobileNavActive]} onPress={() => selectSection(key)}>
                <Icon glyph={glyph} color={active === key ? '#FFFFFF' : palette.green} size={17} />
                <Text style={[styles.mobileNavText, active === key && styles.mobileNavTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : null}
        <ScrollView style={styles.contentScroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {error ? (
            <TouchableOpacity style={styles.errorBox} onPress={loadDashboard}>
              <Text style={styles.errorText}>
                {error}
              </Text>
            </TouchableOpacity>
          ) : null}
          {notice ? (
            <TouchableOpacity style={styles.noticeBox} onPress={() => setNotice('')}>
              <Text style={styles.noticeText}>{notice}</Text>
            </TouchableOpacity>
          ) : null}
          {content}
        </ScrollView>
      </View>
      <CreateEntityModal
        type={createType}
        data={data}
        saving={saving}
        onClose={() => {
          if (!saving) {
            setCreateType(null);
            setSelectedStoreId(null);
            setEditingPackage(null);
          }
        }}
        onSubmit={createEntity}
        initialData={editingPackage ? {
          name: editingPackage.name,
          price: String(editingPackage.price),
          durationDays: String(editingPackage.durationDays),
          maxProducts: String(editingPackage.maxProducts),
          maxReels: String(editingPackage.maxReels),
          maxCoupons: String(editingPackage.maxCoupons),
          isActive: editingPackage.isActive,
        } : null}
      />
    </View>
  );
}

const toneStyles = {
  green: { text: { color: palette.green }, soft: { backgroundColor: palette.greenSoft } },
  amber: { text: { color: '#E58D18' }, soft: { backgroundColor: palette.amberSoft } },
  red: { text: { color: palette.red }, soft: { backgroundColor: palette.redSoft } },
  purple: { text: { color: palette.purple }, soft: { backgroundColor: palette.purpleSoft } },
};

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    minHeight: 0,
    flexDirection: 'row-reverse',
    backgroundColor: palette.bg,
  },
  shellCompact: {
    flexDirection: 'column',
  },
  sidebar: {
    width: 190,
    minWidth: 190,
    maxWidth: 190,
    flexBasis: 190,
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: palette.greenDark,
  },
  sidebarContent: {
    flexGrow: 1,
    paddingTop: 20,
    paddingHorizontal: 10,
    paddingBottom: 14,
  },
  logoBlock: {
    alignItems: 'center',
    marginBottom: 18,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0,
  },
  logoSub: {
    color: '#DDEFEA',
    fontSize: 10,
    marginTop: 2,
  },
  navList: {
    gap: 5,
  },
  navItem: {
    minHeight: 39,
    borderRadius: 8,
    paddingHorizontal: 9,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  navItemActive: {
    backgroundColor: '#FFFFFF24',
  },
  navText: {
    color: '#DDF4EE',
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '600',
  },
  navTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  supportLine: {
    height: 1,
    marginTop: 'auto',
    marginBottom: 26,
    backgroundColor: '#FFFFFF44',
  },
  supportItem: {
    minHeight: 42,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  main: {
    flex: 1,
    minWidth: 0,
  },
  topbar: {
    minHeight: 82,
    margin: 20,
    marginBottom: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.card,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 22,
    shadowColor: '#0A1F17',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  userBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#D8D8D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: palette.greenDark,
    fontSize: 20,
    fontWeight: '900',
  },
  userName: {
    color: palette.ink,
    textAlign: 'right',
    fontSize: 17,
    fontWeight: '900',
  },
  userRole: {
    color: palette.green,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
  bellButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: palette.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    width: '34%',
    minWidth: 270,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: '#F7F7F7',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 18,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    color: palette.ink,
    fontSize: 16,
    writingDirection: 'rtl',
  },
  contentScroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 18,
  },
  errorBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3D19A',
    backgroundColor: '#FFF5E8',
    padding: 15,
  },
  errorText: {
    color: '#9A5B00',
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '800',
  },
  noticeBox: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A9DECf',
    backgroundColor: palette.greenSoft,
    padding: 14,
  },
  noticeText: {
    color: palette.greenDark,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '800',
  },
  emptyState: {
    minHeight: 92,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    alignSelf: 'stretch',
  },
  emptyText: {
    color: palette.muted,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 14,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: 200,
    minHeight: 118,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.card,
    padding: 20,
    shadowColor: '#0A1F17',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  statIcon: {
    position: 'absolute',
    right: 18,
    top: 36,
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    color: palette.ink,
    textAlign: 'left',
    fontSize: 16,
    fontWeight: '700',
  },
  statValue: {
    marginTop: 8,
    color: '#000000',
    textAlign: 'left',
    writingDirection: 'ltr',
    fontSize: 24,
    fontWeight: '900',
  },
  statFooter: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statDelta: {
    fontSize: 22,
    fontWeight: '900',
  },
  statHint: {
    color: palette.muted,
    fontSize: 14,
  },
  overviewGrid: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 22,
  },
  latestOrdersCard: {
    flex: 1.1,
    minWidth: 330,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.card,
    padding: 20,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  panelTitle: {
    color: palette.ink,
    textAlign: 'right',
    fontSize: 18,
    fontWeight: '900',
  },
  panelNumber: {
    marginTop: 10,
    color: palette.ink,
    textAlign: 'right',
    fontSize: 17,
    fontWeight: '900',
  },
  linkText: {
    color: palette.green,
    fontSize: 15,
    fontWeight: '900',
  },
  miniOrderRow: {
    minHeight: 70,
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 18,
  },
  orderCustomer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  entityName: {
    color: palette.ink,
    textAlign: 'right',
    fontSize: 15,
    fontWeight: '900',
  },
  mutedSmall: {
    color: palette.muted,
    textAlign: 'right',
    fontSize: 12,
    marginTop: 3,
  },
  moneySmall: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  statusPill: {
    minWidth: 92,
    borderRadius: 22,
    paddingHorizontal: 15,
    paddingVertical: 8,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '800',
  },
  productThumb: {
    resizeMode: 'cover',
  },
  productThumbPlaceholder: {
    backgroundColor: palette.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallFilter: {
    minWidth: 138,
    height: 44,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#CCD5D2',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  smallFilterText: {
    color: palette.green,
    fontSize: 15,
    fontWeight: '800',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  outlineButton: {
    marginTop: 20,
    height: 44,
    alignSelf: 'stretch',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: palette.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: {
    color: palette.green,
    fontSize: 15,
    fontWeight: '800',
  },
  bestProducts: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.card,
    padding: 20,
  },
  bestProductsList: {
    flexDirection: 'row-reverse',
    gap: 24,
    paddingVertical: 2,
  },
  bestProductCard: {
    width: 218,
    height: 126,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: palette.line,
    flexDirection: 'row-reverse',
    overflow: 'hidden',
  },
  bestProductImage: {
    width: 96,
    height: '100%',
    resizeMode: 'cover',
  },
  bestProductInfo: {
    flex: 1,
    padding: 12,
    alignItems: 'flex-end',
  },
  bestProductName: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  salesText: {
    marginTop: 10,
    color: palette.green,
    fontSize: 13,
    fontWeight: '900',
  },
  priceText: {
    marginTop: 7,
    color: palette.ink,
    fontSize: 12,
  },
  tabsBar: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: palette.card,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 6,
    gap: 10,
    shadowColor: '#0A1F17',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  tabButton: {
    minWidth: 122,
    minHeight: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  tabButtonActive: {
    backgroundColor: palette.green,
  },
  tabButtonText: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  filterRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  primaryButton: {
    width: 220,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: palette.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  filterButton: {
    minWidth: 220,
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CCD5D2',
    backgroundColor: palette.card,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  filterText: {
    color: palette.greenMid,
    fontSize: 18,
    fontWeight: '800',
  },
  tableCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.card,
    overflow: 'hidden',
  },
  tableHeader: {
    minHeight: 54,
    backgroundColor: '#F3F3F3',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 22,
    gap: 18,
  },
  tableHeaderText: {
    flex: 1,
    color: palette.ink,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '800',
  },
  orderRow: {
    minHeight: 92,
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 18,
  },
  productRow: {
    minHeight: 86,
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
    paddingHorizontal: 22,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 18,
  },
  categoryRow: {
    minHeight: 76,
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
    paddingHorizontal: 22,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 18,
  },
  storeRow: {
    minHeight: 94,
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
    paddingHorizontal: 22,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 16,
  },
  storeActions: {
    flex: 1.2,
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 7,
  },
  smallActionButton: {
    minHeight: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.green,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallActionText: {
    color: palette.greenDark,
    fontSize: 12,
    fontWeight: '800',
  },
  packageGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 12,
  },
  packageCard: {
    flexGrow: 1,
    flexBasis: 220,
    minHeight: 112,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.border,
    borderTopWidth: 4,
    borderTopColor: palette.green,
    backgroundColor: palette.card,
    padding: 16,
  },
  packageName: {
    color: palette.ink,
    textAlign: 'right',
    fontSize: 17,
    fontWeight: '900',
  },
  packagePrice: {
    marginTop: 7,
    color: palette.green,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '800',
  },
  packageLimits: {
    marginTop: 9,
    color: palette.muted,
    textAlign: 'right',
    fontSize: 13,
  },
  packageManagementGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 16,
  },
  packageManageCard: {
    flexGrow: 1,
    flexBasis: 300,
    maxWidth: 430,
    minHeight: 290,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.border,
    borderTopWidth: 4,
    borderTopColor: palette.green,
    backgroundColor: palette.card,
    padding: 20,
  },
  packageDisabledCard: {
    opacity: 0.68,
    borderTopColor: palette.muted,
  },
  packageManageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
  },
  packageManageTitle: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 10,
  },
  packageManagePrice: {
    marginTop: 18,
    color: palette.greenDark,
    textAlign: 'right',
    fontSize: 24,
    fontWeight: '900',
  },
  packageDuration: {
    marginTop: 5,
    color: palette.muted,
    textAlign: 'right',
    fontSize: 13,
  },
  packageLimitsGrid: {
    marginTop: 18,
    flexDirection: 'row-reverse',
    gap: 8,
  },
  packageLimitItem: {
    flex: 1,
    minHeight: 66,
    borderRadius: 8,
    backgroundColor: palette.graySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  packageLimitValue: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  packageLimitLabel: {
    marginTop: 3,
    color: palette.muted,
    fontSize: 12,
  },
  packageEditButton: {
    marginTop: 18,
    minHeight: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.green,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  packageEditText: {
    color: palette.greenDark,
    fontSize: 14,
    fontWeight: '800',
  },
  tableCell: {
    flex: 1,
    color: palette.ink,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
  },
  productEntity: {
    flex: 1.25,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  rowActionsWide: {
    width: 170,
    gap: 10,
  },
  acceptButton: {
    height: 38,
    borderRadius: 19,
    backgroundColor: palette.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  rejectButton: {
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: palette.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectText: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  thumbnailStack: {
    width: 94,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconActions: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.redSoft,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reelsGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 30,
  },
  reelCard: {
    width: 220,
    height: 260,
    borderRadius: 18,
    backgroundColor: palette.card,
    overflow: 'hidden',
    shadowColor: '#0A1F17',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  reelImage: {
    width: '100%',
    height: 185,
    resizeMode: 'cover',
  },
  reelStatus: {
    position: 'absolute',
    right: 12,
    top: 152,
    minWidth: 70,
    borderRadius: 16,
    backgroundColor: palette.greenSoft,
    paddingVertical: 6,
    alignItems: 'center',
  },
  reelStatusText: {
    color: palette.greenDark,
    fontSize: 12,
    fontWeight: '800',
  },
  reelDuration: {
    position: 'absolute',
    left: 12,
    top: 152,
    borderRadius: 14,
    backgroundColor: '#00000066',
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  reelDurationText: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  reelMeta: {
    padding: 12,
    gap: 8,
  },
  reelTitle: {
    color: palette.ink,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '800',
  },
  reelViews: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dotsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFFAA',
  },
  dotsText: {
    color: '#66717C',
    fontSize: 24,
    lineHeight: 24,
    fontWeight: '900',
  },
  switchTrack: {
    width: 58,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#D8D8D8',
    padding: 3,
    justifyContent: 'center',
  },
  switchTrackActive: {
    backgroundColor: palette.green,
  },
  switchDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  switchDotActive: {
    alignSelf: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#071B1788',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 680,
    maxHeight: '92%',
    borderRadius: 8,
    backgroundColor: palette.card,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
  },
  modalHeader: {
    minHeight: 68,
    paddingHorizontal: 22,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    color: palette.ink,
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'right',
  },
  modalClose: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: palette.graySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    flexShrink: 1,
  },
  modalBody: {
    padding: 22,
    gap: 17,
  },
  formField: {
    flex: 1,
    minWidth: 0,
    gap: 8,
  },
  formLabel: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
  },
  formSectionTitle: {
    color: palette.greenDark,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'right',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  formInput: {
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD4D1',
    backgroundColor: '#FFFFFF',
    color: palette.ink,
    fontSize: 15,
    paddingHorizontal: 14,
    writingDirection: 'rtl',
  },
  uploadRow: {
    minHeight: 58,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD4D1',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 14,
  },
  uploadButtonText: {
    color: palette.greenDark,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  uploadValue: {
    color: palette.muted,
    fontSize: 12,
    textAlign: 'right',
    writingDirection: 'ltr',
  },
  formTextArea: {
    minHeight: 92,
    paddingTop: 13,
    textAlignVertical: 'top',
  },
  formColumns: {
    flexDirection: 'row-reverse',
    gap: 14,
  },
  choiceRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
  },
  choiceButton: {
    minHeight: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD4D1',
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceButtonActive: {
    borderColor: palette.green,
    backgroundColor: palette.greenSoft,
  },
  choiceText: {
    color: palette.greenMid,
    fontSize: 14,
    fontWeight: '700',
  },
  choiceTextActive: {
    color: palette.greenDark,
    fontWeight: '900',
  },
  formError: {
    borderRadius: 8,
    backgroundColor: palette.redSoft,
    color: palette.red,
    padding: 12,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '800',
  },
  modalFooter: {
    minHeight: 72,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  saveButton: {
    minWidth: 130,
    minHeight: 46,
    borderRadius: 8,
    backgroundColor: palette.green,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  cancelButton: {
    minWidth: 100,
    minHeight: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD4D1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  grayAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#D2D2D2',
  },
  grayAvatarSmall: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#D2D2D2',
  },
  tableHorizontalScroll: {
    alignSelf: 'stretch',
  },
  customerTable: {
    minWidth: 980,
  },
  customerRow: {
    minHeight: 86,
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
    paddingHorizontal: 22,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 18,
  },
  customerEntity: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },
  customerNameColumn: { width: 230, flex: 0 },
  customerRoleColumn: { width: 170, flex: 0 },
  customerPhoneColumn: { width: 170, flex: 0 },
  customerStatusColumn: { width: 140, flex: 0, alignItems: 'center' },
  customerActionColumn: { width: 130, flex: 0, alignItems: 'center' },
  reviewTable: {
    minWidth: 1180,
  },
  reviewProductColumn: { width: 210, flex: 0 },
  reviewUserColumn: { width: 190, flex: 0 },
  reviewDateColumn: { width: 130, flex: 0 },
  reviewRatingColumn: { width: 130, flex: 0 },
  reviewCommentColumn: { width: 250, flex: 0 },
  reviewActionColumn: { width: 130, flex: 0 },
  reviewRow: {
    minHeight: 118,
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
    paddingHorizontal: 22,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 18,
  },
  reviewActions: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  reviewApproveButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: palette.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewRejectButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.red,
    backgroundColor: palette.redSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewComment: {
    color: palette.ink,
    textAlign: 'right',
    fontSize: 16,
  },
  starsText: {
    color: palette.amber,
    fontSize: 20,
    textAlign: 'center',
  },
  packageActiveRow: {
    minHeight: 64,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 18,
  },
  paymentsTables: {
    flexDirection: 'row',
    gap: 22,
  },
  paymentTable: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.card,
    padding: 20,
  },
  paymentRow: {
    minHeight: 68,
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 14,
  },
  settingsEmpty: {
    minHeight: 360,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.card,
    padding: 32,
    alignItems: 'flex-end',
  },
  mutedText: {
    marginTop: 12,
    color: palette.muted,
    textAlign: 'right',
    fontSize: 16,
  },
  mobileNav: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    backgroundColor: palette.card,
  },
  mobileNavItem: {
    minHeight: 38,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: palette.greenSoft,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  mobileNavActive: {
    backgroundColor: palette.green,
  },
  mobileNavText: {
    color: palette.green,
    fontSize: 12,
    fontWeight: '800',
  },
  mobileNavTextActive: {
    color: '#FFFFFF',
  },
});
