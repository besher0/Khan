import { ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { styles } from '../theme/styles';
import { RText, palette } from '../shared/marketplaceShared';

export function ScreenScroll({ children }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.screenScrollContent}>
      {children}
    </ScrollView>
  );
}

export function DataNotice({ loading, error, onRetry }) {
  if (!loading && !error) return null;
  return (
    <TouchableOpacity
      onPress={error ? onRetry : undefined}
      style={{
        marginTop: 12,
        padding: 12,
        borderRadius: 8,
        backgroundColor: error ? '#FFF4E6' : palette.greenSoft,
      }}
    >
      <RText style={{ color: error ? '#9A5B00' : palette.greenDark, fontSize: 12, fontWeight: '800' }}>
        {error ? 'تعذر الاتصال بالباك إند. اضغط لإعادة المحاولة.' : 'يتم تحميل البيانات من الباك إند...'}
      </RText>
    </TouchableOpacity>
  );
}

export function listOrEmpty(list) {
  return Array.isArray(list) ? list.filter(Boolean) : [];
}

const PRODUCT_GRID_GAP = 10;

export function useMarketplaceLayout() {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, 1180);
  const productColumns = contentWidth >= 980 ? 4 : contentWidth >= 660 ? 3 : 2;
  const productGridWidth = Math.max(0, contentWidth - 32);
  const productCardStyle = {
    width: (productGridWidth - PRODUCT_GRID_GAP * (productColumns - 1)) / productColumns,
  };
  const collectionCardStyle =
    contentWidth >= 980
      ? styles.collectionCardFourColumns
      : contentWidth >= 660
        ? styles.collectionCardThreeColumns
        : null;

  return { productCardStyle, collectionCardStyle };
}
