import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import * as Icons from '../../../icons';
import { authApi, merchantApi } from '../../services/api';

const navigation = [
  ['overview', 'نظرة عامة', Icons.LayoutDashboard],
  ['orders', 'الطلبات', Icons.ClipboardList],
  ['products', 'المنتجات', Icons.Package],
  ['coupons', 'الكوبونات', Icons.Ticket],
  ['reels', 'الريلز', Icons.Video],
  ['wallet', 'المحفظة', Icons.Wallet],
];

function formatSyp(value) {
  return `${new Intl.NumberFormat('ar-SY').format(Number(value) || 0)} ل.س`;
}

function Icon({ glyph: Glyph, color = '#179B7D', size = 19 }) {
  const Fallback = Icons.Circle || Icons.Dot;
  const Component = Glyph || Fallback;
  return <Component size={size} color={color} strokeWidth={2} />;
}

function MetricCard({ label, value, detail, glyph }) {
  return (
    <View className="min-w-[168px] flex-1 rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
      <View className="mb-4 h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
        <Icon glyph={glyph} />
      </View>
      <Text className="text-right text-xl font-bold text-ink">{value}</Text>
      <View className="mt-1 flex-row-reverse items-center justify-between gap-3">
        <Text className="text-right text-sm text-muted">{label}</Text>
        <Text className="text-xs font-semibold text-emerald-600">{detail}</Text>
      </View>
    </View>
  );
}

function StatusPill({ children }) {
  return (
    <View className="rounded-full bg-emerald-50 px-3 py-1">
      <Text className="text-xs font-semibold text-brand">{children}</Text>
    </View>
  );
}

function EmptyState({ text }) {
  return (
    <View className="rounded-lg border border-dashed border-slate-200 bg-white p-8">
      <Text className="text-center text-sm text-muted">{text}</Text>
    </View>
  );
}

function Row({ left, middle, right }) {
  return (
    <View className="flex-row-reverse items-center gap-3 border-b border-slate-100 py-4 last:border-b-0">
      <Text className="flex-1 text-right text-sm font-semibold text-ink">{left}</Text>
      <Text className="flex-1 text-right text-sm text-muted">{middle}</Text>
      <View className="items-start">{right}</View>
    </View>
  );
}

function Overview({ data, metrics }) {
  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3">
        {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </ScrollView>
      <View className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
        <View className="mb-2 flex-row-reverse items-center justify-between">
          <Text className="text-right text-lg font-bold text-ink">آخر النشاطات</Text>
          <StatusPill>متصل بالباك إند</StatusPill>
        </View>
        {(data.orders || []).slice(0, 4).map((order, index) => (
          <Row
            key={order.id || index}
            left={`طلب ${order.number || index + 1}`}
            middle={order.customerName || order.user?.email || 'عميل خان'}
            right={<Text className="text-xs font-semibold text-brand">{formatSyp(order.total)}</Text>}
          />
        ))}
        {!data.orders?.length ? <EmptyState text="لا توجد طلبات بعد." /> : null}
      </View>
    </>
  );
}

function OrdersView({ orders }) {
  if (!orders.length) return <EmptyState text="لا توجد طلبات لعرضها." />;
  return (
    <View className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
      <Text className="mb-2 text-right text-lg font-bold text-ink">الطلبات</Text>
      {orders.map((order) => (
        <Row
          key={order.id}
          left={order.number}
          middle={`${order.customerName || 'عميل'} - ${order.items?.length || 0} منتجات`}
          right={<StatusPill>{order.status}</StatusPill>}
        />
      ))}
    </View>
  );
}

function ProductsView({ products }) {
  if (!products.length) return <EmptyState text="لا توجد منتجات منشورة في المتجر." />;
  return (
    <View className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
      <Text className="mb-2 text-right text-lg font-bold text-ink">المنتجات</Text>
      {products.map((product) => (
        <Row
          key={product.id}
          left={product.name}
          middle={`${formatSyp(product.price)} - مخزون ${product.stock}`}
          right={<StatusPill>{product.status}</StatusPill>}
        />
      ))}
    </View>
  );
}

function CouponsView({ coupons }) {
  if (!coupons.length) return <EmptyState text="لا توجد كوبونات نشطة." />;
  return (
    <View className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
      <Text className="mb-2 text-right text-lg font-bold text-ink">الكوبونات</Text>
      {coupons.map((coupon) => (
        <Row
          key={coupon.id}
          left={coupon.code}
          middle={coupon.type === 'PERCENT' ? `خصم ${coupon.value}%` : formatSyp(coupon.value)}
          right={<StatusPill>{coupon.status}</StatusPill>}
        />
      ))}
    </View>
  );
}

function ReelsView({ reels }) {
  if (!reels.length) return <EmptyState text="لا توجد ريلز مرفوعة." />;
  return (
    <View className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
      <Text className="mb-2 text-right text-lg font-bold text-ink">ريلز المتجر</Text>
      {reels.map((reel) => (
        <Row
          key={reel.id}
          left={reel.title}
          middle={reel.product?.name || 'بدون منتج مرتبط'}
          right={<StatusPill>{reel.status}</StatusPill>}
        />
      ))}
    </View>
  );
}

function WalletView({ wallet }) {
  const transactions = wallet?.transactions || [];
  if (!transactions.length) return <EmptyState text="لا توجد حركات في المحفظة بعد." />;
  return (
    <View className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
      <Text className="mb-2 text-right text-lg font-bold text-ink">حركات المحفظة</Text>
      {transactions.map((transaction) => (
        <Row
          key={transaction.id}
          left={transaction.description || transaction.type}
          middle={transaction.status}
          right={<Text className="text-xs font-semibold text-brand">{formatSyp(transaction.amount)}</Text>}
        />
      ))}
    </View>
  );
}

export default function DashboardWorkspace() {
  const [active, setActive] = useState('overview');
  const [data, setData] = useState({
    store: null,
    products: [],
    orders: [],
    coupons: [],
    reels: [],
    wallet: null,
  });
  const [session, setSession] = useState(() => authApi.getSession('merchant'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const nextSession = await authApi.ensureMerchantSession();
      setSession(nextSession);
      const [store, products, orders, coupons, reels, wallet] = await Promise.all([
        merchantApi.store(),
        merchantApi.products(),
        merchantApi.orders(),
        merchantApi.coupons(),
        merchantApi.reels(),
        merchantApi.wallet(),
      ]);
      setData({ store, products, orders, coupons, reels, wallet });
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const title = useMemo(() => navigation.find(([key]) => key === active)?.[1] ?? 'نظرة عامة', [active]);
  const totalSales = data.orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  const availableWallet = (data.wallet?.totals || [])
    .filter((item) => item.status === 'AVAILABLE')
    .reduce((sum, item) => sum + (Number(item._sum?.amount) || 0), 0);
  const metrics = [
    { label: 'المبيعات', value: formatSyp(totalSales), detail: `${data.orders.length} طلب`, glyph: Icons.Wallet },
    { label: 'طلبات جديدة', value: String(data.orders.filter((order) => order.status === 'PENDING').length), detail: 'قيد المتابعة', glyph: Icons.ClipboardList },
    { label: 'منتجات منشورة', value: String(data.products.length), detail: `${data.reels.length} ريلز`, glyph: Icons.Package },
    { label: 'الرصيد المتاح', value: formatSyp(availableWallet), detail: `${data.coupons.length} كوبونات`, glyph: Icons.WalletCards || Icons.Wallet },
  ];

  const content = {
    overview: <Overview data={data} metrics={metrics} />,
    orders: <OrdersView orders={data.orders} />,
    products: <ProductsView products={data.products} />,
    coupons: <CouponsView coupons={data.coupons} />,
    reels: <ReelsView reels={data.reels} />,
    wallet: <WalletView wallet={data.wallet} />,
  }[active];

  return (
    <View className="flex-1 flex-row-reverse bg-surface">
      <View className="hidden w-64 bg-brand-dark p-5 md:flex">
        <Text className="mb-2 text-right text-3xl font-black text-white">خان</Text>
        <Text className="mb-8 text-right text-xs text-white/70">{data.store?.name || 'لوحة صاحب المتجر'}</Text>
        {navigation.map(([key, label, glyph]) => {
          const selected = key === active;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => setActive(key)}
              className={`mb-2 flex-row-reverse items-center gap-3 rounded-lg px-3 py-3 ${selected ? 'bg-white/20' : ''}`}
            >
              <Icon glyph={glyph} color="#FFFFFF" />
              <Text className="text-right text-sm font-semibold text-white">{label}</Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          className="mt-auto rounded-lg border border-white/20 px-3 py-3"
          onPress={() => {
            if (typeof window !== 'undefined') window.location.href = '/';
          }}
        >
          <Text className="text-center text-sm font-semibold text-white">فتح تطبيق المستخدم</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        <View className="border-b border-slate-200 bg-white px-5 py-4">
          <View className="flex-row-reverse items-center justify-between gap-4">
            <View className="flex-1">
              <Text className="text-right text-2xl font-bold text-ink">{title}</Text>
              <Text className="mt-1 text-right text-sm text-muted">
                إدارة متجرك وبياناتك من مكان واحد
              </Text>
            </View>
            <TouchableOpacity className="rounded-lg bg-emerald-50 px-3 py-2" onPress={loadDashboard}>
              <Text className="text-sm font-semibold text-brand">{loading ? 'يتم التحديث...' : 'تحديث'}</Text>
            </TouchableOpacity>
          </View>
          <Text className="mt-2 text-right text-xs text-muted">
            {session?.user?.email || 'جلسة التاجر غير جاهزة'}
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 bg-white px-3 py-2 md:hidden">
          {navigation.map(([key, label, glyph]) => {
            const selected = key === active;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setActive(key)}
                className={`flex-row-reverse items-center gap-2 rounded-lg px-3 py-2 ${selected ? 'bg-brand' : 'bg-emerald-50'}`}
              >
                <Icon glyph={glyph} color={selected ? '#FFFFFF' : '#179B7D'} size={16} />
                <Text className={`text-xs font-semibold ${selected ? 'text-white' : 'text-brand'}`}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <ScrollView contentContainerClassName="gap-5 p-5" showsVerticalScrollIndicator={false}>
          {error ? (
            <TouchableOpacity className="rounded-lg border border-amber-200 bg-amber-50 p-4" onPress={loadDashboard}>
              <Text className="text-right text-sm font-semibold text-amber-700">
                تعذر تحميل لوحة المتجر: {error}
              </Text>
            </TouchableOpacity>
          ) : null}
          {loading && !error ? (
            <View className="rounded-lg bg-white p-4">
              <Text className="text-center text-sm text-muted">جاري تحميل بيانات المتجر من الباك إند...</Text>
            </View>
          ) : content}
        </ScrollView>
      </View>
    </View>
  );
}
