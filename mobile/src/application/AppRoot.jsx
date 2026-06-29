import { lazy, Suspense, useMemo } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const MarketplaceExperience = lazy(() => import('../features/marketplace/MarketplaceExperience'));
const DashboardWorkspace = lazy(() => import('../features/dashboards/DashboardWorkspace'));

function LoadingExperience() {
  return (
    <View style={styles.loading}>
      <Text style={styles.loadingText}>جاري تحميل الواجهة...</Text>
    </View>
  );
}

function getWorkspaceFromPath() {
  if (typeof window === 'undefined' || !window.location?.pathname) return 'marketplace';
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/dashboard' || path.startsWith('/dashboard/')) return 'dashboard';
  return 'marketplace';
}

export default function AppRoot() {
  const workspace = useMemo(getWorkspaceFromPath, []);

  return (
    <SafeAreaProvider>
      <StatusBar hidden={false} barStyle="dark-content" backgroundColor="#F7F8F6" />
      <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.root}>
        <Suspense fallback={<LoadingExperience />}>
          {workspace === 'dashboard' ? <DashboardWorkspace /> : <MarketplaceExperience />}
        </Suspense>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 0,
    backgroundColor: '#F7F8F6',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F8F6',
  },
  loadingText: {
    color: '#179B7D',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
});
