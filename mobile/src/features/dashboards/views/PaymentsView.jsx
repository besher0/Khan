import { Text, View } from 'react-native';
import * as Icons from '../../../../icons';
import { EmptyState, StatCard, StatusPill } from '../components/DashboardComponents';
import PaginationControls from '../components/PaginationControls';
import { formatDate, formatNumber } from '../dashboardUtils';
import { styles } from '../dashboardStyles';

export default function PaymentsView({ data, onPageChange, onWalletPageChange }) {
  const payments = data.payments.items || [];
  const statusCounts = data.payments.summary?.statusCounts || {};
  const walletTransactions = data.wallet?.transactions;
  return (
    <>
      <View style={styles.statsGrid}>
        <StatCard label="مدفوعات" value={String(data.payments.total || 0)} hint="الإجمالي" delta="0" icon={Icons.Package} />
        <StatCard label="معلقة" value={String(statusCounts.PENDING || 0)} hint="بانتظار التأكيد" delta="0" icon={Icons.CircleX} tone="red" />
        <StatCard label="مؤكدة" value={String((statusCounts.PAID || 0) + (statusCounts.CONFIRMED || 0))} hint="تمت" delta="0" icon={Icons.TriangleAlert} tone="amber" />
        <StatCard label="محفظة" value={String(walletTransactions?.total || 0)} hint="حركات" delta="0" icon={Icons.Clock3} tone="purple" />
      </View>
      <View style={styles.paymentsTables}>
        <PaymentTable title="آخر المدفوعات" payments={payments} />
        <WalletTransactionTable title="حركات المحفظة" transactions={walletTransactions?.items || []} />
      </View>
      <PaginationControls pageData={data.payments} onPageChange={onPageChange} />
      {walletTransactions ? (
        <PaginationControls pageData={walletTransactions} onPageChange={onWalletPageChange} />
      ) : null}
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
      {payments.length ? payments.map((payment, index) => (
        <View key={`${payment.id}-${index}`} style={styles.paymentRow}>
          <Text style={styles.tableCell}>{formatDate(payment.createdAt)}</Text>
          <Text style={styles.tableCell}>{formatNumber(payment.amount)} $</Text>
          <Text style={styles.tableCell}>{payment.method === 'SHAM_CASH' ? 'شام كاش' : 'كاش'}</Text>
          <StatusPill status={payment.status} />
        </View>
      )) : <EmptyState />}
    </View>
  );
}

function WalletTransactionTable({ title, transactions }) {
  return (
    <View style={styles.paymentTable}>
      <Text style={styles.panelTitle}>{title}</Text>
      <View style={styles.tableHeader}>
        {['التاريخ', 'المبلغ', 'النوع', 'الوصف', 'الحالة'].map((item) => <Text key={item} style={styles.tableHeaderText}>{item}</Text>)}
      </View>
      {transactions.length ? transactions.map((transaction, index) => (
        <View key={`${transaction.id}-${index}`} style={styles.paymentRow}>
          <Text style={styles.tableCell}>{formatDate(transaction.createdAt)}</Text>
          <Text style={styles.tableCell}>{formatNumber(transaction.amount)} $</Text>
          <Text style={styles.tableCell}>{transaction.type || '-'}</Text>
          <Text style={styles.tableCell}>{transaction.description || '-'}</Text>
          <StatusPill status={transaction.status} />
        </View>
      )) : <EmptyState />}
    </View>
  );
}
