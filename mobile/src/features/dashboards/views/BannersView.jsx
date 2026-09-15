import { Text, TouchableOpacity, View } from 'react-native';
import * as Icons from '../../../../icons';
import { EmptyState, FilterRow, HeaderTabs, Icon, ProductThumb, StatusPill, SwitchControl } from '../components/DashboardComponents';
import { remoteImage } from '../dashboardUtils';
import { styles } from '../dashboardStyles';

export default function BannersView({ data, canManage, onAdd, onEdit, onToggle, actionBusy }) {
  const rows = data.banners || [];

  return (
    <>
      <HeaderTabs active="banners" onChange={() => {}} tabs={[{ key: 'banners', label: `البنرات ${rows.length}` }]} />
      <FilterRow primaryLabel={canManage ? 'إضافة بنر' : null} onPrimaryPress={onAdd} filterLabel="حسب الترتيب" />
      <View style={styles.tableCard}>
        <View style={styles.tableHeader}>
          {['البنر', 'الترتيب', 'الهدف', 'الحالة', 'الإجراءات'].map((item) => <Text key={item} style={styles.tableHeaderText}>{item}</Text>)}
        </View>
        {rows.length ? rows.map((banner, index) => (
          <View key={`${banner.id}-${index}`} style={styles.productRow}>
            <View style={styles.productEntity}>
              <ProductThumb source={remoteImage(banner.imageUrl)} size={58} />
              <View>
                <Text style={styles.entityName}>{banner.title}</Text>
                <Text style={styles.mutedSmall} numberOfLines={1}>{banner.subtitle || 'بنر الصفحة الرئيسية'}</Text>
              </View>
            </View>
            <Text style={styles.tableCell}>{banner.position ?? 0}</Text>
            <Text style={styles.tableCell}>{banner.product?.name || banner.targetUrl || '-'}</Text>
            <StatusPill status={banner.status || 'ACTIVE'} />
            <View style={styles.iconActions}>
              {canManage ? (
                <>
                  <TouchableOpacity style={styles.smallActionButton} onPress={() => onEdit?.(banner)}>
                    <Icon glyph={Icons.Pencil} size={18} />
                    <Text style={styles.smallActionText}>تعديل</Text>
                  </TouchableOpacity>
                  <SwitchControl
                    active={banner.status === 'ACTIVE'}
                    onPress={() => onToggle?.(banner)}
                    disabled={actionBusy === `banner-${banner.id}`}
                  />
                </>
              ) : <Text style={styles.mutedSmall}>-</Text>}
            </View>
          </View>
        )) : <EmptyState label="لا توجد بنرات" />}
      </View>
    </>
  );
}
