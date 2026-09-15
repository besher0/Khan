import { useEffect, useRef, useState } from 'react';
import { Image, ScrollView, TouchableOpacity, View } from 'react-native';
import * as Icons from '../../../../icons';
import { styles } from '../theme/styles';
import { AppIcon, CategoryStrip, CouponCard, HeaderSearch, ProductCard, ReelCard, RText, RtlHorizontalScroll, SectionTitle, Tabs, images, palette } from '../shared/marketplaceShared';
import { DataNotice, listOrEmpty, ScreenScroll, useMarketplaceLayout } from './screenShared.jsx';

const ALL_TAB = 'الكل';
const OFFERS_TAB = 'عروض';

function HomePromo({ banners = [], onOpenProduct }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [sliderWidth, setSliderWidth] = useState(1);
  const scrollRef = useRef(null);
  const slides = banners.length
    ? banners
    : [{
        id: 'fallback',
        title: 'عروض وحسومات!',
        subtitle: 'خصومات مميزة على مطاعم وكافيهات متاجر وخدمات ضمن خان',
        ctaLabel: 'اكتشف الآن',
        image: images.storeBanner,
      }];

  useEffect(() => {
    if (slides.length <= 1) return undefined;

    const timer = setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % slides.length;
        scrollRef.current?.scrollTo({ x: next * sliderWidth, animated: true });
        return next;
      });
    }, 3500);

    return () => clearInterval(timer);
  }, [sliderWidth, slides.length]);

  return (
    <View style={styles.promoSlider} onLayout={(event) => setSliderWidth(event.nativeEvent.layout.width || 1)}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onTouchStart={(event) => event?.stopPropagation?.()}
        onTouchEnd={(event) => event?.stopPropagation?.()}
        onMomentumScrollEnd={(event) => {
          const width = event.nativeEvent.layoutMeasurement.width || 1;
          setActiveIndex(Math.round(event.nativeEvent.contentOffset.x / width));
        }}
      >
        {slides.map((banner) => (
          <TouchableOpacity
            key={banner.id || banner.title}
            style={[styles.promoBanner, { width: sliderWidth }]}
            activeOpacity={0.9}
            onPress={() => banner.product && onOpenProduct?.(banner.product)}
          >
            <View style={styles.promoText}>
              <RText style={styles.promoTitle}>{banner.title}</RText>
              {banner.subtitle ? <RText style={styles.promoBody}>{banner.subtitle}</RText> : null}
              {banner.ctaLabel ? (
                <View style={styles.promoButton}>
                  <RText style={styles.promoButtonText}>{banner.ctaLabel}</RText>
                  <AppIcon icon={Icons.ChevronLeft} size={14} color={palette.amber} />
                </View>
              ) : null}
            </View>
            <Image source={banner.image || images.storeBanner} style={styles.promoImage} />
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.promoDots}>
        {slides.map((banner, index) => (
          <View key={`promo-dot-${banner.id || index}`} style={[styles.promoDot, activeIndex === index && styles.promoDotActive]} />
        ))}
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
  onOpenFavorites,
  onOpenNotifications,
  onOpenProduct,
  onAddToCart,
  onToggleFavorite,
  onOpenReel,
  onShowAll,
  onCopyCoupon,
  favorites,
  notificationCount,
}) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(ALL_TAB);
  const products = listOrEmpty(catalog?.products);
  const categories = listOrEmpty(catalog?.categories);
  const reels = listOrEmpty(catalog?.reels);
  const coupons = listOrEmpty(catalog?.coupons);
  const { productCardStyle } = useMarketplaceLayout();
  const offerStoreIds = new Set(coupons.map((coupon) => coupon.storeId).filter(Boolean));
  const hasOffer = (product) => {
    const oldPrice = Number(product.oldPriceValue || product.compareAtPrice || product?.raw?.compareAtPrice || 0);
    return oldPrice > Number(product.priceValue || 0) || offerStoreIds.has(product.storeId);
  };
  const filterTabs = [
    ALL_TAB,
    OFFERS_TAB,
    ...categories.map((category) => category.label).filter(Boolean),
  ];
  const filteredProducts = products.filter((product) => {
    if (activeFilter === ALL_TAB) return true;
    if (activeFilter === OFFERS_TAB) return hasOffer(product);
    return product.category === activeFilter;
  });

  return (
    <ScreenScroll>
      <HeaderSearch
        value={query}
        onChangeText={setQuery}
        onSubmit={() => onSearch?.(query)}
        onOpenFavorites={onOpenFavorites}
        onOpenNotifications={onOpenNotifications}
        notificationCount={notificationCount}
      />
      <DataNotice loading={loading} error={error} onRetry={onRetry} />
      <HomePromo banners={catalog?.banners || []} onOpenProduct={onOpenProduct} />
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
              <CouponCard key={coupon.id || `${coupon.code}-${index}`} coupon={coupon} index={index} onCopy={onCopyCoupon} />
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
          <Tabs tabs={filterTabs} active={activeFilter} onChange={setActiveFilter} />
        </>
      ) : null}
      <View style={styles.productGrid}>
        {filteredProducts.map((product) => (
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
      {products.length && !filteredProducts.length ? (
        <RText style={styles.collectionEmpty}>
          {activeFilter === OFFERS_TAB ? 'لا توجد منتجات عليها عروض حالياً.' : 'لا توجد منتجات ضمن هذا الفلتر.'}
        </RText>
      ) : null}
      {!loading && !products.length && !reels.length && !coupons.length ? (
        <RText style={styles.collectionEmpty}>لا توجد بيانات متاحة حالياً.</RText>
      ) : null}
    </ScreenScroll>
  );
}
