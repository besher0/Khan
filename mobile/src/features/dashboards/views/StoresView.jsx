import { Text, TouchableOpacity, View } from 'react-native';
import * as Icons from '../../../../icons';
import { EmptyState, FilterRow, Icon, ProductThumb, StatCard, StatusPill } from '../components/DashboardComponents';
import { displayName, formatDate, formatSyp, remoteImage } from '../dashboardUtils';
import { palette, styles } from '../dashboardStyles';

export default function StoresView({ data, onAdd, onAssignPackage, onChangeStatus }) {
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
