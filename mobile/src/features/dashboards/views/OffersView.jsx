import { Text, TouchableOpacity, View } from 'react-native';
import * as Icons from '../../../../icons';
import { EmptyState, FilterRow, HeaderTabs, Icon, StatusPill, SwitchControl } from '../components/DashboardComponents';
import { formatDate, formatSyp } from '../dashboardUtils';
import { palette, styles } from '../dashboardStyles';

export default function OffersView({ data, canManage, onAdd, onToggleCoupon, actionBusy }) {
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
