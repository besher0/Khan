import { ScrollView, TouchableOpacity, View } from 'react-native';
import * as Icons from '../../../../icons';
import { styles } from '../theme/styles';
import { AppIcon, CouponCard, ProductCard, RText, ReelCard, palette } from '../shared/marketplaceShared';
import { DataNotice, listOrEmpty, useMarketplaceLayout } from './screenShared.jsx';

export function CollectionScreen({
  type = 'recommended',
  catalog,
  collectionData,
  loading,
  error,
  onRetry,
  onBack,
  onOpenProduct,
  onAddToCart,
  onToggleFavorite,
  onOpenReel,
  favorites,
}) {
  const { productCardStyle, collectionCardStyle } = useMarketplaceLayout();
  const products = Array.isArray(collectionData?.products)
    ? collectionData.products
    : loading ? [] : listOrEmpty(catalog?.products);
  const reels = Array.isArray(collectionData?.reels)
    ? collectionData.reels
    : loading ? [] : listOrEmpty(catalog?.reels);
  const coupons = Array.isArray(collectionData?.coupons)
    ? collectionData.coupons
    : loading ? [] : listOrEmpty(catalog?.coupons);
  const meta = {
    reels: { title: 'كل الريلز', subtitle: 'جميع العروض المرئية', icon: Icons.Video },
    coupons: { title: 'كل الكوبونات', subtitle: 'كل الخصومات المتاحة', icon: Icons.Ticket || Icons.Tag },
    recommended: { title: 'كل المنتجات', subtitle: 'جميع المنتجات من هذا القسم', icon: Icons.Flame || Icons.Star },
  }[type] || { title: 'كل المنتجات', subtitle: 'جميع العناصر المتاحة', icon: Icons.Grid2X2 };

  const empty =
    (type === 'reels' && !reels.length) ||
    (type === 'coupons' && !coupons.length) ||
    (!['reels', 'coupons'].includes(type) && !products.length);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.collectionContent}>
      <View style={styles.collectionHeader}>
        <TouchableOpacity style={styles.detailsTopButton} onPress={onBack}>
          <AppIcon icon={Icons.ArrowRight} size={19} color={palette.greenDark} />
        </TouchableOpacity>
        <View style={styles.collectionHeaderText}>
          <View style={styles.collectionTitleRow}>
            <AppIcon icon={meta.icon} size={18} color={palette.green} />
            <RText style={styles.collectionTitle}>{meta.title}</RText>
          </View>
          <RText style={styles.collectionSub}>{meta.subtitle}</RText>
        </View>
      </View>
      <DataNotice loading={loading} error={error} onRetry={onRetry} />

      {type === 'reels' ? (
        <View style={styles.collectionGrid}>
          {reels.map((item) => (
            <View key={`all-reel-${item.id || item.title}`} style={[styles.collectionReelTile, collectionCardStyle]}>
              <ReelCard item={item} onPress={onOpenReel} style={styles.collectionReelCard} />
            </View>
          ))}
        </View>
      ) : null}

      {type === 'coupons' ? (
        <View style={styles.collectionGrid}>
          {coupons.map((coupon, index) => (
            <View key={`all-coupon-${coupon.id || coupon.code || index}`} style={[styles.collectionCouponTile, collectionCardStyle]}>
              <CouponCard coupon={coupon} index={index} style={styles.collectionCouponCard} />
            </View>
          ))}
        </View>
      ) : null}

      {!['reels', 'coupons'].includes(type) ? (
        <View style={styles.productGrid}>
          {products.map((product) => (
            <ProductCard
              key={`all-product-${product.id || product.title}`}
              product={product}
              style={productCardStyle}
              onOpen={onOpenProduct}
              onAddToCart={onAddToCart}
              onToggleFavorite={onToggleFavorite}
              isFavorite={favorites.includes(product.id || product.title)}
            />
          ))}
        </View>
      ) : null}

      {empty && !loading ? <RText style={styles.collectionEmpty}>لا توجد عناصر متاحة حالياً.</RText> : null}
    </ScrollView>
  );
}
