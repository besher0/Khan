import { Text, TouchableOpacity, View } from 'react-native';
import * as Icons from '../../../../icons';
import { EmptyState, FilterRow, Icon, StatCard, StatusPill, SwitchControl } from '../components/DashboardComponents';
import { formatSyp } from '../dashboardUtils';
import { palette, styles } from '../dashboardStyles';

export default function PackagesView({ data, onAdd, onEdit, onToggle, actionBusy }) {
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
