import { lazy, Suspense, useMemo } from 'react';
import { SafeAreaView, Text, View } from 'react-native';

const MarketplaceExperience = lazy(() => import('../features/marketplace/MarketplaceExperience'));
const DashboardWorkspace = lazy(() => import('../features/dashboards/DashboardWorkspace'));

function LoadingExperience() {
  return (
    <View className="flex-1 items-center justify-center bg-surface">
      <Text className="text-base font-semibold text-brand">جاري تحميل الواجهة...</Text>
    </View>
  );
}

function getWorkspaceFromPath() {
  if (typeof window === 'undefined') return 'marketplace';
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/dashboard' || path.startsWith('/dashboard/')) return 'dashboard';
  return 'marketplace';
}

/** رابط التطبيق الأساسي هو / ورابط لوحة صاحب المتجر هو /dashboard. */
export default function AppRoot() {
  const workspace = useMemo(getWorkspaceFromPath, []);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <Suspense fallback={<LoadingExperience />}>
        {workspace === 'dashboard' ? <DashboardWorkspace /> : <MarketplaceExperience />}
      </Suspense>
    </SafeAreaView>
  );
}
