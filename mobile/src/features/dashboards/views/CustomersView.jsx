import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import * as Icons from '../../../../icons';
import { EmptyState, HeaderTabs, Icon, ProductThumb, StatusPill, SwitchControl } from '../components/DashboardComponents';
import PaginationControls from '../components/PaginationControls';
import { displayName, formatDate, remoteImage, roleLabel } from '../dashboardUtils';
import { palette, styles } from '../dashboardStyles';

export default function CustomersView({
  data,
  currentUserId,
  onUserStatus,
  onReviewStatus,
  actionBusy,
  onUsersPageChange,
  onReviewsPageChange,
}) {
  const [tab, setTab] = useState('customers');
  const users = data.users.items || [];
  const reviews = data.reviews.items || [];
  return (
    <>
      <HeaderTabs active={tab} onChange={setTab} tabs={[{ key: 'customers', label: `العملاء ${data.users.total || 0}` }, { key: 'reviews', label: `التقييمات ${data.reviews.total || 0}` }]} />
      {tab === 'customers' ? (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tableHorizontalScroll}>
            <View style={[styles.tableCard, styles.customerTable]}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.customerNameColumn]}>المستخدم</Text>
                <Text style={[styles.tableHeaderText, styles.customerRoleColumn]}>الدور</Text>
                <Text style={[styles.tableHeaderText, styles.customerPhoneColumn]}>الهاتف</Text>
                <Text style={[styles.tableHeaderText, styles.customerStatusColumn]}>الحالة</Text>
                <Text style={[styles.tableHeaderText, styles.customerActionColumn]}>الإجراءات</Text>
                </View>
              {users.length ? users.map((user, index) => (
                <View key={`${user.id}-${index}`} style={styles.customerRow}>
                  <View style={styles.customerNameColumn}>
                    <View style={styles.customerEntity}>
                      <View style={styles.grayAvatar} />
                      <Text style={styles.entityName}>{displayName(user)}</Text>
                    </View>
                  </View>
                  <Text style={[styles.tableCell, styles.customerRoleColumn]}>{roleLabel(user.role)}</Text>
                  <Text style={[styles.tableCell, styles.customerPhoneColumn]}>{user.phone || '-'}</Text>
                  <View style={styles.customerStatusColumn}><StatusPill status={user.status || 'ACTIVE'} /></View>
                  <View style={styles.customerActionColumn}>
                    <SwitchControl
                      active={user.status === 'ACTIVE'}
                      onPress={() => onUserStatus(user.id, user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE')}
                      disabled={user.id === currentUserId || actionBusy === `user-${user.id}`}
                    />
                  </View>
                </View>
              )) : <EmptyState />}
            </View>
          </ScrollView>
          <PaginationControls pageData={data.users} onPageChange={onUsersPageChange} />
        </>
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tableHorizontalScroll}>
            <View style={[styles.tableCard, styles.reviewTable]}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.reviewProductColumn]}>المنتج</Text>
                <Text style={[styles.tableHeaderText, styles.reviewUserColumn]}>المستخدم</Text>
                <Text style={[styles.tableHeaderText, styles.reviewDateColumn]}>التاريخ</Text>
                <Text style={[styles.tableHeaderText, styles.reviewRatingColumn]}>التقييم</Text>
                <Text style={[styles.tableHeaderText, styles.reviewCommentColumn]}>التعليق</Text>
                <Text style={[styles.tableHeaderText, styles.reviewActionColumn]}>الإجراءات</Text>
                </View>
              {reviews.length ? reviews.map((review, index) => (
                <View key={`${review.id}-${index}`} style={styles.reviewRow}>
                  <View style={styles.reviewProductColumn}>
                    <View style={styles.customerEntity}>
                      <ProductThumb source={remoteImage(review.product?.images?.[0]?.url)} size={48} />
                      <Text style={styles.entityName}>{review.product?.name || 'المنتج'}</Text>
                    </View>
                  </View>
                  <View style={styles.reviewUserColumn}>
                    <View style={styles.customerEntity}>
                      <View style={styles.grayAvatarSmall} />
                      <Text style={styles.entityName}>{displayName(review.user)}</Text>
                    </View>
                  </View>
                  <Text style={[styles.tableCell, styles.reviewDateColumn]}>{formatDate(review.createdAt)}</Text>
                  <Text style={[styles.starsText, styles.reviewRatingColumn]}>{'★'.repeat(review.rating || 0)}</Text>
                  <Text style={[styles.reviewComment, styles.reviewCommentColumn]} numberOfLines={2}>{review.comment || '-'}</Text>
                  <View style={[styles.reviewActions, styles.reviewActionColumn]}>
                    <TouchableOpacity
                      style={styles.reviewApproveButton}
                      onPress={() => onReviewStatus(review.id, 'APPROVED')}
                      disabled={actionBusy === `review-${review.id}` || review.status === 'APPROVED'}
                    ><Icon glyph={Icons.Check} color="#FFFFFF" size={17} /></TouchableOpacity>
                    <TouchableOpacity
                      style={styles.reviewRejectButton}
                      onPress={() => onReviewStatus(review.id, 'REJECTED')}
                      disabled={actionBusy === `review-${review.id}` || review.status === 'REJECTED'}
                    ><Icon glyph={Icons.X} color={palette.red} size={17} /></TouchableOpacity>
                  </View>
                </View>
              )) : <EmptyState />}
            </View>
          </ScrollView>
          <PaginationControls pageData={data.reviews} onPageChange={onReviewsPageChange} />
        </>
      )}
    </>
  );
}
