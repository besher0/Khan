import { Text, TouchableOpacity, View } from 'react-native';
import * as Icons from '../../../../icons';
import { EmptyState, FilterRow, HeaderTabs, Icon, ProductThumb, StatCard, StatusPill } from '../components/DashboardComponents';
import { formatSyp, getProductImage } from '../dashboardUtils';
import { palette, styles } from '../dashboardStyles';

export default function ProductsView({ data, canManage, onAdd, onArchive, actionBusy }) {
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
