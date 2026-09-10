import { Text, TouchableOpacity, View } from 'react-native';
import * as Icons from '../../../../icons';
import { EmptyState, HeaderTabs, ProductThumb, StatCard, StatusPill } from '../components/DashboardComponents';
import PaginationControls from '../components/PaginationControls';
import { formatSyp, remoteImage } from '../dashboardUtils';
import { styles } from '../dashboardStyles';

export default function OrdersView({ data, canManage, onStatusChange, actionBusy, onPageChange }) {
  const orders = data.orders.items || [];
  const statusCounts = data.orders.summary?.statusCounts || {};
  return (
    <>
      <View style={styles.statsGrid}>
        <StatCard label="جديد" value={String(statusCounts.PENDING || 0)} hint="الإجمالي" delta="0" icon={Icons.Package} />
        <StatCard label="قيد التحضير" value={String(statusCounts.PREPARING || 0)} hint="الإجمالي" delta="0" icon={Icons.Clock3} tone="purple" />
        <StatCard label="قيد التوصيل" value={String(statusCounts.OUT_FOR_DELIVERY || 0)} hint="الإجمالي" delta="0" icon={Icons.Truck} tone="amber" />
        <StatCard label="مكتمل" value={String(statusCounts.DELIVERED || 0)} hint="الإجمالي" delta="0" icon={Icons.CircleCheck} tone="red" />
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
        {orders.length ? orders.map((order, index) => (
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
      <PaginationControls pageData={data.orders} onPageChange={onPageChange} />
    </>
  );
}
