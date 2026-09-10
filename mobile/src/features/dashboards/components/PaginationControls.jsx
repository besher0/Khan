import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../dashboardStyles';

export default function PaginationControls({ pageData, onPageChange }) {
  const page = pageData?.page || 1;
  const totalPages = pageData?.totalPages || 1;
  return (
    <View style={styles.authInline}>
      <TouchableOpacity
        style={[styles.smallActionButton, page <= 1 && styles.buttonDisabled]}
        onPress={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        <Text style={styles.smallActionText}>السابق</Text>
      </TouchableOpacity>
      <Text style={styles.mutedSmall}>{page} / {totalPages}</Text>
      <TouchableOpacity
        style={[styles.smallActionButton, page >= totalPages && styles.buttonDisabled]}
        onPress={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        <Text style={styles.smallActionText}>التالي</Text>
      </TouchableOpacity>
    </View>
  );
}
