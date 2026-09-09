import React, { useMemo, useState } from 'react';
import { Image, ImageBackground, ScrollView, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { styles } from '../theme/styles';
import * as Icons from '../../../../icons';
import {
  AppIcon,
  CategoryStrip,
  CouponCard,
  HeaderSearch,
  ProductCard,
  RText,
  ReelCard,
  RtlHorizontalScroll,
  SectionTitle,
  Tabs,
  formatSyp,
  images,
  palette,
} from '../shared/marketplaceShared';

function ScreenScroll({ children }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.screenScrollContent}>
      {children}
    </ScrollView>
  );
}

function DataNotice({ loading, error, onRetry }) {
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

function listOrEmpty(list) {
  return Array.isArray(list) ? list.filter(Boolean) : [];
}

const PRODUCT_GRID_GAP = 10;
const homeTabs = ['الكل', 'عروض', 'أدوات معدلة', 'ألعاب أطفال', 'المنازل', 'العروض'];

function useMarketplaceLayout() {
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

export function SearchScreen({
  catalog,
  searchResults,
  onSearch,
  onOpenProduct,
  onAddToCart,
  onToggleFavorite,
  favorites,
}) {
  const [query, setQuery] = useState('');
  const productList = searchResults ? listOrEmpty(searchResults.products) : listOrEmpty(catalog?.products);
  const categories = listOrEmpty(catalog?.categories);
  const { productCardStyle } = useMarketplaceLayout();

  return (
    <ScreenScroll>
      <HeaderSearch
        compact
        value={query}
        onChangeText={setQuery}
        onSubmit={() => onSearch?.(query)}
      />
      <CategoryStrip double items={categories} />
      <View style={styles.productGrid}>
        {productList.map((product) => (
          <ProductCard
            key={`search-${product.id || product.title}`}
            product={product}
            style={productCardStyle}
            onOpen={onOpenProduct}
            onAddToCart={onAddToCart}
            onToggleFavorite={onToggleFavorite}
            isFavorite={favorites.includes(product.id || product.title)}
          />
        ))}
      </View>
      {!productList.length ? <RText style={styles.collectionEmpty}>لا توجد منتجات مطابقة.</RText> : null}
    </ScreenScroll>
  );
}

function StoreInfoScreen({ catalog, onOpenProduct, onAddToCart, onToggleFavorite, onShowAll, favorites }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.storeInner}>
      <RText style={styles.collectionEmpty}>لا توجد بيانات متجر محدد حالياً.</RText>
    </ScrollView>
  );
}

function StoreListScreen({ catalog, onShowAll }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.storeInner}>
      <HeaderSearch title="المتاجر" compact />
      <RText style={styles.collectionEmpty}>لا توجد متاجر متاحة من الباك إند حالياً.</RText>
    </ScrollView>
  );
}

function ReviewsScreen({ rateMode = false, onSubmitReview }) {
  const [comment, setComment] = useState('');

  if (rateMode) {
    return (
      <View style={styles.rateScreen}>
        <RText style={styles.rateQuestion}>كيف كانت تجربتك في المتجر؟</RText>
        <View style={styles.rateStars}>
          {[0, 1, 2, 3, 4].map((item) => (
            <AppIcon key={item} icon={Icons.Star} size={26} color={palette.amber} />
          ))}
        </View>
        <RText style={styles.rateWord}>ممتازة</RText>
        <TextInput
          multiline
          textAlign="right"
          placeholder="اكتب تعليقك (اختياري)"
          placeholderTextColor="#A7AFB7"
          style={styles.commentBox}
          value={comment}
          onChangeText={setComment}
        />
        <RText style={styles.rateQuestion}>أضف صورة من تجربتك (اختياري)</RText>
        <View style={styles.uploadRow}>
          <View style={styles.uploadBox} />
          <View style={styles.uploadBox} />
          <TouchableOpacity style={styles.uploadDashed}>
            <AppIcon icon={Icons.Camera} size={22} color={palette.muted} />
            <RText style={styles.uploadText}>إضافة صورة</RText>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.submitButton} onPress={() => onSubmitReview?.(comment)}>
          <RText style={styles.submitText}>إرسال التقييم</RText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.storeInner}>
      <RText style={styles.collectionEmpty}>لا توجد تقييمات متاحة من الباك إند حالياً.</RText>
    </ScrollView>
  );
}

export function StoreScreen({ catalog, onOpenProduct, onAddToCart, onToggleFavorite, onShowAll, favorites, onSubmitReview }) {
  const [view, setView] = useState('صفحة المتجر');

  return (
    <View style={styles.screenFull}>
      <Tabs
        compact
        tabs={['صفحة المتجر', 'المتاجر', 'التقييمات', 'إرسال تقييم']}
        active={view}
        onChange={setView}
      />
      {view === 'صفحة المتجر' ? (
        <StoreInfoScreen
          catalog={catalog}
          onOpenProduct={onOpenProduct}
          onAddToCart={onAddToCart}
          onToggleFavorite={onToggleFavorite}
          onShowAll={onShowAll}
          favorites={favorites}
        />
      ) : null}
      {view === 'المتاجر' ? <StoreListScreen catalog={catalog} onShowAll={onShowAll} /> : null}
      {view === 'التقييمات' ? <ReviewsScreen /> : null}
      {view === 'إرسال تقييم' ? <ReviewsScreen rateMode onSubmitReview={onSubmitReview} /> : null}
    </View>
  );
}

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

export function ProductDetailsScreen({
  product,
  onBack,
  onAddToCart,
  onToggleFavorite,
  isFavorite,
  onGoToCart,
}) {
  const [quantity, setQuantity] = useState(1);
  if (!product) return null;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailsContent}>
      <View style={styles.detailsTopBar}>
        <TouchableOpacity style={styles.detailsTopButton} onPress={onBack}>
          <AppIcon icon={Icons.ArrowRight} size={19} color={palette.greenDark} />
        </TouchableOpacity>
        <RText style={styles.detailsHeaderTitle}>تفاصيل المنتج</RText>
        <TouchableOpacity style={styles.detailsTopButton} onPress={onGoToCart}>
          <AppIcon icon={Icons.ShoppingBag} size={19} color={palette.greenDark} />
        </TouchableOpacity>
      </View>

      <View style={styles.detailsImageWrap}>
        {product.image ? (
          <Image source={product.image} style={styles.detailsImage} />
        ) : (
          <View style={[styles.detailsImage, { alignItems: 'center', justifyContent: 'center', backgroundColor: palette.greenSoft }]}>
            <AppIcon icon={Icons.Package} size={42} color={palette.green} />
          </View>
        )}
        <TouchableOpacity style={styles.detailsFavorite} onPress={() => onToggleFavorite(product)}>
          <AppIcon
            icon={Icons.Heart}
            size={22}
            color={isFavorite ? palette.amber : palette.white}
            strokeWidth={isFavorite ? 3 : 2}
          />
        </TouchableOpacity>
        <View style={styles.detailsDots}>
          <View style={[styles.detailsDot, styles.detailsDotActive]} />
          <View style={styles.detailsDot} />
          <View style={styles.detailsDot} />
        </View>
      </View>

      <View style={styles.detailsBody}>
        <View style={styles.detailsBadgeRow}>
          {product.freeDelivery ? (
            <View style={styles.detailsDelivery}>
              <AppIcon icon={Icons.Truck} size={16} color={palette.green} />
              <RText style={styles.detailsDeliveryText}>توصيل مجاني</RText>
            </View>
          ) : <View />}
          <View style={styles.detailsRating}>
            <RText style={styles.detailsRatingText}>{Number(product.rating || 0).toFixed(1)}</RText>
            <AppIcon icon={Icons.Star} size={14} color={palette.amber} />
          </View>
        </View>
        <RText style={styles.detailsTitle}>{product.title}</RText>
        <View style={styles.detailsStoreRow}>
          <View style={styles.detailsStoreAvatar} />
          <View style={{ flex: 1 }}>
            <RText style={styles.detailsStoreName}>{product.store}</RText>
            <RText style={styles.tinyMuted}>{product.category || '-'}</RText>
          </View>
          <TouchableOpacity style={styles.detailsStoreButton}>
            <RText style={styles.detailsStoreButtonText}>زيارة المتجر</RText>
          </TouchableOpacity>
        </View>
        <RText style={styles.detailsPrice}>{product.price}</RText>
        <View style={styles.detailsDivider} />
        <RText style={styles.detailsSectionTitle}>وصف المنتج</RText>
        <RText style={styles.detailsDescription}>
          {product.description || 'لا يوجد وصف لهذا المنتج.'}
        </RText>
        <View style={styles.detailsQuantityRow}>
          <RText style={styles.detailsSectionTitle}>الكمية</RText>
          <View style={styles.detailsQuantity}>
            <TouchableOpacity
              style={styles.detailsQtyButton}
              onPress={() => setQuantity((current) => Math.max(1, current - 1))}
            >
              <AppIcon icon={Icons.Minus} size={14} color={palette.greenDark} />
            </TouchableOpacity>
            <RText style={styles.detailsQtyValue}>{quantity}</RText>
            <TouchableOpacity style={styles.detailsQtyButton} onPress={() => setQuantity((current) => current + 1)}>
              <AppIcon icon={Icons.Plus} size={14} color={palette.greenDark} />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.detailsAddButton} onPress={() => onAddToCart(product, quantity)}>
          <View>
            <RText style={styles.detailsAddText}>أضف إلى السلة</RText>
            <RText style={styles.detailsAddSub}>{formatSyp((product.priceValue || 0) * quantity)}</RText>
          </View>
          <AppIcon icon={Icons.ShoppingCart} size={22} color={palette.white} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function formatCartSyp(value) {
  const amount = Number(value) || 0;
  return `${new Intl.NumberFormat('en-US').format(amount).replace(/,/g, '.')} ل.س`;
}

function formatCartUsd(value) {
  const amount = Number(value) || 0;
  return `$ ${new Intl.NumberFormat('en-US').format(amount).replace(/,/g, '.')}`;
}

function CartCheckmark() {
  return <View style={styles.cartCheckmark} />;
}

function CartSummaryRow({ label, value, strong = false }) {
  return (
    <View style={[styles.cartReceiptLine, strong && styles.cartReceiptLineStrong]}>
      <RText style={[styles.cartReceiptValue, strong && styles.cartReceiptValueStrong]}>{value}</RText>
      <RText style={[styles.cartReceiptLabel, strong && styles.cartReceiptLabelStrong]}>{label}</RText>
    </View>
  );
}

function CartCouponBanner() {
  return (
    <View style={styles.cartCouponBanner}>
      <View style={styles.cartCouponInfo}>
        <AppIcon icon={Icons.TicketPercent || Icons.Ticket || Icons.BadgePercent} size={33} color={palette.green} strokeWidth={2.3} />
        <View style={styles.cartCouponTextBlock}>
          <RText style={styles.cartCouponTitle}>لديك كوبون خصم؟</RText>
          <RText style={styles.cartCouponSub}>اضف الكود للحصول على خصم اضافي</RText>
        </View>
      </View>
      <TouchableOpacity style={styles.cartCouponAction}>
        <AppIcon icon={Icons.ChevronLeft} size={16} color={palette.amber} />
        <RText style={styles.cartCouponActionText}>إضافة كود</RText>
      </TouchableOpacity>
    </View>
  );
}

function CartQuantityControl({ product, quantity, id, onUpdateQuantity }) {
  return (
    <View style={styles.cartQty}>
      <TouchableOpacity style={styles.cartQtyButton} onPress={() => onUpdateQuantity(product, quantity - 1, id)}>
        <AppIcon icon={Icons.Minus} size={15} color={palette.ink} strokeWidth={2.7} />
      </TouchableOpacity>
      <RText style={styles.cartQtyValue}>{quantity}</RText>
      <TouchableOpacity style={styles.cartQtyButton} onPress={() => onUpdateQuantity(product, quantity + 1, id)}>
        <AppIcon icon={Icons.Plus} size={15} color={palette.ink} strokeWidth={2.7} />
      </TouchableOpacity>
    </View>
  );
}

function CartProductItem({ item, onUpdateQuantity }) {
  const { id, product, quantity } = item;
  const price = Number(product.priceValue || 0) * quantity;
  const oldPrice = Number(product.oldPriceValue || product.compareAtPrice || product?.raw?.compareAtPrice || 0) || price + 5000;

  return (
    <View style={styles.cartItem}>
      <View style={styles.cartItemCheckbox}>
        <CartCheckmark />
      </View>
      {product.image ? (
        <Image source={product.image} style={styles.cartItemImage} />
      ) : (
        <View style={[styles.cartItemImage, styles.cartItemImageFallback]}>
          <AppIcon icon={Icons.Package} size={22} color={palette.green} />
        </View>
      )}
      <View style={styles.cartItemBody}>
        <RText numberOfLines={1} style={styles.cartItemTitle}>{product.title}</RText>
        <View style={styles.cartItemStoreRow}>
          <View style={styles.cartStoreAvatar}>
            {product.image ? <Image source={product.image} style={styles.cartStoreAvatarImage} /> : null}
          </View>
          <RText numberOfLines={1} style={styles.cartItemStore}>{product.store || 'متجر الشريحة الذكية'}</RText>
        </View>
        <RText style={styles.cartItemColor}>اللون: أزرق</RText>
        <View style={styles.cartPriceRow}>
          <RText style={styles.cartItemPrice}>{formatCartSyp(price)}</RText>
          <RText style={styles.cartOldPrice}>{formatCartSyp(oldPrice)}</RText>
        </View>
        <CartQuantityControl product={product} quantity={quantity} id={id} onUpdateQuantity={onUpdateQuantity} />
      </View>
    </View>
  );
}

function CartOrderSummary({ subtotal, shippingCost, onCheckout }) {
  return (
    <View style={styles.cartSummary}>
      <RText style={styles.cartSummaryTitle}>ملخص الطلب</RText>
      <View style={styles.cartSummaryDashed}>
        <CartSummaryRow label="المجموع" value={formatCartUsd(shippingCost)} />
        <CartSummaryRow label="وزن الصندوق" value="300 g" />
        <CartSummaryRow label="كلفة الشحن" value={formatCartUsd(shippingCost)} />
        <CartSummaryRow label="التكلفة الإجمالية" value={formatCartUsd(shippingCost || subtotal)} strong />
      </View>
      <TouchableOpacity style={styles.checkoutButton} onPress={onCheckout}>
        <RText style={styles.checkoutText}>تأكيد</RText>
      </TouchableOpacity>
    </View>
  );
}

function CartCheckoutSheet({ itemCount, subtotal, onCheckout }) {
  return (
    <View style={styles.cartCheckoutSheet}>
      <View style={styles.cartCheckoutMeta}>
        <View style={styles.cartSelectionInfo}>
          <CartCheckmark />
          <RText style={styles.cartSelectionTitle}>العناصر ({itemCount})</RText>
        </View>
        <RText style={styles.cartCheckoutTotal}>{formatCartSyp(subtotal)}</RText>
      </View>
      <TouchableOpacity style={styles.cartCheckoutButton} onPress={onCheckout}>
        <AppIcon icon={Icons.ShoppingCart} size={25} color={palette.white} strokeWidth={2.4} />
        <RText style={styles.cartCheckoutText}>التقدم بإتمام الشراء</RText>
      </TouchableOpacity>
    </View>
  );
}

export function CartScreen({ cart, onUpdateQuantity, onRemove, onContinueShopping, onCheckout }) {
  const subtotal = useMemo(
    () => cart.reduce((total, item) => total + (item.product.priceValue || 0) * item.quantity, 0),
    [cart],
  );
  const itemCount = cart.length;
  const shippingCost = 3490;

  if (!cart.length) {
    return (
      <View style={styles.emptyCart}>
        <View style={styles.emptyCartIcon}>
          <AppIcon icon={Icons.ShoppingCart} size={38} color={palette.green} />
        </View>
        <RText style={styles.emptyCartTitle}>سلتك فارغة</RText>
        <RText style={styles.emptyCartText}>أضف منتجاتك المفضلة وسنحتفظ بها هنا.</RText>
        <TouchableOpacity style={styles.emptyCartButton} onPress={onContinueShopping}>
          <RText style={styles.emptyCartButtonText}>ابدأ التسوق</RText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.cartScreen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.cartContent}>
        <View style={styles.cartTopBar}>
          <RText style={styles.cartMiniTitle}>السلة</RText>
          <TouchableOpacity style={styles.cartBackButton} onPress={onContinueShopping}>
            <AppIcon icon={Icons.ChevronRight} size={23} color={palette.green} strokeWidth={2.5} />
          </TouchableOpacity>
          <RText style={styles.cartTitle}>محتويات سلة التسوق</RText>
        </View>

        <View style={styles.cartSelectionBar}>
          <TouchableOpacity
            style={styles.cartTrashButton}
            onPress={() => cart.forEach(({ id, product }) => onRemove(product, id))}
          >
            <AppIcon icon={Icons.Trash2} size={21} color="#FF563F" strokeWidth={1.8} />
          </TouchableOpacity>
          <View style={styles.cartSelectionInfo}>
            <CartCheckmark />
            <RText style={styles.cartSelectionTitle}>العناصر ({itemCount})</RText>
          </View>
        </View>

        {cart.map((item, index) => (
          <CartProductItem key={item.id || item.product.id || `${item.product.title}-${index}`} item={item} onUpdateQuantity={onUpdateQuantity} />
        ))}

        <CartCouponBanner />
        <CartOrderSummary subtotal={subtotal} shippingCost={shippingCost} onCheckout={onCheckout} />
      </ScrollView>
      <CartCheckoutSheet itemCount={itemCount} subtotal={subtotal} onCheckout={onCheckout} />
    </View>
  );
}

export function CheckoutScreen({ cart, onBack, onComplete, submitting }) {
  const [payment, setPayment] = useState('COD');
  const [city, setCity] = useState('دمشق');
  const [address, setAddress] = useState('المالكي، الشارع الرئيسي');
  const [phone, setPhone] = useState('0999000002');
  const subtotal = cart.reduce((total, item) => total + (item.product.priceValue || 0) * item.quantity, 0);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.checkoutContent}>
      <View style={styles.detailsTopBar}>
        <TouchableOpacity style={styles.detailsTopButton} onPress={onBack}>
          <AppIcon icon={Icons.ArrowRight} size={19} color={palette.greenDark} />
        </TouchableOpacity>
        <RText style={styles.detailsHeaderTitle}>إتمام الطلب</RText>
        <View style={styles.detailsTopSpacer} />
      </View>

      <RText style={styles.checkoutSectionTitle}>عنوان التوصيل</RText>
      <View style={styles.checkoutPanel}>
        <AuthField label="المدينة" value={city} onChangeText={setCity} placeholder="دمشق" icon={Icons.MapPin} />
        <AuthField label="العنوان بالتفصيل" value={address} onChangeText={setAddress} placeholder="الحي، الشارع، البناء" icon={Icons.Home} />
        <AuthField label="رقم الهاتف" value={phone} onChangeText={setPhone} placeholder="09XXXXXXXX" icon={Icons.Phone} />
      </View>

      <RText style={styles.checkoutSectionTitle}>طريقة الدفع</RText>
      <View style={styles.paymentOptions}>
        <TouchableOpacity
          style={[styles.paymentOption, payment === 'COD' && styles.paymentOptionActive]}
          onPress={() => setPayment('COD')}
        >
          <View style={[styles.paymentRadio, payment === 'COD' && styles.paymentRadioActive]}>
            {payment === 'COD' ? <View style={styles.paymentRadioDot} /> : null}
          </View>
          <View style={{ flex: 1 }}>
            <RText style={styles.paymentTitle}>الدفع عند الاستلام</RText>
            <RText style={styles.tinyMuted}>ادفع نقدًا عند وصول الطلب</RText>
          </View>
          <AppIcon icon={Icons.Banknote} size={24} color={palette.green} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.paymentOption, payment === 'SHAM_CASH' && styles.paymentOptionActive]}
          onPress={() => setPayment('SHAM_CASH')}
        >
          <View style={[styles.paymentRadio, payment === 'SHAM_CASH' && styles.paymentRadioActive]}>
            {payment === 'SHAM_CASH' ? <View style={styles.paymentRadioDot} /> : null}
          </View>
          <View style={{ flex: 1 }}>
            <RText style={styles.paymentTitle}>شام كاش</RText>
            <RText style={styles.tinyMuted}>دفع إلكتروني عبر محفظة شام كاش</RText>
          </View>
          <AppIcon icon={Icons.CreditCard} size={24} color={palette.green} />
        </TouchableOpacity>
      </View>

      <View style={styles.checkoutSummary}>
        <View style={styles.cartSummaryLine}>
          <RText style={styles.cartSummaryValue}>{formatSyp(subtotal)}</RText>
          <RText style={styles.cartSummaryLabel}>قيمة المنتجات</RText>
        </View>
        <View style={styles.cartSummaryLine}>
          <RText style={styles.cartSummaryFree}>مجاني</RText>
          <RText style={styles.cartSummaryLabel}>التوصيل</RText>
        </View>
        <View style={styles.cartSummaryDivider} />
        <View style={styles.cartSummaryLine}>
          <RText style={styles.cartTotalValue}>{formatSyp(subtotal)}</RText>
          <RText style={styles.cartTotalLabel}>الإجمالي النهائي</RText>
        </View>
      </View>

      <TouchableOpacity
        style={styles.checkoutButton}
        onPress={() =>
          onComplete({
            paymentMethod: payment,
            address: { label: 'المنزل', city, line1: address, phone },
          })
        }
      >
        <RText style={styles.checkoutText}>{submitting ? 'جاري تأكيد الطلب...' : 'تأكيد الطلب'}</RText>
        <AppIcon icon={Icons.CircleCheck} size={20} color={palette.white} />
      </TouchableOpacity>
    </ScrollView>
  );
}

export function OrderSuccessScreen({ order, onHome }) {
  return (
    <View style={styles.successScreen}>
      <View style={styles.successIcon}>
        <AppIcon icon={Icons.Check} size={44} color={palette.white} strokeWidth={3} />
      </View>
      <RText style={styles.successTitle}>تم تأكيد طلبك</RText>
      <RText style={styles.successText}>سنرسل لك تحديثات الطلب وحالة التوصيل أولًا بأول.</RText>
      <View style={styles.successOrderNumber}>
        <RText style={styles.tinyMuted}>رقم الطلب</RText>
        <RText style={styles.successNumber}>{order?.number || '-'}</RText>
      </View>
      <TouchableOpacity style={styles.successButton} onPress={onHome}>
        <RText style={styles.successButtonText}>العودة إلى الرئيسية</RText>
      </TouchableOpacity>
    </View>
  );
}

export function ReelsScreen({ reel, onAddToCart, onBack }) {
  const [quantity, setQuantity] = useState(1);
  const currentProduct = reel?.product;

  if (!reel) {
    return (
      <View style={styles.emptyCart}>
        <View style={styles.emptyCartIcon}>
          <AppIcon icon={Icons.Video} size={38} color={palette.green} />
        </View>
        <RText style={styles.emptyCartTitle}>لا توجد ريلز متاحة</RText>
        <TouchableOpacity style={styles.emptyCartButton} onPress={onBack}>
          <RText style={styles.emptyCartButtonText}>العودة</RText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.reelsScreen}>
      {reel.image ? (
        <ImageBackground source={reel.image} style={styles.reelsBackground} resizeMode="cover">
          <View style={styles.reelsOverlay}>
            <View style={styles.reelsTopButtons}>
              <View style={styles.reelsLeftButtons}>
                <TouchableOpacity style={styles.reelsButton}>
                  <AppIcon icon={Icons.Share2} size={18} color={palette.green} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.reelsButton}>
                  <AppIcon icon={Icons.ShoppingBag} size={18} color={palette.green} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.reelsButton} onPress={onBack}>
                <AppIcon icon={Icons.ChevronLeft} size={20} color={palette.green} />
              </TouchableOpacity>
            </View>
            <View style={styles.reelsCartSheet}>
              <RText style={styles.detailsStoreName}>{reel?.title || '-'}</RText>
              <View style={styles.qtyRow}>
                <RText style={styles.sheetPrice}>{currentProduct ? formatSyp((currentProduct.priceValue || 0) * quantity) : '-'}</RText>
                <View style={styles.qtyControls}>
                  <TouchableOpacity style={styles.qtyButton} onPress={() => setQuantity((current) => Math.max(1, current - 1))}>
                    <AppIcon icon={Icons.Minus} size={14} color={palette.muted} />
                  </TouchableOpacity>
                  <RText style={styles.qtyValue}>{quantity}</RText>
                  <TouchableOpacity style={styles.qtyButton} onPress={() => setQuantity((current) => current + 1)}>
                    <AppIcon icon={Icons.Plus} size={14} color={palette.muted} />
                  </TouchableOpacity>
                  <RText style={styles.qtyLabel}>العناصر المختارة</RText>
                </View>
              </View>
              {currentProduct ? (
                <TouchableOpacity style={styles.addToCartButton} onPress={() => onAddToCart(currentProduct, quantity)}>
                  <AppIcon icon={Icons.ShoppingCart} size={22} color={palette.white} />
                  <RText style={styles.addToCartText}>أضف للسلة</RText>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </ImageBackground>
      ) : (
        <View style={[styles.reelsBackground, { alignItems: 'center', justifyContent: 'center', backgroundColor: palette.greenSoft }]}>
          <AppIcon icon={Icons.Video} size={42} color={palette.green} />
        </View>
      )}
    </View>
  );
}

function AuthField({ label, placeholder, icon, secure = false, leadingIcon, value, onChangeText }) {
  const [visible, setVisible] = useState(false);
  const secureEntry = secure && !visible;
  const LeadingIcon = secure ? (visible ? Icons.Eye : Icons.EyeOff) : leadingIcon;

  return (
    <View style={styles.authFieldBlock}>
      <RText style={styles.authLabel}>{label}</RText>
      <View style={styles.authInputShell}>
        {LeadingIcon ? (
          <TouchableOpacity
            disabled={!secure}
            onPress={() => setVisible((current) => !current)}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <AppIcon icon={LeadingIcon} size={19} color={palette.green} />
          </TouchableOpacity>
        ) : null}
        <TextInput
          style={styles.authInput}
          placeholder={placeholder}
          placeholderTextColor="#A2ABB4"
          secureTextEntry={secureEntry}
          textAlign="right"
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <AppIcon icon={icon} size={20} color={palette.amber} />
      </View>
    </View>
  );
}

export function AuthScreen({ session, authLoading, authError, onLogin, onRegister, onLogout }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
  });
  const login = mode === 'login';
  const update = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));

  if (session?.user) {
    return (
      <ScreenScroll>
        <View style={styles.successScreen}>
          <View style={styles.successIcon}>
            <AppIcon icon={Icons.UserCheck || Icons.Check} size={42} color={palette.white} />
          </View>
          <RText style={styles.successTitle}>أهلًا {session.user.firstName}</RText>
          <RText style={styles.successText}>تم ربط حسابك بالباك إند ويمكنك مزامنة السلة والطلبات.</RText>
          <TouchableOpacity style={styles.successButton} onPress={onLogout}>
            <RText style={styles.successButtonText}>تسجيل الخروج</RText>
          </TouchableOpacity>
        </View>
      </ScreenScroll>
    );
  }

  return (
    <ScreenScroll>
      <View style={styles.authTabs}>
        {['login', 'signup'].map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setMode(item)}
            style={[styles.authTab, mode === item && styles.authTabActive]}
          >
            <RText style={[styles.authTabText, mode === item && styles.authTabTextActive]}>
              {item === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب'}
            </RText>
          </TouchableOpacity>
        ))}
      </View>
      <RText style={styles.authTitle}>{login ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</RText>
      {authError ? (
        <RText style={[styles.authQuestion, { color: palette.danger }]}>{authError}</RText>
      ) : null}
      {login ? (
        <>
          <AuthField label="رقم الهاتف" value={form.phone} onChangeText={update('phone')} placeholder="09XXXXXXXX" icon={Icons.Phone} />
          <AuthField label="كلمة المرور" value={form.password} onChangeText={update('password')} placeholder="**********" icon={Icons.Lock} leadingIcon={Icons.EyeOff} secure />
          <View style={styles.authInline}>
            <TouchableOpacity>
              <RText style={styles.linkText}>نسيت كلمة المرور؟</RText>
            </TouchableOpacity>
            <View style={styles.rememberRow}>
              <View style={styles.checkbox} />
              <RText style={styles.tinyMuted}>تذكرني</RText>
            </View>
          </View>
          <TouchableOpacity style={styles.authPrimary} onPress={() => onLogin?.({ phone: form.phone, password: form.password })}>
            <RText style={styles.authPrimaryText}>{authLoading ? 'جاري الدخول...' : 'تسجيل الدخول'}</RText>
          </TouchableOpacity>
          <RText style={styles.authQuestion}>لم تقم بالاشتراك معنا؟</RText>
          <TouchableOpacity onPress={() => setMode('signup')}>
            <RText style={styles.linkText}>إنشاء حساب سهل ولن يستغرق أكثر من دقيقة</RText>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.twoColumns}>
            <AuthField label="الاسم الأول" value={form.firstName} onChangeText={update('firstName')} placeholder="الاسم الأول" icon={Icons.User} />
            <AuthField label="اسم العائلة" value={form.lastName} onChangeText={update('lastName')} placeholder="اسم العائلة" icon={Icons.User} />
          </View>
          <AuthField label="رقم الهاتف" value={form.phone} onChangeText={update('phone')} placeholder="09XXXXXXXX" icon={Icons.Phone} />
          <AuthField label="كلمة المرور" value={form.password} onChangeText={update('password')} placeholder="**********" icon={Icons.Lock} leadingIcon={Icons.EyeOff} secure />
          <View style={styles.termsRow}>
            <View style={styles.checkbox} />
            <RText style={styles.linkText}>أوافق على شروط وأحكام استخدام خان</RText>
          </View>
          <TouchableOpacity
            style={styles.authPrimary}
            onPress={() => onRegister?.({
              firstName: form.firstName,
              lastName: form.lastName,
              phone: form.phone,
              password: form.password,
              role: 'CUSTOMER',
            })}
          >
            <RText style={styles.authPrimaryText}>{authLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}</RText>
          </TouchableOpacity>
          <View style={styles.authQuestionRow}>
            <RText style={styles.authQuestion}>لديك حساب مسبق؟</RText>
            <TouchableOpacity onPress={() => setMode('login')}>
              <RText style={styles.linkText}>تسجيل دخول</RText>
            </TouchableOpacity>
          </View>
        </>
      )}
      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <RText style={styles.tinyMuted}>أو</RText>
        <View style={styles.divider} />
      </View>
      <TouchableOpacity style={styles.googleButton}>
        <Image source={images.google} style={styles.googleIcon} />
        <RText style={styles.googleText}>سجل عن طريق غوغل</RText>
      </TouchableOpacity>
    </ScreenScroll>
  );
}
