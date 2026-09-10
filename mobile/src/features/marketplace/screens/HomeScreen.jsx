import { useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import * as Icons from '../../../../icons';
import { styles } from '../theme/styles';
import { AppIcon, CategoryStrip, CouponCard, HeaderSearch, ProductCard, ReelCard, RText, RtlHorizontalScroll, SectionTitle, Tabs, images, palette } from '../shared/marketplaceShared';
import { DataNotice, listOrEmpty, ScreenScroll, useMarketplaceLayout } from './screenShared.jsx';

const homeTabs = ['الكل', 'عروض', 'أدوات معدلة', 'ألعاب أطفال', 'المنازل', 'العروض'];

function HomePromo() {
  return (
    <View style={styles.promoBanner}>
      <View style={styles.promoText}>
        <RText style={styles.promoTitle}>عروض وحسومات!</RText>
        <RText style={styles.promoBody}>خصومات مميزة على مطاعم وكافيهات متاجر وخدمات ضمن خان</RText>
        <TouchableOpacity style={styles.promoButton}>
          <RText style={styles.promoButtonText}>اكتشف الآن</RText>
          <AppIcon icon={Icons.ChevronLeft} size={14} color={palette.amber} />
        </TouchableOpacity>
      </View>
      <Image source={images.storeBanner} style={styles.promoImage} />
      <View style={styles.promoDots}>
        <View style={[styles.promoDot, styles.promoDotActive]} />
        <View style={styles.promoDot} />
        <View style={styles.promoDot} />
      </View>
    </View>
  );
}

function OfferBanners() {
  return (
    <View style={styles.offerBand}>
      <View style={[styles.offerCard, styles.offerCardAmber]}>
        <View style={styles.offerText}>
          <RText style={styles.offerTitle}>خصم حتى</RText>
          <RText style={styles.offerSub}>اشتري بـ 500 ل.س وأكثر واحصل على خصم</RText>
          <TouchableOpacity style={[styles.offerButton, styles.offerButtonAmber]}>
            <RText style={styles.offerButtonText}>تسوق الآن</RText>
          </TouchableOpacity>
        </View>
        <Image source={images.storeBanner} style={styles.offerImage} />
      </View>
      <View style={styles.offerCard}>
        <View style={styles.offerText}>
          <RText style={styles.offerTitle}>توصيل مجاني</RText>
          <RText style={styles.offerSub}>اشتري بـ 500 ل.س وأكثر إلى باب منزلك</RText>
          <TouchableOpacity style={styles.offerButton}>
            <RText style={styles.offerButtonText}>تسوق الآن</RText>
          </TouchableOpacity>
        </View>
        <Image source={images.storeBanner} style={styles.offerImage} />
      </View>
    </View>
  );
}

export function HomeScreen({
  catalog,
  loading,
  error,
  onRetry,
  onSearch,
  onOpenProduct,
  onAddToCart,
  onToggleFavorite,
  onOpenReel,
  onShowAll,
  favorites,
}) {
  const [query, setQuery] = useState('');
  const products = listOrEmpty(catalog?.products);
  const categories = listOrEmpty(catalog?.categories);
  const reels = listOrEmpty(catalog?.reels);
  const coupons = listOrEmpty(catalog?.coupons);
  const { productCardStyle } = useMarketplaceLayout();

  return (
    <ScreenScroll>
      <HeaderSearch value={query} onChangeText={setQuery} onSubmit={() => onSearch?.(query)} />
      <DataNotice loading={loading} error={error} onRetry={onRetry} />
      <HomePromo />
      <CategoryStrip items={categories} />
      {reels.length ? (
        <>
          <SectionTitle title="ريلز خان" icon={Icons.Video} onAction={() => onShowAll?.('reels')} />
          <RtlHorizontalScroll refreshKey={`home-reels-${reels.length}`} contentContainerStyle={styles.horizontalCards}>
            {reels.map((item) => (
              <ReelCard key={item.id || item.title} item={item} onPress={onOpenReel} />
            ))}
          </RtlHorizontalScroll>
        </>
      ) : null}
      {coupons.length ? (
        <>
          <SectionTitle title="كوبونات خان" icon={Icons.Ticket || Icons.Tag} onAction={() => onShowAll?.('coupons')} />
          <RtlHorizontalScroll refreshKey={`home-coupons-${coupons.length}`} contentContainerStyle={styles.horizontalCards}>
            {coupons.map((coupon, index) => (
              <CouponCard key={coupon.id || `${coupon.code}-${index}`} coupon={coupon} index={index} />
            ))}
          </RtlHorizontalScroll>
        </>
      ) : null}
      {products.length ? (
        <>
          <SectionTitle title="موصى به لك" icon={Icons.Flame || Icons.Star} onAction={() => onShowAll?.('recommended')} />
          <RtlHorizontalScroll refreshKey={`home-featured-${products.length}`} contentContainerStyle={styles.horizontalCards}>
            {products.slice(0, 6).map((product) => (
              <ProductCard
                key={`recommended-${product.id || product.title}`}
                product={product}
                compact
                onOpen={onOpenProduct}
                onAddToCart={onAddToCart}
                onToggleFavorite={onToggleFavorite}
                isFavorite={favorites.includes(product.id || product.title)}
              />
            ))}
          </RtlHorizontalScroll>
          <SectionTitle title="عرض الغفلة" icon={Icons.Flame || Icons.Star} onAction={() => onShowAll?.('recommended')} />
          <OfferBanners />
          <Tabs tabs={homeTabs} active="الكل" onChange={() => {}} />
        </>
      ) : null}
      <View style={styles.productGrid}>
        {products.map((product) => (
          <ProductCard
            key={`grid-${product.id || product.title}`}
            product={product}
            style={productCardStyle}
            showcase
            onOpen={onOpenProduct}
            onAddToCart={onAddToCart}
            onToggleFavorite={onToggleFavorite}
            isFavorite={favorites.includes(product.id || product.title)}
          />
        ))}
      </View>
      {!loading && !products.length && !reels.length && !coupons.length ? (
        <RText style={styles.collectionEmpty}>لا توجد بيانات متاحة حالياً.</RText>
      ) : null}
    </ScreenScroll>
  );
}
