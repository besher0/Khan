import { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import * as Icons from '../../../icons';
import { adminApi, authApi, catalogApi, merchantApi, uploadsApi } from '../../services/api';
import { KhanWordmark } from '../../components/KhanLogo';
import CreateEntityModal from './components/CreateEntityModal';
import { Icon, ProductThumb, SwitchControl } from './components/DashboardComponents';
import BannersView from './views/BannersView';
import CategoriesView from './views/CategoriesView';
import CustomersView from './views/CustomersView';
import OffersView from './views/OffersView';
import OverviewView from './views/OverviewView';
import OrdersView from './views/OrdersView';
import PackagesView from './views/PackagesView';
import PaymentsView from './views/PaymentsView';
import ProductsView from './views/ProductsView';
import ReelsView from './views/ReelsView';
import SettingsView from './views/SettingsView';
import StoresView from './views/StoresView';
import {
  formatSyp,
  remoteImage,
} from './dashboardUtils';
import { palette, styles } from './dashboardStyles';

const navItems = [
  ['overview', 'الصفحة الرئيسية', Icons.Home],
  ['stores', 'المتاجر والباقات', Icons.Store],
  ['packages', 'إدارة الباقات', Icons.BadgeCheck],
  ['orders', 'الطلبات', Icons.ShoppingBag],
  ['products', 'المنتجات', Icons.Package],
  ['categories', 'الأقسام', Icons.FolderTree],
  ['banners', 'بنرات الرئيسية', Icons.Image],
  ['reels', 'الريلز', Icons.Video],
  ['offers', 'العروض والكوبونات', Icons.Ticket],
  ['customers', 'العملاء والتقييمات', Icons.Users],
  ['payments', 'الأرباح والمدفوعات', Icons.Banknote],
  ['settings', 'الإعدادات', Icons.Settings],
];

const emptyRemoteData = {
  stores: [],
  packages: [],
  orders: { items: [], page: 1, limit: 20, total: 0, totalPages: 1, summary: { totalOrders: 0, totalSales: 0, statusCounts: {} } },
  products: [],
  categories: [],
  banners: [],
  coupons: [],
  reels: [],
  payments: { items: [], page: 1, limit: 20, total: 0, totalPages: 1, summary: { statusCounts: {} } },
  users: { items: [], page: 1, limit: 20, total: 0, totalPages: 1 },
  reviews: { items: [], page: 1, limit: 20, total: 0, totalPages: 1 },
  deliveryEvents: [],
  wallet: null,
};

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


function visibleNavItems(mode) {
  return mode === 'merchant' ? navItems.filter(([key]) => !['stores', 'packages', 'banners'].includes(key)) : navItems;
}

function Sidebar({ active, onChange, mode }) {
  return (
    <ScrollView
      style={styles.sidebar}
      contentContainerStyle={styles.sidebarContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.logoBlock}>
        <KhanWordmark variant="mono" width={158} />
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
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingBanner, setEditingBanner] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionBusy, setActionBusy] = useState('');
  const [ordersPage, setOrdersPage] = useState(1);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [walletPage, setWalletPage] = useState(1);

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
          merchantApi.wallet({ page: walletPage, limit: 20 }),
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
      const [stores, packages, orders, payments, users, reviews, deliveryEvents, categories, products, bannerResult] = await Promise.all([
        adminApi.stores(),
        adminApi.packages(),
        adminApi.orders({ page: ordersPage, limit: 20 }),
        adminApi.payments({ page: paymentsPage, limit: 20 }),
        adminApi.users({ page: usersPage, limit: 20 }),
        adminApi.reviews({ page: reviewsPage, limit: 20 }),
        adminApi.deliveryEvents(),
        catalogApi.categories(),
        adminApi.products(),
        adminApi.banners().catch(() => []),
      ]);

      const merchantResults = await Promise.allSettled([
        merchantApi.coupons(),
        merchantApi.reels(),
        merchantApi.wallet({ page: walletPage, limit: 20 }),
      ]);

      const coupons = merchantResults[0].status === 'fulfilled' ? merchantResults[0].value : [];
      const reels = merchantResults[1].status === 'fulfilled' ? merchantResults[1].value : [];
      const wallet = merchantResults[2].status === 'fulfilled' ? merchantResults[2].value : null;

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
        banners: bannerResult,
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
  }, [mode, ordersPage, paymentsPage, usersPage, reviewsPage, walletPage]);

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
      if (createType === 'category') {
        if (editingCategory) await adminApi.updateCategory(editingCategory.id, payload);
        else await adminApi.createCategory(payload);
      }
      if (createType === 'banner') {
        if (editingBanner) await adminApi.updateBanner(editingBanner.id, payload);
        else await adminApi.createBanner(payload);
      }
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
      setEditingCategory(null);
      setEditingBanner(null);
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

  const openCategoryEditor = (category) => {
    setEditingCategory(category);
    setCreateType('category');
  };

  const openBannerEditor = (banner = null) => {
    setEditingBanner(banner);
    setCreateType('banner');
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

  const updateCategoryImage = (categoryId, imageUrl) => runAction(
    `category-${categoryId}`,
    () => adminApi.updateCategory(categoryId, { imageUrl }),
    'تم تحديث صورة القسم.',
  );

  const toggleCoupon = (couponId, status) => runAction(
    `coupon-${couponId}`,
    () => merchantApi.updateCoupon(couponId, { status }),
    status === 'ACTIVE' ? 'تم تفعيل الكوبون.' : 'تم تعطيل الكوبون.',
  );

  const toggleBanner = (banner) => runAction(
    `banner-${banner.id}`,
    () => adminApi.updateBanner(banner.id, { status: banner.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }),
    banner.status === 'ACTIVE' ? 'تم تعطيل البنر.' : 'تم تفعيل البنر.',
  );

  const merchantCanCreate = mode === 'merchant';
  const adminCanCreate = mode === 'admin';
  const changeOrdersPage = (page) => {
    const totalPages = data.orders?.totalPages || 1;
    if (page < 1 || page > totalPages) return;
    setOrdersPage(page);
  };
  const changePaymentsPage = (page) => {
    const totalPages = data.payments?.totalPages || 1;
    if (page < 1 || page > totalPages) return;
    setPaymentsPage(page);
  };
  const changeUsersPage = (page) => {
    const totalPages = data.users?.totalPages || 1;
    if (page < 1 || page > totalPages) return;
    setUsersPage(page);
  };
  const changeReviewsPage = (page) => {
    const totalPages = data.reviews?.totalPages || 1;
    if (page < 1 || page > totalPages) return;
    setReviewsPage(page);
  };
  const changeWalletPage = (page) => {
    const totalPages = data.wallet?.transactions?.totalPages || 1;
    if (page < 1 || page > totalPages) return;
    setWalletPage(page);
  };

  const contentBySection = {
    overview: <OverviewView data={data} />,
    stores: <StoresView data={data} onAdd={() => setCreateType('store')} onAssignPackage={openPackageAssignment} onChangeStatus={changeStoreStatus} />,
    packages: <PackagesView data={data} onAdd={() => openPackageEditor()} onEdit={openPackageEditor} onToggle={togglePackage} actionBusy={actionBusy} />,
    orders: <OrdersView data={data} canManage={adminCanCreate} onStatusChange={changeOrderStatus} actionBusy={actionBusy} onPageChange={changeOrdersPage} />,
    products: <ProductsView data={data} canManage={merchantCanCreate} onAdd={() => setCreateType('product')} onArchive={archiveProduct} actionBusy={actionBusy} />,
    categories: <CategoriesView data={data} canManage={adminCanCreate} onAdd={() => setCreateType('category')} onEdit={openCategoryEditor} onUpdateImage={updateCategoryImage} actionBusy={actionBusy} />,
    banners: <BannersView data={data} canManage={adminCanCreate} onAdd={() => openBannerEditor()} onEdit={openBannerEditor} onToggle={toggleBanner} actionBusy={actionBusy} />,
    reels: <ReelsView data={data} canManage={merchantCanCreate} onAdd={() => setCreateType('reel')} />,
    offers: <OffersView data={data} canManage={merchantCanCreate} onAdd={() => setCreateType('coupon')} onToggleCoupon={toggleCoupon} actionBusy={actionBusy} />,
    customers: <CustomersView data={data} currentUserId={session?.user?.id} onUserStatus={changeUserStatus} onReviewStatus={changeReviewStatus} actionBusy={actionBusy} onUsersPageChange={changeUsersPage} onReviewsPageChange={changeReviewsPage} />,
    payments: <PaymentsView data={data} onPageChange={changePaymentsPage} onWalletPageChange={changeWalletPage} />,
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
        FormField={FormField}
        ChoiceField={ChoiceField}
        UploadField={UploadField}
        ProductThumb={ProductThumb}
        SwitchControl={SwitchControl}
        Icon={Icon}
        onClose={() => {
          if (!saving) {
            setCreateType(null);
            setSelectedStoreId(null);
            setEditingPackage(null);
            setEditingCategory(null);
            setEditingBanner(null);
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
        } : editingCategory ? {
          name: editingCategory.name,
          imageUrl: editingCategory.imageUrl || '',
        } : editingBanner ? {
          title: editingBanner.title,
          subtitle: editingBanner.subtitle || '',
          imageUrl: editingBanner.imageUrl || '',
          ctaLabel: editingBanner.ctaLabel || '',
          targetUrl: editingBanner.targetUrl || '',
          productId: editingBanner.productId || '',
          position: String(editingBanner.position ?? 0),
          status: editingBanner.status || 'ACTIVE',
        } : null}
      />
    </View>
  );
}
