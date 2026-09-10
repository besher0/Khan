import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import * as Icons from '../../../../icons';
import { EmptyState, ProductThumb, StatCard, StatusPill } from '../components/DashboardComponents';
import { formatDate, formatNumber, formatSyp, getProductImage, remoteImage } from '../dashboardUtils';
import { styles } from '../dashboardStyles';

export default function OverviewView({ data }) {
  const orders = data.orders.items || [];
  const orderSummary = data.orders.summary || {};
  return (
    <>
      <View style={styles.statsGrid}>
        <StatCard label="مبيعات" value={formatNumber(orderSummary.totalSales)} hint="الإجمالي" delta="0" icon={Icons.Banknote} />
        <StatCard label="زائر" value="0" hint="غير متوفر من API" delta="0" icon={Icons.Users} />
        <StatCard label="طلب" value={String(orderSummary.totalOrders || data.orders.total || 0)} hint="الإجمالي" delta="0" icon={Icons.Package} />
        <StatCard label="منتج" value={String(data.products.length)} hint="الإجمالي" delta="0" icon={Icons.ShoppingBag} />
      </View>
      <View style={styles.overviewGrid}>
        <View style={styles.latestOrdersCard}>
          <View style={styles.panelHeader}>
            <TouchableOpacity><Text style={styles.linkText}>عرض الكل</Text></TouchableOpacity>
            <Text style={styles.panelTitle}>أحدث الطلبات</Text>
          </View>
          {orders.length ? orders.slice(0, 4).map((order, index) => (
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
