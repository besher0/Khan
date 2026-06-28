import React, { useMemo, useState } from 'react';
import { Image, ImageBackground, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { styles } from '../theme/styles';
import * as Icons from '../../../../icons';
import {
  AppIcon,
  CategoryStrip,
  CouponCard,
  HeaderSearch,
  ProductCard,
  PromoBanner,
  RText,
  ReelCard,
  SectionTitle,
  Tabs,
  categories as fallbackCategories,
  coupons as fallbackCoupons,
  formatSyp,
  images,
  palette,
  products as fallbackProducts,
  reels as fallbackReels,
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

function listOrFallback(list, fallback) {
  return Array.isArray(list) && list.length ? list : fallback;
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
  favorites,
}) {
  const [tab, setTab] = useState('الكل');
  const [query, setQuery] = useState('');
  const products = listOrFallback(catalog?.products, fallbackProducts);
  const categories = listOrFallback(catalog?.categories, fallbackCategories);
  const reels = listOrFallback(catalog?.reels, fallbackReels);
  const coupons = listOrFallback(catalog?.coupons, fallbackCoupons);

  return (
    <ScreenScroll>
      <HeaderSearch value={query} onChangeText={setQuery} onSubmit={() => onSearch?.(query)} />
      <DataNotice loading={loading} error={error} onRetry={onRetry} />
      <PromoBanner />
      <CategoryStrip items={categories} />
      <SectionTitle title="ريلز خان" icon={Icons.Video} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCards}>
        {reels.map((item) => (
          <ReelCard key={item.id || item.title} item={item} onPress={onOpenReel} />
        ))}
      </ScrollView>
      <SectionTitle title="كوبونات خان" icon={Icons.Ticket || Icons.Tag} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCards}>
        {coupons.map((coupon, index) => (
          <CouponCard key={coupon.id || `${coupon.code}-${index}`} coupon={coupon} index={index} />
        ))}
      </ScrollView>
      <SectionTitle title="موصى به لك" icon={Icons.Flame || Icons.Star} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCards}>
        {products.slice(0, 3).map((product) => (
          <ProductCard
            key={product.id || product.title}
            product={product}
            compact
            onOpen={onOpenProduct}
            onAddToCart={onAddToCart}
            onToggleFavorite={onToggleFavorite}
            isFavorite={favorites.includes(product.id || product.title)}
          />
        ))}
      </ScrollView>
      <View style={styles.offerBand}>
        <View style={styles.offerCard}>
          <Image source={images.cup} style={styles.offerImage} />
          <View style={styles.offerText}>
            <RText style={styles.offerTitle}>توصيل مجاني</RText>
            <RText style={styles.offerSub}>اشتري بـ 500 ألف أو أكثر</RText>
            <TouchableOpacity style={styles.offerButton}>
              <RText style={styles.offerButtonText}>تسوق الآن</RText>
            </TouchableOpacity>
          </View>
        </View>
        <View style={[styles.offerCard, styles.offerCardAmber]}>
          <Image source={images.giftBox} style={styles.offerImage} />
          <View style={styles.offerText}>
            <RText style={styles.offerTitle}>خصم حتى 10%</RText>
            <RText style={styles.offerSub}>اشتر ووفر أكثر</RText>
            <TouchableOpacity style={[styles.offerButton, styles.offerButtonAmber]}>
              <RText style={styles.offerButtonText}>تسوق الآن</RText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Tabs
        tabs={['الكل', 'عروض', 'أدوات منزلية', 'ألعاب أطفال', 'المنزل', 'الأزياء']}
        active={tab}
        onChange={setTab}
      />
      <View style={styles.productGrid}>
        {products.map((product) => (
          <ProductCard
            key={`grid-${product.id || product.title}`}
            product={product}
            onOpen={onOpenProduct}
            onAddToCart={onAddToCart}
            onToggleFavorite={onToggleFavorite}
            isFavorite={favorites.includes(product.id || product.title)}
          />
        ))}
      </View>
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
  const [tab, setTab] = useState('الكل');
  const [query, setQuery] = useState('');
  const productList = listOrFallback(searchResults?.products, listOrFallback(catalog?.products, fallbackProducts));
  const categories = listOrFallback(catalog?.categories, fallbackCategories);

  return (
    <ScreenScroll>
      <HeaderSearch
        compact
        value={query}
        onChangeText={setQuery}
        onSubmit={() => onSearch?.(query)}
      />
      <CategoryStrip double items={categories} />
      <Tabs
        tabs={['الكل', 'عروض', 'ألعاب أطفال', 'المنزل', 'الأزياء']}
        active={tab}
        onChange={setTab}
      />
      <View style={styles.productGrid}>
        {productList.map((product) => (
          <ProductCard
            key={`search-${product.id || product.title}`}
            product={product}
            onOpen={onOpenProduct}
            onAddToCart={onAddToCart}
            onToggleFavorite={onToggleFavorite}
            isFavorite={favorites.includes(product.id || product.title)}
          />
        ))}
      </View>
    </ScreenScroll>
  );
}

function Metric({ icon, label, value }) {
  return (
    <View style={styles.metric}>
      <AppIcon icon={icon} size={18} color={palette.muted} />
      <RText style={styles.metricLabel}>{label}</RText>
      <RText style={styles.metricValue}>{value}</RText>
    </View>
  );
}

function StoreInfoScreen({ catalog, onOpenProduct, onAddToCart, onToggleFavorite, favorites }) {
  const products = listOrFallback(catalog?.products, fallbackProducts);
  const coupons = listOrFallback(catalog?.coupons, fallbackCoupons);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.storeInner}>
      <View style={styles.storeTopActions}>
        <TouchableOpacity style={styles.roundIconGhost}>
          <AppIcon icon={Icons.Heart} size={18} color={palette.amber} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.roundIconGhost}>
          <AppIcon icon={Icons.Share2} size={18} color={palette.amber} />
        </TouchableOpacity>
        <RText style={styles.storeScreenTitle}>متجر خان</RText>
        <TouchableOpacity style={styles.greenTiny}>
          <AppIcon icon={Icons.ArrowLeft} size={16} color={palette.white} />
        </TouchableOpacity>
      </View>
      <Image source={images.storeBanner} style={styles.storeHero} />
      <View style={styles.storeStats}>
        <Metric icon={Icons.Clock} label="ساعات العمل" value="9:00 - 23:00" />
        <Metric icon={Icons.Tag} label="الفئة" value="إلكترونيات" />
        <Metric icon={Icons.MessageCircle} label="التقييم" value="4.5/5" />
        <Metric icon={Icons.Users} label="التعليقات" value="1,356" />
      </View>
      <SectionTitle title="كوبونات خان" icon={Icons.Ticket || Icons.Tag} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCards}>
        {coupons.map((coupon, index) => (
          <CouponCard key={`store-coupon-${coupon.id || index}`} coupon={coupon} index={index} />
        ))}
      </ScrollView>
      <View style={styles.storeRatingCard}>
        <View style={styles.ratingScoreBox}>
          <RText style={styles.bigRating}>4.5</RText>
          <View style={styles.starsRow}>
            {[0, 1, 2, 3, 4].map((item) => (
              <AppIcon key={item} icon={Icons.Star} size={14} color={palette.green} />
            ))}
          </View>
          <RText style={styles.tinyMuted}>1,212 تعليق</RText>
        </View>
        <View style={styles.ratingBars}>
          {[834, 88, 32, 12, 4].map((value, index) => (
            <View key={value} style={styles.ratingBarLine}>
              <RText style={styles.ratingLabel}>{5 - index} نجوم</RText>
              <View style={styles.ratingTrack}>
                <View style={[styles.ratingFill, { width: `${Math.max(12, value / 8.5)}%` }]} />
              </View>
            </View>
          ))}
        </View>
      </View>
      <Tabs tabs={['الكل', 'عروض', 'أدوات منزلية', 'ألعاب أطفال', 'المنزل']} active="الكل" onChange={() => {}} />
      <View style={styles.productGrid}>
        {products.slice(0, 4).map((product) => (
          <ProductCard
            key={`store-${product.id || product.title}`}
            product={product}
            onOpen={onOpenProduct}
            onAddToCart={onAddToCart}
            onToggleFavorite={onToggleFavorite}
            isFavorite={favorites.includes(product.id || product.title)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function StoreListScreen({ catalog }) {
  const products = listOrFallback(catalog?.products, fallbackProducts);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.storeInner}>
      <HeaderSearch title="المتاجر" compact />
      <SectionTitle title="كوبونات خان" icon={Icons.Ticket || Icons.Tag} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCards}>
        {fallbackCoupons.map((coupon, index) => (
          <CouponCard key={`list-coupon-${coupon.id || index}`} coupon={coupon} index={index} />
        ))}
      </ScrollView>
      <Tabs tabs={['الكل', 'خصومات', 'عروض', 'إلكتروني', 'المنزل']} active="إلكتروني" onChange={() => {}} />
      <View style={styles.storeCardGrid}>
        {products.slice(0, 6).map((product) => (
          <View key={`store-mini-${product.id || product.title}`} style={styles.storeMiniCard}>
            <Image source={product.image || images.electronics} style={styles.storeMiniImage} />
            <RText style={styles.storeMiniTitle}>{product.store || 'متجر خان'}</RText>
            <RText style={styles.storeMiniSub}>{product.category || 'إلكترونيات'}</RText>
            <View style={styles.storeMiniRating}>
              <RText style={styles.storeMiniRatingText}>4.5</RText>
              <AppIcon icon={Icons.Star} size={11} color={palette.amber} />
            </View>
            <TouchableOpacity style={styles.visitButton}>
              <RText style={styles.visitText}>زيارة المتجر</RText>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function ReviewsScreen({ rateMode = false, onSubmitReview }) {
  const [comment, setComment] = useState('');
  const sampleNames = ['أحمد هندي', 'رامي محمد', 'حسام حسين', 'محمد محمد'];

  if (rateMode) {
    return (
      <View style={styles.rateScreen}>
        <View style={styles.reviewStoreHeader}>
          <View style={styles.storeAvatarLarge} />
          <View style={{ flex: 1 }}>
            <RText style={styles.reviewStoreName}>متجر خان</RText>
            <RText style={styles.categoryChipText}>إلكترونيات</RText>
            <View style={styles.locationLine}>
              <AppIcon icon={Icons.MapPin} size={14} color={palette.amber} />
              <RText style={styles.tinyMuted}>دمشق</RText>
            </View>
          </View>
        </View>
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
      <View style={styles.storeRatingCard}>
        <View style={styles.ratingScoreBox}>
          <RText style={styles.bigRating}>4.5</RText>
          <View style={styles.starsRow}>
            {[0, 1, 2, 3, 4].map((item) => (
              <AppIcon key={item} icon={Icons.Star} size={14} color={palette.green} />
            ))}
          </View>
          <RText style={styles.tinyMuted}>1,212 تعليق</RText>
        </View>
        <TouchableOpacity style={styles.rateButton}>
          <RText style={styles.rateButtonText}>قيّم هذا المتجر</RText>
        </TouchableOpacity>
      </View>
      <View style={styles.commentHeader}>
        <RText style={styles.sectionHeading}>جميع التعليقات (1,232)</RText>
        <RText style={styles.tinyMuted}>الترتيب: الأحدث أولًا</RText>
      </View>
      {sampleNames.map((name) => (
        <View key={name} style={styles.commentCard}>
          <View style={styles.commentAvatar}>
            <AppIcon icon={Icons.User} size={22} color={palette.muted} />
          </View>
          <View style={styles.commentContent}>
            <RText style={styles.commentName}>{name}</RText>
            <View style={styles.starsRow}>
              {[0, 1, 2, 3, 4].map((item) => (
                <AppIcon key={item} icon={Icons.Star} size={13} color={palette.amber} />
              ))}
            </View>
            <RText style={styles.commentText}>جودة ممتازة جدًا وخصومات رائعة.</RText>
          </View>
          <RText style={styles.commentDate}>22/2/2026</RText>
        </View>
      ))}
    </ScrollView>
  );
}

export function StoreScreen({ catalog, onOpenProduct, onAddToCart, onToggleFavorite, favorites, onSubmitReview }) {
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
          favorites={favorites}
        />
      ) : null}
      {view === 'المتاجر' ? <StoreListScreen catalog={catalog} /> : null}
      {view === 'التقييمات' ? <ReviewsScreen /> : null}
      {view === 'إرسال تقييم' ? <ReviewsScreen rateMode onSubmitReview={onSubmitReview} /> : null}
    </View>
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
        <Image source={product.image} style={styles.detailsImage} />
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
            <RText style={styles.detailsRatingText}>{Number(product.rating || 4.5).toFixed(1)}</RText>
            <AppIcon icon={Icons.Star} size={14} color={palette.amber} />
          </View>
        </View>
        <RText style={styles.detailsTitle}>{product.title}</RText>
        <View style={styles.detailsStoreRow}>
          <View style={styles.detailsStoreAvatar} />
          <View style={{ flex: 1 }}>
            <RText style={styles.detailsStoreName}>{product.store}</RText>
            <RText style={styles.tinyMuted}>متجر موثوق في خان</RText>
          </View>
          <TouchableOpacity style={styles.detailsStoreButton}>
            <RText style={styles.detailsStoreButtonText}>زيارة المتجر</RText>
          </TouchableOpacity>
        </View>
        <RText style={styles.detailsPrice}>{product.price}</RText>
        <View style={styles.detailsDivider} />
        <RText style={styles.detailsSectionTitle}>وصف المنتج</RText>
        <RText style={styles.detailsDescription}>
          منتج مختار بعناية، بجودة عالية وتصميم عملي للاستخدام اليومي. العرض متوفر لفترة محدودة
          مع إمكانية التوصيل المجاني حسب المتجر.
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

export function CartScreen({ cart, onUpdateQuantity, onRemove, onContinueShopping, onCheckout }) {
  const subtotal = useMemo(
    () => cart.reduce((total, item) => total + (item.product.priceValue || 0) * item.quantity, 0),
    [cart],
  );

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
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.cartContent}>
      <View style={styles.cartHeader}>
        <RText style={styles.cartTitle}>السلة</RText>
        <RText style={styles.cartCount}>{cart.length} منتجات</RText>
      </View>

      {cart.map(({ id, product, quantity }) => (
        <View key={id || product.id || product.title} style={styles.cartItem}>
          <Image source={product.image} style={styles.cartItemImage} />
          <View style={styles.cartItemBody}>
            <RText numberOfLines={2} style={styles.cartItemTitle}>{product.title}</RText>
            <RText style={styles.cartItemStore}>{product.store}</RText>
            <RText style={styles.cartItemPrice}>{formatSyp((product.priceValue || 0) * quantity)}</RText>
            <View style={styles.cartItemFooter}>
              <View style={styles.cartQty}>
                <TouchableOpacity style={styles.cartQtyButton} onPress={() => onUpdateQuantity(product, quantity - 1, id)}>
                  <AppIcon icon={Icons.Minus} size={14} color={palette.greenDark} />
                </TouchableOpacity>
                <RText style={styles.cartQtyValue}>{quantity}</RText>
                <TouchableOpacity style={styles.cartQtyButton} onPress={() => onUpdateQuantity(product, quantity + 1, id)}>
                  <AppIcon icon={Icons.Plus} size={14} color={palette.greenDark} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.cartRemove} onPress={() => onRemove(product, id)}>
                <AppIcon icon={Icons.Trash2} size={17} color={palette.danger} />
                <RText style={styles.cartRemoveText}>حذف</RText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}

      <View style={styles.cartSummary}>
        <RText style={styles.cartSummaryTitle}>ملخص الطلب</RText>
        <View style={styles.cartSummaryLine}>
          <RText style={styles.cartSummaryValue}>{formatSyp(subtotal)}</RText>
          <RText style={styles.cartSummaryLabel}>المجموع</RText>
        </View>
        <View style={styles.cartSummaryLine}>
          <RText style={styles.cartSummaryFree}>مجاني</RText>
          <RText style={styles.cartSummaryLabel}>التوصيل</RText>
        </View>
        <View style={styles.cartSummaryDivider} />
        <View style={styles.cartSummaryLine}>
          <RText style={styles.cartTotalValue}>{formatSyp(subtotal)}</RText>
          <RText style={styles.cartTotalLabel}>الإجمالي</RText>
        </View>
        <TouchableOpacity style={styles.checkoutButton} onPress={onCheckout}>
          <RText style={styles.checkoutText}>متابعة إتمام الطلب</RText>
          <AppIcon icon={Icons.ArrowLeft} size={19} color={palette.white} />
        </TouchableOpacity>
      </View>
    </ScrollView>
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
        <RText style={styles.successNumber}>{order?.number || 'KH-2026-1048'}</RText>
      </View>
      <TouchableOpacity style={styles.successButton} onPress={onHome}>
        <RText style={styles.successButtonText}>العودة إلى الرئيسية</RText>
      </TouchableOpacity>
    </View>
  );
}

export function ReelsScreen({ reel, onAddToCart, onBack }) {
  const [quantity, setQuantity] = useState(1);
  const currentProduct = reel?.product || fallbackProducts[2];

  return (
    <View style={styles.reelsScreen}>
      <ImageBackground source={reel?.image || images.reelPhone} style={styles.reelsBackground} resizeMode="cover">
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
            <RText style={styles.detailsStoreName}>{reel?.title || 'عرض خان'}</RText>
            <View style={styles.qtyRow}>
              <RText style={styles.sheetPrice}>{formatSyp((currentProduct.priceValue || 0) * quantity)}</RText>
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
            <TouchableOpacity style={styles.addToCartButton} onPress={() => onAddToCart(currentProduct, quantity)}>
              <AppIcon icon={Icons.ShoppingCart} size={22} color={palette.white} />
              <RText style={styles.addToCartText}>أضف للسلة</RText>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

function AuthField({ label, placeholder, icon, secure = false, leadingIcon, value, onChangeText }) {
  return (
    <View style={styles.authFieldBlock}>
      <RText style={styles.authLabel}>{label}</RText>
      <View style={styles.authInputShell}>
        {leadingIcon ? <AppIcon icon={leadingIcon} size={19} color={palette.green} /> : null}
        <TextInput
          style={styles.authInput}
          placeholder={placeholder}
          placeholderTextColor="#A2ABB4"
          secureTextEntry={secure}
          textAlign="right"
          value={value}
          onChangeText={onChangeText}
        />
        <AppIcon icon={icon} size={20} color={palette.amber} />
      </View>
    </View>
  );
}

export function AuthScreen({ session, authLoading, authError, onLogin, onRegister, onLogout }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    firstName: 'سارة',
    lastName: 'خان',
    phone: '0999000002',
    email: 'customer@khan.local',
    password: 'Password123!',
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
          <AuthField label="البريد الإلكتروني" value={form.email} onChangeText={update('email')} placeholder="البريد الإلكتروني" icon={Icons.Mail} />
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
          <TouchableOpacity style={styles.authPrimary} onPress={() => onLogin?.({ email: form.email, password: form.password })}>
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
          <AuthField label="البريد الإلكتروني" value={form.email} onChangeText={update('email')} placeholder="البريد الإلكتروني" icon={Icons.Mail} />
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
              email: form.email,
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
