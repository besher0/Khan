import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import * as Icons from '../../../icons';
import giftBoxImage from '../../../assets/gift-box.jpg';
import phoneWatchImage from '../../../assets/phone-watch.jpg';
import shoeImage from '../../../assets/shoe.jpg';
import cupImage from '../../../assets/cup.jpg';
import fashionImage from '../../../assets/fashion.jpg';
import { adminApi, authApi, merchantApi } from '../../services/api';

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
  ['orders', 'الطلبات', Icons.ShoppingBag],
  ['products', 'المنتجات', Icons.Package],
  ['reels', 'الريلز', Icons.Video],
  ['offers', 'العروض والكوبونات', Icons.Ticket],
  ['customers', 'العملاء والتقييمات', Icons.Users],
  ['payments', 'الأرباح والمدفوعات', Icons.Banknote],
  ['settings', 'الإعدادات', Icons.Settings],
];

const productImages = [giftBoxImage, phoneWatchImage, shoeImage, cupImage, fashionImage];

const fallbackData = {
  stores: [
    { id: 'store-1', name: 'متجر الأناقة', status: 'APPROVED', owner: { firstName: 'محمد', lastName: 'أحمد' } },
  ],
  orders: [
    { id: 'order-1', number: '#21345', customerName: 'أحمد الحسين', customerPhone: '093443233', city: 'حلب', addressLine: 'الفرقان', total: 120300, status: 'PREPARING', items: [{ id: '1' }, { id: '2' }, { id: '3' }] },
    { id: 'order-2', number: '#21346', customerName: 'سارة محمد', customerPhone: '0942345332', city: 'دمشق', addressLine: 'المالكي', total: 90500, status: 'PENDING', items: [{ id: '4' }] },
    { id: 'order-3', number: '#21347', customerName: 'رامي علي', customerPhone: '099222444', city: 'حمص', addressLine: 'الإنشاءات', total: 210000, status: 'OUT_FOR_DELIVERY', items: [{ id: '5' }, { id: '6' }] },
    { id: 'order-4', number: '#21348', customerName: 'مها حسن', customerPhone: '0987654321', city: 'اللاذقية', addressLine: 'المشروع', total: 45000, status: 'CANCELLED', items: [{ id: '7' }] },
  ],
  products: [
    { id: 'product-1', name: 'حذاء تريندي', category: { name: 'أزياء' }, price: 50000, stock: 24, status: 'ACTIVE', image: shoeImage, sales: 2345 },
    { id: 'product-2', name: 'مجموعة هدايا', category: { name: 'هدايا' }, price: 75000, stock: 18, status: 'ACTIVE', image: giftBoxImage, sales: 1840 },
    { id: 'product-3', name: 'ساعة وسماعات', category: { name: 'إلكتروني' }, price: 121000, stock: 6, status: 'DRAFT', image: phoneWatchImage, sales: 970 },
    { id: 'product-4', name: 'كوب حراري', category: { name: 'منزلي' }, price: 42000, stock: 0, status: 'OUT_OF_STOCK', image: cupImage, sales: 650 },
  ],
  coupons: [
    { id: 'coupon-1', code: 'KHAN10', type: 'PERCENT', value: 20, usedCount: 123, status: 'ACTIVE', endsAt: '2026-12-02' },
    { id: 'coupon-2', code: 'SAVE50', type: 'FIXED', value: 50000, usedCount: 32, status: 'ACTIVE', endsAt: '2026-12-02' },
  ],
  reels: [
    { id: 'reel-1', title: 'شاحن يوغر', status: 'ACTIVE', thumbnailUrl: null, product: { name: 'ساعة وسماعات' } },
    { id: 'reel-2', title: 'عرض الهدايا', status: 'ACTIVE', thumbnailUrl: null, product: { name: 'مجموعة هدايا' } },
    { id: 'reel-3', title: 'حذاء تريندي', status: 'DRAFT', thumbnailUrl: null, product: { name: 'حذاء تريندي' } },
  ],
  payments: [
    { id: 'payment-1', amount: 3432, status: 'PAID', method: 'CASH', createdAt: '2026-02-20', order: { number: '#21345' } },
    { id: 'payment-2', amount: 5430, status: 'PENDING', method: 'SHAM_CASH', createdAt: '2026-02-20', order: { number: '#21346' } },
  ],
  users: [
    { id: 'user-1', firstName: 'أحمد', lastName: 'الحسين', phone: '0942345332', email: 'ahmad@example.com', status: 'ACTIVE', role: 'CUSTOMER' },
    { id: 'user-2', firstName: 'سارة', lastName: 'محمد', phone: '093443233', email: 'sara@example.com', status: 'ACTIVE', role: 'CUSTOMER' },
  ],
  reviews: [
    { id: 'review-1', rating: 5, comment: 'جودة ممتازة جدا وخصومات رائعة.', status: 'APPROVED', createdAt: '2026-02-22', user: { firstName: 'اسم', lastName: 'الزبون' }, product: { name: 'المنتج' } },
    { id: 'review-2', rating: 4, comment: 'تجربة جيدة والتوصيل سريع.', status: 'PENDING', createdAt: '2026-02-22', user: { firstName: 'رامي', lastName: 'علي' }, product: { name: 'مجموعة هدايا' } },
  ],
  deliveryEvents: [],
  wallet: {
    transactions: [
      { id: 'wallet-1', amount: 3432, status: 'AVAILABLE', type: 'SALE', description: 'دفعة طلب #21345', createdAt: '2026-02-20' },
      { id: 'wallet-2', amount: 1200, status: 'PENDING', type: 'PAYOUT', description: 'عملية سحب', createdAt: '2026-02-20' },
    ],
    totals: [{ status: 'AVAILABLE', _sum: { amount: 3432 } }],
  },
};

const emptyRemoteData = {
  stores: [],
  orders: [],
  products: [],
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
  if (!value) return '12/2/2026';
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
  return [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'محمد أحمد';
}

function remoteImage(url, fallback) {
  if (!url) return fallback;
  if (url.startsWith('http')) return { uri: url };
  return fallback;
}

function getProductImage(item, index = 0) {
  return item?.image || remoteImage(item?.images?.[0]?.url || item?.product?.images?.[0]?.url || item?.thumbnailUrl, productImages[index % productImages.length]);
}

function getDashboardSectionFromPath() {
  if (typeof window === 'undefined' || !window.location?.pathname) return 'overview';
  const section = window.location.pathname.replace(/\/+$/, '').split('/').pop();
  return navItems.some(([key]) => key === section) ? section : 'overview';
}

function setDashboardSectionPath(section) {
  if (typeof window === 'undefined' || !window.location?.pathname || !window.history?.pushState) return;
  const nextPath = section === 'overview' ? '/dashboard' : `/dashboard/${section}`;
  if (window.location.pathname !== nextPath) window.history.pushState({}, '', nextPath);
}

function Icon({ glyph: Glyph, color = palette.green, size = 22 }) {
  const Fallback = Icons.Circle || Icons.Dot;
  const Component = Glyph || Fallback;
  return <Component size={size} color={color} strokeWidth={2} />;
}

function Sidebar({ active, onChange }) {
  return (
    <View style={styles.sidebar}>
      <View style={styles.logoBlock}>
        <Text style={styles.logoText}>خان</Text>
        <Text style={styles.logoSub}>K H A N</Text>
      </View>
      <View style={styles.navList}>
        {navItems.map(([key, label, glyph]) => {
          const selected = key === active;
          return (
            <TouchableOpacity
              key={key}
              style={[styles.navItem, selected && styles.navItemActive]}
              onPress={() => onChange(key)}
            >
              <Icon glyph={glyph} color="#DDF4EE" size={23} />
              <Text style={[styles.navText, selected && styles.navTextActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.supportLine} />
      <TouchableOpacity style={styles.supportItem}>
        <Icon glyph={Icons.Headphones} color="#DDF4EE" size={24} />
        <Text style={styles.navText}>مركز المساعدة</Text>
      </TouchableOpacity>
    </View>
  );
}

function Topbar({ session, onRefresh, loading }) {
  return (
    <View style={styles.topbar}>
      <View style={styles.userBox}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>م</Text>
        </View>
        <View>
          <Text style={styles.userName}>{displayName(session?.user) || 'محمد أحمد'}</Text>
          <Text style={styles.userRole}>مدير الأناقة</Text>
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

function ActionDots() {
  return (
    <TouchableOpacity style={styles.dotsButton}>
      <Text style={styles.dotsText}>•••</Text>
    </TouchableOpacity>
  );
}

function SwitchControl({ active = true }) {
  return (
    <View style={[styles.switchTrack, active && styles.switchTrackActive]}>
      <View style={[styles.switchDot, active && styles.switchDotActive]} />
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

function FilterRow({ primaryLabel, filterLabel = 'الأحدث', children }) {
  return (
    <View style={styles.filterRow}>
      {primaryLabel ? (
        <TouchableOpacity style={styles.primaryButton}>
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

function ChartCard() {
  const points = [28, 48, 39, 70, 96, 78, 38];
  const labels = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
  return (
    <View style={styles.chartCard}>
      <View style={styles.panelHeader}>
        <TouchableOpacity style={styles.smallFilter}>
          <Icon glyph={Icons.ChevronDown} color={palette.green} size={16} />
          <Text style={styles.smallFilterText}>يومي</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.panelTitle}>المبيعات</Text>
          <Text style={styles.panelNumber}>2,334,000 ل.س</Text>
        </View>
      </View>
      <View style={styles.chartArea}>
        {points.map((height, index) => (
          <View key={labels[index]} style={styles.chartColumn}>
            <View style={[styles.chartBarSoft, { height: Math.max(20, height - 18) }]} />
            <View style={[styles.chartBar, { height }]} />
            <Text style={styles.chartLabel}>{labels[index]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function DonutCard() {
  return (
    <View style={styles.donutCard}>
      <Text style={styles.panelTitle}>أداء المتجر</Text>
      <View style={styles.donutOuter}>
        <View style={styles.donutGap} />
        <View style={styles.donutInner}>
          <Text style={styles.donutPercent}>95%</Text>
          <Text style={styles.donutCaption}>معدل رضا العملاء</Text>
        </View>
      </View>
      <View style={styles.starsRow}>
        <Text style={styles.ratingText}>4.5</Text>
        {[0, 1, 2, 3, 4].map((item) => <Text key={item} style={styles.star}>★</Text>)}
      </View>
      <TouchableOpacity style={styles.outlineButton}>
        <Text style={styles.outlineButtonText}>عرض جميع التقييمات</Text>
      </TouchableOpacity>
    </View>
  );
}

function ProductThumb({ source, size = 58 }) {
  return <Image source={source} style={[styles.productThumb, { width: size, height: size, borderRadius: Math.min(16, size / 4) }]} />;
}

function OverviewView({ data }) {
  const totalSales = data.orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  return (
    <>
      <View style={styles.statsGrid}>
        <StatCard label="مبيعات" value={formatNumber(totalSales || 2334000)} hint="زيادة نمو" delta="+23%" icon={Icons.Banknote} />
        <StatCard label="زائر" value="12,334" hint="زيادة نمو" delta="+8" icon={Icons.Users} />
        <StatCard label="طلب" value={String(data.orders.length || 432)} hint="زيادة نمو" delta="+23%" icon={Icons.Package} />
        <StatCard label="منتج" value={String(data.products.length || 123)} hint="منتجات جديدة" delta="+8" icon={Icons.ShoppingBag} />
      </View>
      <View style={styles.overviewGrid}>
        <View style={styles.latestOrdersCard}>
          <View style={styles.panelHeader}>
            <TouchableOpacity><Text style={styles.linkText}>عرض الكل</Text></TouchableOpacity>
            <Text style={styles.panelTitle}>أحدث الطلبات</Text>
          </View>
          {data.orders.slice(0, 4).map((order, index) => (
            <View key={order.id || index} style={styles.miniOrderRow}>
              <View>
                <Text style={styles.moneySmall}>{formatSyp(order.total)}</Text>
                <Text style={styles.mutedSmall}>منذ 10 دقائق</Text>
              </View>
              <StatusPill status={order.status} />
              <View style={styles.orderCustomer}>
                <View>
                  <Text style={styles.entityName}>{order.customerName || 'أحمد الحسين'}</Text>
                  <Text style={styles.mutedSmall}>{order.number || '#21345'}</Text>
                </View>
                <ProductThumb source={productImages[index % productImages.length]} size={52} />
              </View>
            </View>
          ))}
        </View>
        <ChartCard />
        <DonutCard />
      </View>
      <View style={styles.bestProducts}>
        <View style={styles.panelHeader}>
          <TouchableOpacity><Text style={styles.linkText}>عرض الكل</Text></TouchableOpacity>
          <Text style={styles.panelTitle}>منتجاتك الأكثر مبيعا</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bestProductsList}>
          {data.products.slice(0, 5).map((product, index) => (
            <View key={product.id || index} style={styles.bestProductCard}>
              <Image source={getProductImage(product, index)} style={styles.bestProductImage} />
              <View style={styles.bestProductInfo}>
                <Text style={styles.bestProductName}>{product.name || 'حذاء تريندي'}</Text>
                <Text style={styles.salesText}>{product.sales || 2345} مبيع</Text>
                <Text style={styles.priceText}>{formatSyp(product.price || 50000)}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </>
  );
}

function OrdersView({ data }) {
  return (
    <>
      <View style={styles.statsGrid}>
        <StatCard label="جديد" value={String(data.orders.filter((o) => o.status === 'PENDING').length || 4)} hint="زيادة نمو" delta="+23%" icon={Icons.Package} />
        <StatCard label="قيد التحضير" value={String(data.orders.filter((o) => o.status === 'PREPARING').length || 2)} hint="منتجات متوقفة" delta="+8" icon={Icons.Clock3} tone="purple" />
        <StatCard label="قيد التوصيل" value="34" hint="أقل" delta="+8" icon={Icons.Truck} tone="amber" />
        <StatCard label="مكتمل" value="4" hint="زيادة نمو" delta="+23%" icon={Icons.CircleCheck} tone="red" />
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
        {data.orders.map((order, index) => (
          <View key={order.id || index} style={styles.orderRow}>
            <View style={styles.rowActionsWide}>
              <TouchableOpacity style={styles.acceptButton}><Text style={styles.acceptText}>قبول الطلب</Text></TouchableOpacity>
              <TouchableOpacity style={styles.rejectButton}><Text style={styles.rejectText}>رفض</Text></TouchableOpacity>
            </View>
            <Text style={styles.tableCell}>{order.customerPhone || '093443233'}</Text>
            <Text style={styles.tableCell}>{order.items?.length || 3} منتجات</Text>
            <View style={styles.thumbnailStack}>
              {[0, 1, 2].map((item) => <ProductThumb key={item} source={productImages[(index + item) % productImages.length]} size={34} />)}
            </View>
            <Text style={styles.tableCell}>{formatSyp(order.total || 120300)}</Text>
            <StatusPill status={order.status} />
            <View style={styles.orderCustomer}>
              <View>
                <Text style={styles.entityName}>{order.customerName || 'أحمد الحسين'}</Text>
                <Text style={styles.mutedSmall}>{order.number || '#21345'}</Text>
              </View>
              <ProductThumb source={productImages[index % productImages.length]} size={54} />
            </View>
          </View>
        ))}
      </View>
    </>
  );
}

function ProductsView({ data }) {
  return (
    <>
      <View style={styles.statsGrid}>
        <StatCard label="منتج" value={String(data.products.length || 4)} hint="زيادة نمو" delta="+23%" icon={Icons.Package} />
        <StatCard label="نفدت الكمية" value="4" hint="زيادة نمو" delta="+23%" icon={Icons.CircleX} tone="red" />
        <StatCard label="منخفضة المخزون" value="34" hint="أقل" delta="+8" icon={Icons.TriangleAlert} tone="amber" />
        <StatCard label="متوقفة" value="2" hint="منتجات متوقفة" delta="+8" icon={Icons.Clock3} tone="purple" />
      </View>
      <HeaderTabs
        active="all"
        onChange={() => {}}
        tabs={[
          { key: 'all', label: `الكل ${data.products.length || 234}` },
          { key: 'active', label: 'منشور 123' },
          { key: 'draft', label: 'مسودة 13' },
          { key: 'stop', label: 'متوقف 3' },
        ]}
      />
      <FilterRow primaryLabel="إضافة منتج جديد" filterLabel="جميع الفئات" />
      <View style={styles.tableCard}>
        <View style={styles.tableHeader}>
          {['المنتج', 'الفئة', 'السعر', 'المخزون', 'الحالة', 'الإجراءات'].map((item) => <Text key={item} style={styles.tableHeaderText}>{item}</Text>)}
        </View>
        {data.products.map((product, index) => (
          <View key={product.id || index} style={styles.productRow}>
            <View style={styles.productEntity}>
              <ProductThumb source={getProductImage(product, index)} size={56} />
              <View>
                <Text style={styles.entityName}>{product.name || 'المنتج'}</Text>
                <Text style={styles.mutedSmall}>#{product.id?.slice?.(0, 5) || '21345'}</Text>
              </View>
            </View>
            <Text style={styles.tableCell}>{product.category?.name || 'إلكتروني'}</Text>
            <Text style={styles.tableCell}>{formatSyp(product.price || 121000)}</Text>
            <Text style={styles.tableCell}>{product.stock ?? 24} قطعة</Text>
            <StatusPill status={product.status} />
            <View style={styles.iconActions}>
              <Icon glyph={Icons.Eye} color={palette.greenDark} size={22} />
              <Icon glyph={Icons.Trash2} color={palette.greenDark} size={22} />
              <Icon glyph={Icons.Pencil} color={palette.greenDark} size={22} />
            </View>
          </View>
        ))}
      </View>
    </>
  );
}

function ReelsView({ data }) {
  const reels = data.reels.length ? data.reels : fallbackData.reels;
  return (
    <>
      <HeaderTabs active="all" onChange={() => {}} tabs={[{ key: 'all', label: 'الكل 234' }, { key: 'active', label: 'منشور 123' }, { key: 'draft', label: 'مسودة 13' }, { key: 'deleted', label: 'محذوف 3' }]} />
      <FilterRow primaryLabel="رفع ريلز جديد" filterLabel="الأحدث" />
      <View style={styles.reelsGrid}>
        {Array.from({ length: 12 }).map((_, index) => {
          const reel = reels[index % reels.length];
          return (
            <View key={`${reel.id}-${index}`} style={styles.reelCard}>
              <Image source={getProductImage(reel, index + 1)} style={styles.reelImage} />
              <ActionDots />
              <View style={styles.reelStatus}><Text style={styles.reelStatusText}>منشور</Text></View>
              <View style={styles.reelDuration}><Text style={styles.reelDurationText}>00:12</Text></View>
              <View style={styles.reelMeta}>
                <Text style={styles.reelTitle}>{reel.title || 'شاحن يوغر'}</Text>
                <View style={styles.reelViews}><Icon glyph={Icons.Play} color={palette.muted} size={16} /><Text style={styles.mutedSmall}>12.3 k</Text></View>
              </View>
            </View>
          );
        })}
      </View>
    </>
  );
}

function OffersView({ data }) {
  const [tab, setTab] = useState('offers');
  const rows = data.coupons.length ? data.coupons : fallbackData.coupons;
  return (
    <>
      <HeaderTabs active={tab} onChange={setTab} tabs={[{ key: 'offers', label: 'المنتج' }, { key: 'coupons', label: 'الكوبونات' }]} />
      <FilterRow primaryLabel="إضافة" filterLabel="الأحدث" />
      <View style={styles.tableCard}>
        <View style={styles.tableHeader}>
          {(tab === 'offers' ? ['العرض', 'تاريخ الانتهاء', 'الطلبات', 'نسبة الخصم', 'الحالة', 'الإجراءات'] : ['الكوبون', 'تاريخ الانتهاء', 'قيمة الخصم', 'الاستخدام', 'الحالة', 'الإجراءات']).map((item) => <Text key={item} style={styles.tableHeaderText}>{item}</Text>)}
        </View>
        {rows.concat(rows).slice(0, 6).map((coupon, index) => (
          <View key={`${coupon.id}-${index}`} style={styles.productRow}>
            <View style={styles.productEntity}>
              {tab === 'offers' ? <ProductThumb source={giftBoxImage} size={58} /> : <Icon glyph={Icons.Copy} color={palette.green} size={24} />}
              <View>
                <Text style={styles.entityName}>{tab === 'offers' ? 'العرض' : coupon.code}</Text>
                <Text style={styles.mutedSmall}>{tab === 'offers' ? `خصم ${coupon.value || 20}%` : 'اضغط للنسخ'}</Text>
              </View>
            </View>
            <Text style={styles.tableCell}>{formatDate(coupon.endsAt)}</Text>
            <Text style={styles.tableCell}>{tab === 'offers' ? 32 : `${coupon.value || 20}%`}</Text>
            <Text style={styles.tableCell}>{tab === 'offers' ? `${coupon.value || 20}%` : `${coupon.usedCount || 123} مرة`}</Text>
            <StatusPill status={coupon.status || 'ACTIVE'} />
            <View style={styles.iconActions}><SwitchControl /><ActionDots /></View>
          </View>
        ))}
      </View>
    </>
  );
}

function CustomersView({ data }) {
  const [tab, setTab] = useState('customers');
  const users = data.users.length ? data.users : fallbackData.users;
  const reviews = data.reviews.length ? data.reviews : fallbackData.reviews;
  return (
    <>
      <HeaderTabs active={tab} onChange={setTab} tabs={[{ key: 'customers', label: 'العملاء' }, { key: 'reviews', label: 'التقييمات' }]} />
      {tab === 'customers' ? (
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            {['العميل', 'الرقم', 'إجمالي الطلبات', 'الإنفاق', 'الحالة', 'الإجراءات'].map((item) => <Text key={item} style={styles.tableHeaderText}>{item}</Text>)}
          </View>
          {users.concat(users).slice(0, 6).map((user, index) => (
            <View key={`${user.id}-${index}`} style={styles.productRow}>
              <View style={styles.productEntity}>
                <View style={styles.grayAvatar} />
                <Text style={styles.entityName}>{displayName(user)}</Text>
              </View>
              <Text style={styles.tableCell}>{user.phone || '0942345332'}</Text>
              <Text style={styles.tableCell}>32</Text>
              <Text style={styles.tableCell}>3,432 $</Text>
              <StatusPill status={user.status || 'ACTIVE'} />
              <View style={styles.iconActions}><SwitchControl /><ActionDots /></View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.tableCard}>
          {reviews.concat(reviews).slice(0, 6).map((review, index) => (
            <View key={`${review.id}-${index}`} style={styles.reviewRow}>
              <ActionDots />
              <Text style={styles.reviewComment}>{review.comment || 'جودة ممتازة جدا وخصومات رائعة.'}</Text>
              <Text style={styles.starsText}>{'★'.repeat(review.rating || 5)}</Text>
              <Text style={styles.tableCell}>{formatDate(review.createdAt)}</Text>
              <View style={styles.productEntity}>
                <View style={styles.grayAvatar} />
                <Text style={styles.entityName}>{displayName(review.user)}</Text>
              </View>
              <View style={styles.productEntity}>
                <ProductThumb source={giftBoxImage} size={58} />
                <Text style={styles.entityName}>{review.product?.name || 'المنتج'}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </>
  );
}

function PaymentsView({ data }) {
  const payments = data.payments.length ? data.payments : fallbackData.payments;
  return (
    <>
      <View style={styles.statsGrid}>
        <StatCard label="منتج" value={String(data.products.length || 4)} hint="زيادة نمو" delta="+23%" icon={Icons.Package} />
        <StatCard label="نفدت الكمية" value="4" hint="زيادة نمو" delta="+23%" icon={Icons.CircleX} tone="red" />
        <StatCard label="منخفضة المخزون" value="34" hint="أقل" delta="+8" icon={Icons.TriangleAlert} tone="amber" />
        <StatCard label="متوقفة" value="2" hint="منتجات متوقفة" delta="+8" icon={Icons.Clock3} tone="purple" />
      </View>
      <View style={styles.paymentsGrid}>
        <ChartCard />
        <View style={styles.profitCard}>
          <Text style={styles.panelTitle}>توزيع الأرباح</Text>
          <View style={styles.profitRing}>
            <Text style={styles.profitNumber}>2,334,000</Text>
            <Text style={styles.profitCurrency}>ل.س</Text>
          </View>
          <View style={styles.legendGrid}>
            {['المنتجات', 'الشحن', 'العروض', 'كوبونات'].map((item, index) => (
              <View key={item} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: [palette.green, '#939AA4', palette.red, palette.blue][index] }]} />
                <Text style={styles.mutedSmall}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
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
      {payments.concat(payments).slice(0, 5).map((payment, index) => (
        <View key={`${payment.id}-${index}`} style={styles.paymentRow}>
          <Text style={styles.tableCell}>{formatDate(payment.createdAt)}</Text>
          <Text style={styles.tableCell}>{payment.amount?.toLocaleString?.() || '3,432'} $</Text>
          <Text style={styles.tableCell}>{payment.method === 'SHAM_CASH' ? 'شام كاش' : 'كاش'}</Text>
          <StatusPill status={payment.status} />
        </View>
      ))}
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
  const [session, setSession] = useState(() => authApi.getSession('admin') || authApi.getSession('merchant'));
  const [data, setData] = useState(fallbackData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usingFallback, setUsingFallback] = useState(true);

  const selectSection = (section) => {
    setActive(section);
    setDashboardSectionPath(section);
  };

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const adminSession = await authApi.ensureAdminSession();
      setSession(adminSession);

      const merchantSessionPromise = authApi.ensureMerchantSession().catch(() => null);
      const [
        stores,
        orders,
        payments,
        users,
        reviews,
        deliveryEvents,
        merchantSession,
      ] = await Promise.all([
        adminApi.stores(),
        adminApi.orders(),
        adminApi.payments(),
        adminApi.users(),
        adminApi.reviews(),
        adminApi.deliveryEvents(),
        merchantSessionPromise,
      ]);

      if (merchantSession) authApi.setSession(merchantSession, 'merchant');
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
        orders,
        payments,
        users,
        reviews,
        deliveryEvents,
        products: products.length ? products : fallbackData.products,
        coupons: coupons.length ? coupons : fallbackData.coupons,
        reels: reels.length ? reels : fallbackData.reels,
        wallet: wallet || fallbackData.wallet,
      });
      setUsingFallback(false);
    } catch (loadError) {
      setData(fallbackData);
      setUsingFallback(true);
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handlePopState = () => setActive(getDashboardSectionFromPath());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const contentBySection = {
    overview: <OverviewView data={data} />,
    orders: <OrdersView data={data} />,
    products: <ProductsView data={data} />,
    reels: <ReelsView data={data} />,
    offers: <OffersView data={data} />,
    customers: <CustomersView data={data} />,
    payments: <PaymentsView data={data} />,
    settings: <SettingsView />,
  };
  const content = contentBySection[active] || contentBySection.overview;

  return (
    <View style={[styles.shell, compact && styles.shellCompact]}>
      {!compact ? <Sidebar active={active} onChange={selectSection} /> : null}
      <View style={styles.main}>
        <Topbar session={session} onRefresh={loadDashboard} loading={loading} />
        {compact ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mobileNav}>
            {navItems.map(([key, label, glyph]) => (
              <TouchableOpacity key={key} style={[styles.mobileNavItem, active === key && styles.mobileNavActive]} onPress={() => selectSection(key)}>
                <Icon glyph={glyph} color={active === key ? '#FFFFFF' : palette.green} size={17} />
                <Text style={[styles.mobileNavText, active === key && styles.mobileNavTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : null}
        <ScrollView style={styles.contentScroll} contentContainerStyle={styles.content}>
          {error ? (
            <TouchableOpacity style={styles.errorBox} onPress={loadDashboard}>
              <Text style={styles.errorText}>
                تعذر الاتصال بالباك إند، لذلك نعرض بيانات تجريبية من تصميم لوحة الإدارة. اضغط لإعادة المحاولة.
              </Text>
            </TouchableOpacity>
          ) : null}
          {usingFallback ? (
            <View style={styles.fallbackNotice}>
              <Text style={styles.fallbackText}>وضع المعاينة: الواجهة تعمل، والربط سيتحول تلقائيا للباك عند تشغيله.</Text>
            </View>
          ) : null}
          {content}
        </ScrollView>
      </View>
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
    width: 315,
    backgroundColor: palette.greenDark,
    paddingTop: 52,
    paddingHorizontal: 28,
    paddingBottom: 28,
  },
  logoBlock: {
    alignItems: 'center',
    marginBottom: 54,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 33,
    fontWeight: '900',
    letterSpacing: 0,
  },
  logoSub: {
    color: '#DDEFEA',
    fontSize: 12,
    marginTop: 2,
  },
  navList: {
    gap: 14,
  },
  navItem: {
    minHeight: 62,
    borderRadius: 18,
    paddingHorizontal: 20,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 15,
  },
  navItemActive: {
    backgroundColor: '#FFFFFF24',
  },
  navText: {
    color: '#DDF4EE',
    textAlign: 'right',
    fontSize: 23,
    fontWeight: '600',
  },
  navTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  supportLine: {
    height: 1,
    marginTop: 'auto',
    marginBottom: 34,
    backgroundColor: '#FFFFFF44',
  },
  supportItem: {
    minHeight: 54,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 14,
  },
  main: {
    flex: 1,
    minWidth: 0,
  },
  topbar: {
    minHeight: 126,
    margin: 32,
    marginBottom: 24,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.card,
    paddingHorizontal: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 30,
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
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#D8D8D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: palette.greenDark,
    fontSize: 25,
    fontWeight: '900',
  },
  userName: {
    color: palette.ink,
    textAlign: 'right',
    fontSize: 21,
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
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: palette.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    width: '34%',
    minWidth: 320,
    height: 66,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: '#F7F7F7',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 22,
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
    paddingHorizontal: 32,
    paddingBottom: 42,
    gap: 22,
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
  fallbackNotice: {
    borderRadius: 14,
    backgroundColor: '#E8FAF4',
    padding: 12,
  },
  fallbackText: {
    color: palette.greenDark,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '800',
  },
  statsGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 18,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: 220,
    minHeight: 152,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.card,
    padding: 25,
    shadowColor: '#0A1F17',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  statIcon: {
    position: 'absolute',
    right: 22,
    top: 48,
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    color: palette.ink,
    textAlign: 'left',
    fontSize: 20,
    fontWeight: '700',
  },
  statValue: {
    marginTop: 10,
    color: '#000000',
    textAlign: 'left',
    writingDirection: 'ltr',
    fontSize: 30,
    fontWeight: '900',
  },
  statFooter: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statDelta: {
    fontSize: 28,
    fontWeight: '900',
  },
  statHint: {
    color: palette.muted,
    fontSize: 17,
  },
  overviewGrid: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 22,
  },
  latestOrdersCard: {
    flex: 1.1,
    minWidth: 380,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.card,
    padding: 25,
  },
  chartCard: {
    flex: 1,
    minWidth: 380,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.card,
    padding: 25,
  },
  donutCard: {
    width: 330,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.card,
    padding: 25,
    alignItems: 'center',
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
    fontSize: 22,
    fontWeight: '900',
  },
  panelNumber: {
    marginTop: 10,
    color: palette.ink,
    textAlign: 'right',
    fontSize: 20,
    fontWeight: '900',
  },
  linkText: {
    color: palette.green,
    fontSize: 18,
    fontWeight: '900',
  },
  miniOrderRow: {
    minHeight: 88,
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
    fontSize: 18,
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
  chartArea: {
    height: 210,
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
    paddingTop: 22,
  },
  chartColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  chartBar: {
    width: 9,
    borderRadius: 8,
    backgroundColor: palette.green,
  },
  chartBarSoft: {
    width: 9,
    borderRadius: 8,
    backgroundColor: '#A6ADB8',
  },
  chartLabel: {
    marginTop: 10,
    color: palette.muted,
    fontSize: 12,
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
  donutOuter: {
    width: 178,
    height: 178,
    borderRadius: 89,
    borderWidth: 18,
    borderColor: palette.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  donutGap: {
    position: 'absolute',
    right: -20,
    top: 20,
    width: 52,
    height: 52,
    backgroundColor: palette.card,
  },
  donutInner: {
    width: 116,
    height: 116,
    borderRadius: 58,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.card,
  },
  donutPercent: {
    color: palette.ink,
    fontSize: 24,
    fontWeight: '900',
  },
  donutCaption: {
    color: palette.muted,
    fontSize: 13,
    marginTop: 6,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  star: {
    color: palette.amber,
    fontSize: 24,
  },
  ratingText: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: '900',
    marginRight: 8,
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
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.card,
    padding: 25,
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
    minHeight: 68,
    borderRadius: 18,
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
    minWidth: 150,
    minHeight: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  tabButtonActive: {
    backgroundColor: palette.green,
  },
  tabButtonText: {
    color: palette.ink,
    fontSize: 20,
    fontWeight: '700',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  filterRow: {
    minHeight: 86,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  primaryButton: {
    width: 260,
    minHeight: 68,
    borderRadius: 18,
    backgroundColor: palette.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  filterButton: {
    minWidth: 260,
    minHeight: 68,
    borderRadius: 18,
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
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.card,
    overflow: 'hidden',
  },
  tableHeader: {
    minHeight: 68,
    backgroundColor: '#F3F3F3',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 28,
    gap: 18,
  },
  tableHeaderText: {
    flex: 1,
    color: palette.ink,
    textAlign: 'right',
    fontSize: 17,
    fontWeight: '800',
  },
  orderRow: {
    minHeight: 118,
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 18,
  },
  productRow: {
    minHeight: 108,
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
    paddingHorizontal: 28,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 18,
  },
  tableCell: {
    flex: 1,
    color: palette.ink,
    textAlign: 'center',
    fontSize: 16,
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
  grayAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#D2D2D2',
  },
  reviewRow: {
    minHeight: 118,
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  reviewComment: {
    flex: 1.5,
    color: palette.ink,
    textAlign: 'right',
    fontSize: 16,
  },
  starsText: {
    flex: 0.7,
    color: palette.amber,
    fontSize: 20,
    textAlign: 'center',
  },
  paymentsGrid: {
    flexDirection: 'row',
    gap: 22,
  },
  profitCard: {
    flex: 1,
    minWidth: 360,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.card,
    padding: 25,
    alignItems: 'center',
  },
  profitRing: {
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 22,
    borderColor: palette.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
  },
  profitNumber: {
    color: palette.ink,
    fontSize: 25,
    fontWeight: '900',
  },
  profitCurrency: {
    marginTop: 8,
    color: palette.ink,
    fontSize: 22,
    fontWeight: '900',
  },
  legendGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
  },
  legendItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 3,
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
