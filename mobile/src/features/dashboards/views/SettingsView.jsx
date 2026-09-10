import { Text, View } from 'react-native';
import { styles } from '../dashboardStyles';

export default function SettingsView() {
  return (
    <View style={styles.settingsEmpty}>
      <Text style={styles.panelTitle}>الإعدادات</Text>
      <Text style={styles.mutedText}>جهّز إعدادات المتجر، طرق الدفع، الإشعارات، والصلاحيات من هنا.</Text>
    </View>
  );
}
