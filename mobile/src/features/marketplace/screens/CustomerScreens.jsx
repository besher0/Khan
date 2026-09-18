import React, { useEffect, useMemo, useState } from 'react';
import { Image, ImageBackground, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { styles } from '../theme/styles';
import * as Icons from '../../../../icons';
import { couponsApi } from '../../../services/api';
import {
  AppIcon,
  CouponCard,
  ProductCard,
  RText,
  ReelCard,
  RtlHorizontalScroll,
  SectionTitle,
  formatSyp,
  palette,
} from '../shared/marketplaceShared';
export { HomeScreen } from './HomeScreen';
export { SearchScreen } from './SearchScreen';
export {
  AllStoresScreen,
  RateStoreScreen,
  SavedStoresScreen,
  StoreDetailsScreen,
  StoreReviewsScreen,
} from './StoreScreen';
export { CollectionScreen } from './CollectionScreen';
export { ProductDetailsScreen } from './ProductDetailsScreen';
export { ReelsScreen } from './ReelsScreen';
import emptyBasketImage from '../../../../assets/empty-basket.jpg';
import emptyCartGuestImage from '../../../../assets/empty-cart-guest.png';
import guestMascotImage from '../../../../assets/guest-mascot.png';
import reviewMascotImage from '../../../../assets/review-mascot.jpg';
import { uploadsApi } from '../../../services/api';
import { DataNotice, listOrEmpty, ScreenScroll, useMarketplaceLayout } from './screenShared.jsx';

export function FavoritesScreen({
  products = [],
  favorites = [],
  onBack,
  onOpenProduct,
  onAddToCart,
  onToggleFavorite,
}) {
  const favoriteProducts = products.filter((product) => favorites.includes(product.id || product.title));
  const { productCardStyle } = useMarketplaceLayout();

  return (
    <ScreenScroll>
      <View style={styles.detailsTopBar}>
        <TouchableOpacity style={styles.detailsTopButton} onPress={onBack}>
          <AppIcon icon={Icons.ArrowRight} size={19} color={palette.greenDark} />
        </TouchableOpacity>
        <RText style={styles.detailsHeaderTitle}>المحفوظات</RText>
        <View style={styles.detailsTopButton} />
      </View>
      {favoriteProducts.length ? (
        <View style={styles.productGrid}>
          {favoriteProducts.map((product) => (
            <ProductCard
              key={`favorite-${product.id || product.title}`}
              product={product}
              style={productCardStyle}
              showcase
              onOpen={onOpenProduct}
              onAddToCart={onAddToCart}
              onToggleFavorite={onToggleFavorite}
              isFavorite
            />
          ))}
        </View>
      ) : (
        <RText style={styles.collectionEmpty}>لا توجد منتجات محفوظة حاليًا.</RText>
      )}
    </ScreenScroll>
  );
}

export function NotificationsScreen({ notifications = [], onBack, onMarkAllRead }) {
  return (
    <ScreenScroll>
      <View style={styles.detailsTopBar}>
        <TouchableOpacity style={styles.detailsTopButton} onPress={onBack}>
          <AppIcon icon={Icons.ArrowRight} size={19} color={palette.greenDark} />
        </TouchableOpacity>
        <RText style={styles.detailsHeaderTitle}>الإشعارات</RText>
        <TouchableOpacity style={styles.detailsTopButton} onPress={onMarkAllRead}>
          <AppIcon icon={Icons.CheckCheck || Icons.Check} size={19} color={palette.greenDark} />
        </TouchableOpacity>
      </View>
      {notifications.length ? (
        <View style={styles.notificationList}>
          {notifications.map((item) => (
            <View key={item.id || `${item.title}-${item.createdAt}`} style={styles.notificationItem}>
              <View style={[styles.notificationDot, item.readAt && styles.notificationDotRead]} />
              <View style={styles.notificationBody}>
                <RText style={styles.notificationTitle}>{item.title}</RText>
                <RText style={styles.notificationText}>{item.body}</RText>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <RText style={styles.collectionEmpty}>لا توجد إشعارات حاليًا.</RText>
      )}
    </ScreenScroll>
  );
}


function formatCartSyp(value) {
  const amount = Number(value) || 0;
  return `${new Intl.NumberFormat('en-US').format(amount).replace(/,/g, '.')} ل.س`;
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

function calculateCartCouponDiscount(coupon, subtotal) {
  if (!coupon || subtotal <= 0) return 0;

  const raw = coupon.raw || coupon;
  const minOrderAmount = Number(raw.minOrderAmount || 0);
  if (minOrderAmount && subtotal < minOrderAmount) return 0;

  const value = Number(raw.value || 0);
  const discount = raw.type === 'PERCENT' ? Math.floor((subtotal * value) / 100) : value;
  const maxDiscountAmount = Number(raw.maxDiscountAmount || 0);
  return Math.min(subtotal, maxDiscountAmount ? Math.min(discount, maxDiscountAmount) : discount);
}

function CartCouponBanner({
  coupons = [],
  cartStoreId,
  subtotal,
  appliedCouponCode,
  appliedCouponDiscount = 0,
  onApplyCoupon,
  onOpenMyCoupons,
  feedback,
}) {
  const [couponCode, setCouponCode] = useState(appliedCouponCode || '');
  const [pickerVisible, setPickerVisible] = useState(false);
  const appliedCoupon = coupons.find((coupon) => coupon.code?.toUpperCase() === appliedCouponCode?.toUpperCase());

  useEffect(() => {
    setCouponCode(appliedCouponCode || '');
  }, [appliedCouponCode]);

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    onApplyCoupon?.(code, 'code');
  };

  const relevantCoupons = coupons.filter((coupon) => {
    const scope = coupon.scope || 'store';
    if (scope === 'platform') return true;
    return !cartStoreId || coupon.storeId === cartStoreId;
  });

  return (
    <View style={styles.cartCouponBanner}>
      <View style={styles.cartCouponInfo}>
        <AppIcon icon={Icons.TicketPercent || Icons.Ticket || Icons.BadgePercent} size={33} color={palette.green} strokeWidth={2.3} />
        <View style={styles.cartCouponTextBlock}>
          <RText style={styles.cartCouponTitle}>لديك كوبون خصم؟</RText>
          <TextInput
            style={styles.cartCouponInput}
            value={couponCode}
            onChangeText={setCouponCode}
            placeholder="أدخل كود الكوبون"
            placeholderTextColor="#9AA4AD"
            autoCapitalize="characters"
            autoCorrect={false}
            textAlign="right"
          />
          {appliedCoupon ? (
            <RText style={styles.cartCouponApplied}>
              تم تطبيق {appliedCoupon.code}
              {appliedCouponDiscount > 0 ? ` — خصم ${formatCartSyp(appliedCouponDiscount)}` : ''}
            </RText>
          ) : null}
          {feedback ? <RText style={styles.cartCouponFeedbackError}>{feedback}</RText> : null}
        </View>
      </View>
      <View style={styles.cartCouponActionsRow}>
        <TouchableOpacity style={styles.cartCouponAction} onPress={applyCoupon}>
          <AppIcon icon={Icons.ChevronLeft} size={16} color={palette.amber} />
          <RText style={styles.cartCouponActionText}>{appliedCoupon ? 'تحديث' : 'تطبيق'}</RText>
        </TouchableOpacity>
        {appliedCoupon ? (
          <TouchableOpacity
            style={styles.cartCouponAction}
            onPress={() => {
              setCouponCode('');
              onApplyCoupon?.('', 'remove');
            }}
          >
            <AppIcon icon={Icons.X} size={14} color={palette.danger} />
            <RText style={[styles.cartCouponActionText, { color: palette.danger }]}>إزالة</RText>
          </TouchableOpacity>
        ) : null}
        {relevantCoupons.length && onOpenMyCoupons ? (
          <TouchableOpacity style={styles.cartCouponAction} onPress={() => setPickerVisible(true)}>
            <AppIcon icon={Icons.Ticket} size={14} color={palette.green} />
            <RText style={[styles.cartCouponActionText, { color: palette.green }]}>اختر من كوبوناتي</RText>
          </TouchableOpacity>
        ) : null}
      </View>

      {pickerVisible ? (
        <View style={styles.cartCouponPickerOverlay}>
          <TouchableOpacity style={styles.cartCouponPickerBackdrop} onPress={() => setPickerVisible(false)} />
          <View style={styles.cartCouponPickerSheet}>
            <View style={styles.cartCouponPickerHeader}>
              <TouchableOpacity onPress={() => setPickerVisible(false)} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <AppIcon icon={Icons.X} size={18} color={palette.ink} />
              </TouchableOpacity>
              <RText style={styles.cartCouponPickerTitle}>اختر من كوبوناتي</RText>
              <View style={{ width: 18 }} />
            </View>
            <ScrollView style={styles.cartCouponPickerList}>
              {relevantCoupons.map((coupon) => (
                <TouchableOpacity
                  key={`picker-${coupon.id}`}
                  style={styles.cartCouponPickerItem}
                  onPress={() => {
                    setPickerVisible(false);
                    onApplyCoupon?.(coupon.code, 'picker', coupon);
                  }}
                >
                  <View style={styles.cartCouponPickerTexts}>
                    <RText style={styles.cartCouponPickerLabel}>{coupon.label}</RText>
                    <RText style={styles.cartCouponPickerCode}>كود: {coupon.code}</RText>
                  </View>
                  <AppIcon icon={Icons.ChevronLeft} size={16} color={palette.green} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      ) : null}
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
  const oldPrice = Number(product.oldPriceValue || product.compareAtPrice || product?.raw?.compareAtPrice || 0) * quantity;

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
          <RText numberOfLines={1} style={styles.cartItemStore}>{product.store || 'المتجر'}</RText>
        </View>
        <View style={styles.cartPriceRow}>
          <RText style={styles.cartItemPrice}>{formatCartSyp(price)}</RText>
          {oldPrice > price ? <RText style={styles.cartOldPrice}>{formatCartSyp(oldPrice)}</RText> : null}
        </View>
        <CartQuantityControl product={product} quantity={quantity} id={id} onUpdateQuantity={onUpdateQuantity} />
      </View>
    </View>
  );
}

function CartOrderSummary({ subtotal, itemCount, shippingCost, discountTotal, onCheckout }) {
  const total = Math.max(0, subtotal + shippingCost - discountTotal);

  return (
    <View style={styles.cartSummary}>
      <RText style={styles.cartSummaryTitle}>ملخص الطلب</RText>
      <View style={styles.cartSummaryDashed}>
        <CartSummaryRow label="عدد المنتجات" value={String(itemCount)} />
        <CartSummaryRow label="قيمة المنتجات" value={formatCartSyp(subtotal)} />
        {discountTotal > 0 ? <CartSummaryRow label="خصم الكوبون" value={`- ${formatCartSyp(discountTotal)}`} /> : null}
        <CartSummaryRow label="كلفة الشحن" value={shippingCost ? formatCartSyp(shippingCost) : 'مجاني'} />
        <CartSummaryRow label="التكلفة الإجمالية" value={formatCartSyp(total)} strong />
      </View>
      <TouchableOpacity style={styles.checkoutButton} onPress={onCheckout}>
        <RText style={styles.checkoutText}>تأكيد</RText>
      </TouchableOpacity>
    </View>
  );
}

function CartCheckoutSheet({ itemCount, total, onCheckout }) {
  return (
    <View style={styles.cartCheckoutSheet}>
      <View style={styles.cartCheckoutMeta}>
        <View style={styles.cartSelectionInfo}>
          <CartCheckmark />
          <RText style={styles.cartSelectionTitle}>العناصر ({itemCount})</RText>
        </View>
        <RText style={styles.cartCheckoutTotal}>{formatCartSyp(total)}</RText>
      </View>
      <TouchableOpacity style={styles.cartCheckoutButton} onPress={onCheckout}>
        <AppIcon icon={Icons.ShoppingCart} size={25} color={palette.white} strokeWidth={2.4} />
        <RText style={styles.cartCheckoutText}>التقدم بإتمام الشراء</RText>
      </TouchableOpacity>
    </View>
  );
}

export function CartScreen({
  cart,
  session,
  catalog,
  loading,
  error,
  favorites = [],
  coupons = [],
  couponCode,
  appliedCoupon = null,
  appliedCouponDiscount = 0,
  couponFeedback = '',
  onApplyCoupon,
  onOpenMyCoupons,
  onUpdateQuantity,
  onRemove,
  onContinueShopping,
  onLogin,
  onOpenProduct,
  onAddToCart,
  onToggleFavorite,
  onShowAll,
  onRetry,
  onCheckout,
}) {
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const products = listOrEmpty(catalog?.products);
  const guestProducts = products.slice(0, 6);
  const { productCardStyle } = useMarketplaceLayout();
  const subtotal = useMemo(
    () => cart.reduce((total, item) => total + (item.product.priceValue || 0) * item.quantity, 0),
    [cart],
  );
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const shippingCost = 0;
  const cartStoreId = cart[0]?.product?.storeId || cart[0]?.product?.raw?.storeId || null;
  // Prefer the server-validated discount; fall back to the local preview only
  // when the backend response has not arrived yet.
  const discountTotal =
    appliedCoupon && appliedCoupon.code?.toUpperCase() === couponCode?.toUpperCase() && appliedCouponDiscount > 0
      ? Math.min(appliedCouponDiscount, subtotal)
      : appliedCoupon
        ? calculateCartCouponDiscount(appliedCoupon, subtotal)
        : 0;
  const total = Math.max(0, subtotal + shippingCost - discountTotal);

  if (!session) {
    return (
      <ScreenScroll>
        <View style={styles.guestCartTopBar}>
          <RText style={styles.guestCartHeader}>السلة (0)</RText>
        </View>
        <Image
          source={emptyCartGuestImage}
          style={styles.guestCartImage}
          resizeMode="contain"
        />
        <RText style={styles.guestCartTitle}>السلة لديك فارغة</RText>
        <View style={styles.guestCartActions}>
          <TouchableOpacity style={[styles.guestCartButton, styles.guestCartLogin]} onPress={onLogin} activeOpacity={0.88}>
            <RText style={[styles.guestCartButtonText, styles.guestCartLoginText]}>تسجيل دخول</RText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.guestCartButton, styles.guestCartExplore]} onPress={onContinueShopping} activeOpacity={0.88}>
            <RText style={styles.guestCartButtonText}>استكشف المتجر</RText>
          </TouchableOpacity>
        </View>

        <DataNotice loading={loading} error={error} onRetry={onRetry} />

        {guestProducts.length ? (
          <>
            <SectionTitle title="الأكثر مبيعا" icon={Icons.Flame || Icons.Star} onAction={() => onShowAll?.('recommended')} />
            <RtlHorizontalScroll refreshKey={`guest-cart-products-${guestProducts.length}`} contentContainerStyle={styles.horizontalCards}>
              {guestProducts.map((product) => (
                <ProductCard
                  key={`guest-cart-${product.id || product.title}`}
                  product={product}
                  style={[productCardStyle, styles.accountGuestProductCard]}
                  showcase
                  onOpen={onOpenProduct}
                  onAddToCart={onAddToCart}
                  onToggleFavorite={onToggleFavorite}
                  isFavorite={favorites.includes(product.id || product.title)}
                />
              ))}
            </RtlHorizontalScroll>
          </>
        ) : null}
      </ScreenScroll>
    );
  }

  if (!cart.length) {
    return (
      <View style={styles.emptyCart}>
        <Image
          source={emptyBasketImage}
          style={styles.emptyCartMascot}
          resizeMode="contain"
        />
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.cartContent, showOrderSummary && styles.cartContentSummaryStep]}
      >
        <View style={styles.cartTopBar}>
          {/* <RText style={styles.cartMiniTitle}>السلة</RText> */}
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

        <CartCouponBanner
          coupons={coupons}
          cartStoreId={cartStoreId}
          subtotal={subtotal}
          appliedCouponCode={couponCode}
          appliedCouponDiscount={discountTotal}
          onApplyCoupon={onApplyCoupon}
          onOpenMyCoupons={onOpenMyCoupons}
          feedback={couponFeedback}
        />
        {showOrderSummary ? (
          <CartOrderSummary
            subtotal={subtotal}
            itemCount={itemCount}
            shippingCost={shippingCost}
            discountTotal={discountTotal}
            onCheckout={onCheckout}
          />
        ) : null}
      </ScrollView>
      {!showOrderSummary ? (
        <CartCheckoutSheet itemCount={itemCount} total={total} onCheckout={() => setShowOrderSummary(true)} />
      ) : null}
    </View>
  );
}

export function CheckoutScreen({
  cart,
  couponCode,
  coupons = [],
  addresses = [],
  selectedAddressId,
  onSelectAddress,
  onAddNewAddress,
  onBack,
  onComplete,
  submitting,
}) {
  const [payment, setPayment] = useState('COD');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const subtotal = cart.reduce((total, item) => total + (item.product.priceValue || 0) * item.quantity, 0);
  const appliedCoupon = coupons.find((coupon) => coupon.code?.toUpperCase() === couponCode?.toUpperCase());
  const discountTotal = calculateCartCouponDiscount(appliedCoupon, subtotal);
  const total = Math.max(0, subtotal - discountTotal);
  const selectedAddress = addresses.find((item) => item.id === selectedAddressId) || null;
  const [useSaved, setUseSaved] = useState(Boolean(selectedAddress));

  useEffect(() => {
    if (selectedAddress) {
      setUseSaved(true);
      setCity(selectedAddress.governorate || selectedAddress.city || '');
      setAddress(
        [
          selectedAddress.area,
          selectedAddress.street,
          selectedAddress.building,
          selectedAddress.floor ? `الطابق ${selectedAddress.floor}` : '',
          selectedAddress.additionalInfo,
        ]
          .filter(Boolean)
          .join('، '),
      );
      setPhone(selectedAddress.phone || '');
    }
  }, [selectedAddress?.id]);

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
      {addresses.length ? (
        <>
          <View style={styles.checkoutSavedToggle}>
            <TouchableOpacity
              style={styles.checkoutSavedOption}
              onPress={() => {
                setUseSaved(true);
                if (selectedAddress) {
                  setCity(selectedAddress.governorate || selectedAddress.city || '');
                  setAddress(
                    [
                      selectedAddress.area,
                      selectedAddress.street,
                      selectedAddress.building,
                      selectedAddress.floor ? `الطابق ${selectedAddress.floor}` : '',
                      selectedAddress.additionalInfo,
                    ]
                      .filter(Boolean)
                      .join('، '),
                  );
                  setPhone(selectedAddress.phone || '');
                }
              }}
            >
              <View style={[styles.paymentRadio, useSaved && styles.paymentRadioActive]}>
                {useSaved ? <View style={styles.paymentRadioDot} /> : null}
              </View>
              <RText style={styles.paymentTitle}>عنوان محفوظ</RText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.checkoutSavedOption} onPress={() => setUseSaved(false)}>
              <View style={[styles.paymentRadio, !useSaved && styles.paymentRadioActive]}>
                {!useSaved ? <View style={styles.paymentRadioDot} /> : null}
              </View>
              <RText style={styles.paymentTitle}>عنوان جديد</RText>
            </TouchableOpacity>
          </View>
          {useSaved ? (
            <View style={styles.checkoutAddressList}>
              {addresses.map((item) => {
                const active = item.id === selectedAddressId;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.checkoutAddressOption, active && styles.checkoutAddressOptionActive]}
                    onPress={() => onSelectAddress?.(item)}
                  >
                    <View style={[styles.paymentRadio, active && styles.paymentRadioActive]}>
                      {active ? <View style={styles.paymentRadioDot} /> : null}
                    </View>
                    <View style={styles.checkoutAddressTexts}>
                      <RText style={styles.checkoutAddressTitle}>
                        {item.label || 'عنوان'} {item.isDefault ? '• الافتراضي' : ''}
                      </RText>
                      <RText style={styles.checkoutAddressSub} numberOfLines={2}>
                        {[item.governorate || item.city, item.area, item.street].filter(Boolean).join(' - ')}
                      </RText>
                    </View>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity style={styles.checkoutAddAddressLink} onPress={onAddNewAddress}>
                <AppIcon icon={Icons.Plus} size={15} color={palette.green} strokeWidth={2.4} />
                <RText style={styles.checkoutAddAddressText}>إضافة عنوان جديد</RText>
              </TouchableOpacity>
            </View>
          ) : null}
        </>
      ) : null}
      {!useSaved || !addresses.length ? (
        <View style={styles.checkoutPanel}>
          <AuthField label="المدينة" value={city} onChangeText={setCity} placeholder="دمشق" icon={Icons.MapPin} />
          <AuthField label="العنوان بالتفصيل" value={address} onChangeText={setAddress} placeholder="الحي، الشارع، البناء" icon={Icons.Home} />
          <AuthField label="رقم الهاتف" value={phone} onChangeText={setPhone} placeholder="09XXXXXXXX" icon={Icons.Phone} />
        </View>
      ) : null}

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
        {discountTotal > 0 ? (
          <View style={styles.cartSummaryLine}>
            <RText style={styles.cartSummaryValue}>- {formatSyp(discountTotal)}</RText>
            <RText style={styles.cartSummaryLabel}>خصم الكوبون</RText>
          </View>
        ) : null}
        <View style={styles.cartSummaryLine}>
          <RText style={styles.cartSummaryFree}>مجاني</RText>
          <RText style={styles.cartSummaryLabel}>التوصيل</RText>
        </View>
        <View style={styles.cartSummaryDivider} />
        <View style={styles.cartSummaryLine}>
          <RText style={styles.cartTotalValue}>{formatSyp(total)}</RText>
          <RText style={styles.cartTotalLabel}>الإجمالي النهائي</RText>
        </View>
      </View>

      <TouchableOpacity
        style={styles.checkoutButton}
        onPress={() => {
          if (useSaved && selectedAddress) {
            onComplete({
              paymentMethod: payment,
              couponCode: discountTotal > 0 ? couponCode : undefined,
              addressId: selectedAddress.id,
            });
            return;
          }
          onComplete({
            paymentMethod: payment,
            couponCode: discountTotal > 0 ? couponCode : undefined,
            address: { label: 'المنزل', city, line1: address, phone },
          });
        }}
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

const ORDER_TABS = [
  { key: 'all', label: 'الكل' },
  { key: 'processing', label: 'قيد المعالجة' },
  { key: 'done', label: 'تمت' },
  { key: 'cancelled', label: 'ملغاة' },
];

const ORDER_TRACK_STEPS = [
  { key: 'preparing', label: 'جارِ التجهيز' },
  { key: 'ready', label: 'الطلب جاهز' },
  { key: 'courier', label: 'مع الدلفري' },
  { key: 'delivered', label: 'تم الاستلام' },
];

function orderTabOf(status) {
  if (status === 'DELIVERED') return 'done';
  if (status === 'CANCELLED') return 'cancelled';
  return 'processing';
}

function orderStepIndex(status) {
  switch (status) {
    case 'READY_FOR_PICKUP':
      return 1;
    case 'OUT_FOR_DELIVERY':
      return 2;
    case 'DELIVERED':
      return 3;
    default:
      return 0;
  }
}

function formatOrderDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  const pad = (part) => String(part).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function formatOrderTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  const pad = (part) => String(part).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function orderItemsCount(order) {
  return (order?.items || []).reduce((total, item) => total + (item.quantity || 0), 0);
}

function OrderStatusBadge({ status }) {
  const tab = orderTabOf(status);
  const config =
    tab === 'done'
      ? { icon: Icons.Check, background: palette.greenSoft, color: palette.green }
      : tab === 'cancelled'
        ? { icon: Icons.X, background: '#FDECEA', color: palette.danger }
        : { icon: Icons.Clock3, background: palette.amberSoft, color: palette.amber };
  return (
    <View style={[styles.orderStatusBadge, { backgroundColor: config.background }]}>
      <AppIcon icon={config.icon} size={15} color={config.color} strokeWidth={3} />
    </View>
  );
}

export function OrdersScreen({ orders = [], loading = false, error, onBack, onOpenOrder, onReorder, onLogin }) {
  const [activeTab, setActiveTab] = useState('all');
  const filtered = orders.filter((order) => activeTab === 'all' || orderTabOf(order.status) === activeTab);

  return (
    <ScreenScroll>
      <View style={styles.detailsTopBar}>
        <TouchableOpacity style={styles.detailsTopButton} onPress={onBack}>
          <AppIcon icon={Icons.ArrowRight} size={19} color={palette.greenDark} />
        </TouchableOpacity>
        <RText style={styles.detailsHeaderTitle}>طلباتي</RText>
        <View style={styles.detailsTopSpacer} />
      </View>

      <View style={styles.ordersTabs}>
        {ORDER_TABS.map((tab) => (
          <TouchableOpacity key={tab.key} style={styles.ordersTab} onPress={() => setActiveTab(tab.key)}>
            <RText style={[styles.ordersTabText, activeTab === tab.key && styles.ordersTabTextActive]}>
              {tab.label}
            </RText>
            {activeTab === tab.key ? <View style={styles.ordersTabUnderline} /> : null}
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <DataNotice title="جارٍ تحميل طلباتك..." />
      ) : error ? (
        <DataNotice title="تعذر تحميل الطلبات" body={error} />
      ) : filtered.length === 0 ? (
        <View style={styles.ordersEmpty}>
          <Image source={emptyBasketImage} style={styles.ordersEmptyImage} resizeMode="contain" />
          <RText style={styles.ordersEmptyTitle}>لا توجد طلبات هنا بعد</RText>
          <RText style={styles.ordersEmptyText}>اطلب من متاجرك المفضلة وستظهر طلباتك في هذه الصفحة.</RText>
          {onLogin ? (
            <TouchableOpacity style={styles.ordersLoginButton} onPress={onLogin}>
              <RText style={styles.ordersLoginText}>تسجيل الدخول</RText>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : (
        filtered.map((order) => {
          const tab = orderTabOf(order.status);
          return (
            <TouchableOpacity
              key={order.id}
              style={[
                styles.orderCard,
                tab === 'done' && styles.orderCardDone,
                tab === 'cancelled' && styles.orderCardCancelled,
              ]}
              activeOpacity={0.85}
              onPress={() => onOpenOrder?.(order)}
            >
              <View style={styles.orderCardTop}>
                <View style={styles.orderCardPriceWrap}>
                  <RText style={styles.orderCardPrice}>{formatSyp(order.total || 0)}</RText>
                  <RText style={styles.orderCardNumber}>{order.number}</RText>
                </View>
                <View style={styles.orderCardInfo}>
                  <View style={styles.orderCardTitleRow}>
                    <RText style={styles.orderCardTitle}>{order.number}</RText>
                    <OrderStatusBadge status={order.status} />
                  </View>
                  <RText style={styles.orderCardStore}>
                    البائع: <RText style={styles.orderCardStoreName}>{order.store?.name || 'خان'}</RText>
                  </RText>
                </View>
              </View>
              <View style={styles.orderCardBottom}>
                {tab === 'processing' ? (
                  <TouchableOpacity style={styles.orderTrackButton} onPress={() => onOpenOrder?.(order)}>
                    <RText style={styles.orderTrackText}>تتبع الطلب</RText>
                    <AppIcon icon={Icons.LocateFixed} size={15} color={palette.white} />
                  </TouchableOpacity>
                ) : tab === 'cancelled' ? (
                  <TouchableOpacity style={styles.orderTrackButton} onPress={() => onReorder?.(order)}>
                    <RText style={styles.orderTrackText}>إعادة الطلب</RText>
                    <AppIcon icon={Icons.RotateCcw} size={15} color={palette.white} />
                  </TouchableOpacity>
                ) : (
                  <View />
                )}
                <View style={styles.orderCardChips}>
                  <View style={styles.orderChip}>
                    <RText style={styles.orderChipText}>{formatOrderDate(order.createdAt)}</RText>
                    <AppIcon icon={Icons.CalendarDays} size={13} color={palette.muted} />
                  </View>
                  <View style={styles.orderChip}>
                    <RText style={styles.orderChipText}>{orderItemsCount(order)} منتجات</RText>
                    <AppIcon icon={Icons.ShoppingBag} size={13} color={palette.muted} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </ScreenScroll>
  );
}

export function OrderTrackingScreen({ order, confirming = false, onBack, onConfirmDelivery, onSupport }) {
  const status = order?.status || 'PENDING';
  const cancelled = status === 'CANCELLED';
  const stepIndex = orderStepIndex(status);
  const canConfirm = !cancelled && (status === 'OUT_FOR_DELIVERY' || status === 'DELIVERED');
  const headline = cancelled
    ? 'تم إلغاء الطلب'
    : stepIndex === 3
      ? 'تم توصيل طلبك'
      : stepIndex === 2
        ? 'طلبك في الطريق إليك'
        : stepIndex === 1
          ? 'طلبك جاهز'
          : 'يتم تجهيز طلبك';
  const subline = cancelled
    ? 'تم إلغاء هذا الطلب، يمكنك إعادة طلبه في أي وقت'
    : stepIndex === 3
      ? 'يرجى تأكيد استلام الطلب'
      : stepIndex === 2
        ? 'المندوب في الطريق إليك الآن'
        : 'يتم الآن تجهيز طلبك';

  return (
    <ScreenScroll>
      <View style={styles.detailsTopBar}>
        <TouchableOpacity style={styles.detailsTopButton} onPress={onBack}>
          <AppIcon icon={Icons.ArrowRight} size={19} color={palette.greenDark} />
        </TouchableOpacity>
        <RText style={styles.detailsHeaderTitle}>{order?.number || 'طلبي'}</RText>
        <TouchableOpacity style={styles.detailsTopButton} onPress={onSupport}>
          <AppIcon icon={Icons.Headphones} size={19} color={palette.greenDark} />
        </TouchableOpacity>
      </View>

      <View style={styles.trackSteps}>
        {ORDER_TRACK_STEPS.map((step, index) => {
          const done = !cancelled && index < stepIndex;
          const current = !cancelled && index === stepIndex;
          return (
            <View key={step.key} style={styles.trackStepItem}>
              <View
                style={[
                  styles.trackStepDot,
                  done && styles.trackStepDotDone,
                  current && styles.trackStepDotCurrent,
                  cancelled && styles.trackStepDotCancelled,
                ]}
              />
              <RText
                style={[
                  styles.trackStepLabel,
                  (done || current) && styles.trackStepLabelActive,
                ]}
              >
                {step.label}
              </RText>
            </View>
          );
        })}
      </View>

      <RText style={styles.trackHeadline}>{headline}</RText>
      <RText style={styles.trackSubline}>{subline}</RText>
      {!cancelled && stepIndex < 2 ? (
        <RText style={styles.trackEta}>
          الوقت المتوقع{'  '}
          <RText style={styles.trackEtaValue}>{formatOrderTime(order?.createdAt)}</RText>
        </RText>
      ) : null}

      <View style={styles.trackDivider} />
      <View style={styles.trackMetaRow}>
        <RText style={styles.trackMetaText}>
          رقم الطلب: <RText style={styles.trackMetaValue}>{order?.number || '-'}</RText>
        </RText>
        <RText style={styles.trackMetaText}>
          العناصر المختارة{'  '}<RText style={styles.trackMetaValue}>{orderItemsCount(order)}</RText>
        </RText>
      </View>

      <RText style={styles.trackSummaryTitle}>الملخص</RText>
      <View style={styles.trackSummaryLine}>
        <RText style={styles.trackSummaryValue}>{formatSyp(order?.subtotal || 0)}</RText>
        <RText style={styles.trackSummaryLabel}>سعر الأصناف</RText>
      </View>
      <View style={styles.trackSummaryDivider} />
      <View style={styles.trackSummaryLine}>
        <RText style={styles.trackSummaryValue}>{formatSyp(order?.deliveryFee || 0)}</RText>
        <RText style={styles.trackSummaryLabel}>رسوم التوصيل</RText>
      </View>
      <View style={styles.trackSummaryDivider} />
      <View style={styles.trackSummaryLine}>
        <RText style={styles.trackSummaryTotal}>{formatSyp(order?.total || 0)}</RText>
        <RText style={styles.trackSummaryTotalLabel}>المجموع النهائي</RText>
      </View>

      <TouchableOpacity
        style={[styles.trackConfirmButton, (!canConfirm || confirming) && styles.trackConfirmDisabled]}
        disabled={!canConfirm || confirming}
        onPress={() => onConfirmDelivery?.(order)}
        activeOpacity={0.85}
      >
        <RText style={styles.trackConfirmText}>{confirming ? 'جارٍ التأكيد...' : 'تأكيد الاستلام'}</RText>
      </TouchableOpacity>
    </ScreenScroll>
  );
}

export function OrderDeliveredScreen({ order, submitting = false, onSubmitReview, onHome }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  return (
    <ScreenScroll>
      <View style={styles.detailsTopBar}>
        <TouchableOpacity style={styles.detailsTopButton} onPress={onHome}>
          <AppIcon icon={Icons.ArrowRight} size={19} color={palette.greenDark} />
        </TouchableOpacity>
        <RText style={styles.detailsHeaderTitle}>{order?.number || 'طلبي'}</RText>
        <View style={styles.detailsTopSpacer} />
      </View>

      <Image source={reviewMascotImage} style={styles.deliveredMascot} resizeMode="contain" />
      <RText style={styles.deliveredTitle}>تم الاستلام بنجاح</RText>
      <RText style={styles.deliveredText}>يرجى مشاركة التقييم والملاحظات معنا</RText>

      <View style={styles.deliveredStars}>
        {[1, 2, 3, 4, 5].map((value) => (
          <TouchableOpacity key={value} onPress={() => setRating(value)} activeOpacity={0.7}>
            <AppIcon
              icon={Icons.Star}
              size={34}
              color={value <= rating ? palette.amber : palette.border}
              fill={value <= rating ? palette.amber : 'transparent'}
            />
          </TouchableOpacity>
        ))}
      </View>

      <RText style={styles.deliveredNoteLabel}>اضافة ملاحظة</RText>
      <TextInput
        style={styles.deliveredNoteInput}
        value={comment}
        onChangeText={setComment}
        placeholder="اضافة ملاحظة"
        placeholderTextColor={palette.muted}
        multiline
        textAlign="right"
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={[styles.deliveredSubmit, submitting && styles.trackConfirmDisabled]}
        disabled={submitting}
        onPress={() => onSubmitReview?.({ orderId: order?.id, rating, comment: comment.trim() || undefined })}
        activeOpacity={0.85}
      >
        <RText style={styles.deliveredSubmitText}>{submitting ? 'جارٍ الإرسال...' : 'ارسال'}</RText>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deliveredHomeButton} onPress={onHome} activeOpacity={0.85}>
        <RText style={styles.deliveredHomeText}>العودة للرئيسية</RText>
      </TouchableOpacity>
    </ScreenScroll>
  );
}

function AccountAddressStrip({ defaultAddress, onOpenAddresses }) {
  if (!defaultAddress) {
    return (
      <TouchableOpacity style={styles.accountAddressCard} onPress={onOpenAddresses} activeOpacity={0.85}>
        <View style={styles.accountAddressTexts}>
          <RText style={styles.accountAddressTitle}>لم تضف عنوانًا بعد</RText>
          <RText style={styles.accountAddressSub}>أضف عنوانك لتسهيل عملية التوصيل</RText>
        </View>
        <AppIcon icon={Icons.MapPin} size={20} color={palette.green} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.accountAddressCard} onPress={onOpenAddresses} activeOpacity={0.85}>
      <View style={styles.accountAddressTexts}>
        <RText style={styles.accountAddressTitle}>
          {defaultAddress.label || 'العنوان الافتراضي'}
        </RText>
        <RText style={styles.accountAddressSub} numberOfLines={2}>
          {[defaultAddress.governorate || defaultAddress.city, defaultAddress.area, defaultAddress.street]
            .filter(Boolean)
            .join(' - ')}
        </RText>
      </View>
      <AppIcon icon={Icons.MapPin} size={20} color={palette.green} />
    </TouchableOpacity>
  );
}

export function AccountScreen({
  session,
  catalog,
  loading,
  error,
  onRetry,
  favorites = [],
  defaultAddress = null,
  onOpenAuth,
  onOpenProduct,
  onAddToCart,
  onToggleFavorite,
  onOpenFavorites,
  onOpenNotifications,
  onOpenOrders,
  onOpenCoupons,
  onOpenAddresses,
  onShowAll,
  onOpenSavedStores,
  onOpenSupport,
  onOpenAbout,
  onEditProfile,
  onLogout,
}) {
  const user = session?.user;
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'حسابي';
  const products = listOrEmpty(catalog?.products);
  const { productCardStyle } = useMarketplaceLayout();
  const firstGuestRow = products.slice(0, 6);
  const secondGuestRow = products.length >= 8 ? products.slice(6, 12) : [];

  if (!user) {
    return (
      <ScreenScroll>
        <View style={styles.accountGuestBanner}>
          <View style={styles.accountGuestPattern}>
            {[
              { icon: Icons.Package, top: 16, left: 18, rotate: '-14deg' },
              { icon: Icons.ShoppingCart, top: 18, right: 74, rotate: '10deg' },
              { icon: Icons.Shirt || Icons.Tag, top: 64, left: 126, rotate: '-8deg' },
              { icon: Icons.Handbag || Icons.ShoppingBag, top: 82, right: 28, rotate: '12deg' },
              { icon: Icons.Tag, bottom: 42, right: 122, rotate: '-14deg' },
              { icon: Icons.Truck, bottom: 26, left: 42, rotate: '9deg' },
            ].map((item, index) => (
              <View
                key={`guest-pattern-${index}`}
                style={[
                  styles.accountGuestPatternIcon,
                  {
                    top: item.top,
                    right: item.right,
                    bottom: item.bottom,
                    left: item.left,
                    transform: [{ rotate: item.rotate }],
                  },
                ]}
              >
                <AppIcon icon={item.icon} size={28} color={palette.white} strokeWidth={1.8} />
              </View>
            ))}
          </View>
          <View style={styles.accountGuestContent}>
            <View style={styles.accountGuestTexts}>
              <RText style={styles.accountGuestTitle}>مرحبا بك في خان</RText>
              <RText style={styles.accountGuestSubtitle}>أول طلب لك بعد التسجيل معنا</RText>
              <TouchableOpacity style={styles.accountGuestCta} onPress={() => onOpenAuth?.('login')} activeOpacity={0.88}>
                <RText style={styles.accountGuestCtaText}>تسجيل / إنشاء حساب</RText>
              </TouchableOpacity>
            </View>
            <Image source={guestMascotImage} style={styles.accountGuestMascot} resizeMode="contain" />
          </View>
        </View>

        <DataNotice loading={loading} error={error} onRetry={onRetry} />

        {firstGuestRow.length ? (
          <>
            <SectionTitle title="الأكثر مبيعا" icon={Icons.Flame || Icons.Star} onAction={() => onShowAll?.('recommended')} />
            <RtlHorizontalScroll refreshKey={`account-guest-products-${firstGuestRow.length}`} contentContainerStyle={styles.horizontalCards}>
              {firstGuestRow.map((product) => (
                <ProductCard
                  key={`account-guest-main-${product.id || product.title}`}
                  product={product}
                  style={[productCardStyle, styles.accountGuestProductCard]}
                  showcase
                  onOpen={onOpenProduct}
                  onAddToCart={onAddToCart}
                  onToggleFavorite={onToggleFavorite}
                  isFavorite={favorites.includes(product.id || product.title)}
                />
              ))}
            </RtlHorizontalScroll>
          </>
        ) : null}

        {secondGuestRow.length ? (
          <>
            <SectionTitle title="الأكثر مبيعا" icon={Icons.Flame || Icons.Star} onAction={() => onShowAll?.('recommended')} />
            <RtlHorizontalScroll refreshKey={`account-guest-more-${secondGuestRow.length}`} contentContainerStyle={styles.horizontalCards}>
              {secondGuestRow.map((product) => (
                <ProductCard
                  key={`account-guest-more-${product.id || product.title}`}
                  product={product}
                  style={[productCardStyle, styles.accountGuestProductCard]}
                  showcase
                  onOpen={onOpenProduct}
                  onAddToCart={onAddToCart}
                  onToggleFavorite={onToggleFavorite}
                  isFavorite={favorites.includes(product.id || product.title)}
                />
              ))}
            </RtlHorizontalScroll>
          </>
        ) : null}

        {!loading && !firstGuestRow.length ? (
          <RText style={styles.collectionEmpty}>لا توجد منتجات متاحة حاليا.</RText>
        ) : null}
      </ScreenScroll>
    );
  }

  const menuItems = [
    { key: 'notifications', title: 'الاشعارات', subtitle: 'ادارة الاشعارات والتنبيهات', icon: Icons.Bell, onPress: onOpenNotifications },
    { key: 'orders', title: 'طلباتي', subtitle: 'طلباتي', icon: Icons.ShoppingBag, onPress: onOpenOrders },
    { key: 'coupons', title: 'كوبوناتي', subtitle: 'كوبوناتي', icon: Icons.Ticket, onPress: onOpenCoupons },
    { key: 'favorites', title: 'المفضلة', subtitle: 'المفضلة', icon: Icons.Heart, onPress: onOpenFavorites },
    { key: 'stores', title: 'المتاجر المحفوظة', subtitle: 'المتاجر المحفوظة', icon: Icons.Tag, onPress: onOpenSavedStores },
    { key: 'support', title: 'المساعدة والدعم', subtitle: 'المساعدة والدعم', icon: Icons.CircleAlert, onPress: onOpenSupport },
    { key: 'about', title: 'عن التطبيق', subtitle: 'عن التطبيق', icon: Icons.Info, onPress: onOpenAbout },
  ];

  return (
    <ScreenScroll>
      <View style={styles.accountTopBar}>
        <TouchableOpacity
          style={styles.accountBellButton}
          onPress={onOpenNotifications}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <AppIcon icon={Icons.Bell} size={22} color={palette.amber} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.accountLocation}
          onPress={onOpenAddresses}
          activeOpacity={0.8}
        >
          <AppIcon icon={Icons.ChevronDown} size={16} color={palette.amber} />
          <RText style={styles.accountLocationText} numberOfLines={1}>
            {defaultAddress
              ? [defaultAddress.label || defaultAddress.area, defaultAddress.area]
                  .filter(Boolean)
                  .join(' . ')
              : 'أضف عنوانك'}
          </RText>
          <AppIcon icon={Icons.MapPin} size={20} color={palette.amber} />
        </TouchableOpacity>
      </View>

      <View style={styles.accountProfileCard}>
        <TouchableOpacity
          onPress={onEditProfile}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <AppIcon icon={Icons.Pencil} size={18} color={palette.green} />
        </TouchableOpacity>
        <View style={styles.accountProfileInfo}>
          <RText style={styles.accountProfileName}>{fullName}</RText>
          <RText style={styles.accountProfilePhone}>{user.phone || 'حساب عميل خان'}</RText>
        </View>
        <View style={styles.accountProfileAvatar}>
          {user.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.accountProfileAvatarImage} />
          ) : (
            <AppIcon icon={Icons.User} size={26} color={palette.white} />
          )}
        </View>
      </View>

      <AccountAddressStrip defaultAddress={defaultAddress} onOpenAddresses={() => onOpenAddresses?.()} />

      <View style={styles.accountMenuCard}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.accountMenuRow, index < menuItems.length - 1 && styles.accountMenuRowBorder]}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <AppIcon icon={Icons.ChevronLeft} size={18} color={palette.ink} />
            <View style={styles.accountMenuTexts}>
              <RText style={styles.accountMenuTitle}>{item.title}</RText>
              <RText style={styles.accountMenuSubtitle}>{item.subtitle}</RText>
            </View>
            <AppIcon icon={item.icon} size={22} color={palette.green} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.accountLogoutButton} onPress={onLogout} activeOpacity={0.8}>
                <AppIcon icon={Icons.LogOut} size={20} color={palette.danger} />
        <RText style={styles.accountLogoutText}>تسجيل الخروج</RText>
      </TouchableOpacity>
    </ScreenScroll>
  );
}

export function SupportScreen({ onBack }) {
  const supportRows = [
    { key: 'whatsapp', title: 'واتساب الدعم', subtitle: 'رد سريع خلال ساعات العمل', icon: Icons.MessageCircle || Icons.Send },
    { key: 'phone', title: 'اتصل بنا', subtitle: '0999 999 999', icon: Icons.Phone },
    { key: 'faq', title: 'الأسئلة الشائعة', subtitle: 'إجابات على أكثر الأسئلة تكراراً', icon: Icons.CircleHelp || Icons.HelpCircle },
  ];

  return (
    <ScreenScroll>
      <View style={styles.detailsTopBar}>
        <TouchableOpacity style={styles.detailsTopButton} onPress={onBack}>
          <AppIcon icon={Icons.ArrowRight} size={19} color={palette.greenDark} />
        </TouchableOpacity>
        <RText style={styles.detailsHeaderTitle}>المساعدة والدعم</RText>
        <View style={styles.detailsTopSpacer} />
      </View>
      <View style={styles.accountMenuCard}>
        {supportRows.map((row, index) => (
          <TouchableOpacity
            key={row.key}
            style={[styles.accountMenuRow, index < supportRows.length - 1 && styles.accountMenuRowBorder]}
            activeOpacity={0.7}
          >
            <AppIcon icon={Icons.ChevronLeft} size={18} color={palette.ink} />
            <View style={styles.accountMenuTexts}>
              <RText style={styles.accountMenuTitle}>{row.title}</RText>
              <RText style={styles.accountMenuSubtitle}>{row.subtitle}</RText>
            </View>
            <AppIcon icon={row.icon} size={22} color={palette.green} />
          </TouchableOpacity>
        ))}
      </View>
      <RText style={styles.collectionEmpty}>فريق خان جاهز لمساعدتك في أي وقت.</RText>
    </ScreenScroll>
  );
}

export function AboutScreen({ onBack }) {
  return (
    <ScreenScroll>
      <View style={styles.detailsTopBar}>
        <TouchableOpacity style={styles.detailsTopButton} onPress={onBack}>
          <AppIcon icon={Icons.ArrowRight} size={19} color={palette.greenDark} />
        </TouchableOpacity>
        <RText style={styles.detailsHeaderTitle}>عن التطبيق</RText>
        <View style={styles.detailsTopSpacer} />
      </View>
      <View style={styles.storeInfoCard}>
        <RText style={styles.storeRatingTitle}>خان — تسوّق محلي بكل سهولة</RText>
        <RText style={styles.detailsDescription}>
          خان منصة تسوق تجمع متاجرك المحلية المفضلة في مكان واحد: آلاف المنتجات، عروض وكوبونات يومية، وريلز تُريك المنتج قبل الشراء. اطلب من متاجرك القريبة وتابع طلبك أولًا بأول.
        </RText>
        <View style={[styles.storeInfoGrid, { marginTop: 14 }]}>
          <View style={styles.storeInfoCell}>
            <AppIcon icon={Icons.Package} size={17} color={palette.green} />
            <RText style={styles.storeInfoValue}>منتجات</RText>
            <RText style={styles.storeInfoLabel}>من متاجر موثوقة</RText>
          </View>
          <View style={styles.storeInfoCell}>
            <AppIcon icon={Icons.Truck} size={17} color={palette.green} />
            <RText style={styles.storeInfoValue}>توصيل</RText>
            <RText style={styles.storeInfoLabel}>حتى باب منزلك</RText>
          </View>
          <View style={styles.storeInfoCell}>
            <AppIcon icon={Icons.Ticket || Icons.Tag} size={17} color={palette.green} />
            <RText style={styles.storeInfoValue}>كوبونات</RText>
            <RText style={styles.storeInfoLabel}>عروض يومية</RText>
          </View>
        </View>
      </View>
    </ScreenScroll>
  );
}

export function EditProfileScreen({ session, saving = false, error, onSave, onBack }) {
  const user = session?.user;
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
  });
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const update = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));
  const firstName = form.firstName.trim();
  const lastName = form.lastName.trim();
  const canSave = firstName.length >= 2 && lastName.length >= 2 && !saving && !avatarUploading;

  const pickAvatar = () => {
    if (avatarUploading || saving) return;
    if (typeof document === 'undefined') {
      setAvatarError('اختيار الصور متاح حاليًا من نسخة الويب فقط');
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setAvatarUploading(true);
      setAvatarError('');
      try {
        const uploaded = await uploadsApi.file(file, 'customer');
        setAvatarUrl(uploaded.url);
      } catch (uploadError) {
        setAvatarError(uploadError.message);
      } finally {
        setAvatarUploading(false);
      }
    };
    input.click();
  };

  const save = () => {
    if (!canSave) return;
    const payload = { firstName, lastName };
    if ((avatarUrl || '') !== (user?.avatarUrl || '')) {
      payload.avatarUrl = avatarUrl;
    }
    onSave?.(payload);
  };

  return (
    <ScreenScroll>
      <View style={styles.detailsTopBar}>
        <TouchableOpacity style={styles.detailsTopButton} onPress={onBack}>
          <AppIcon icon={Icons.ArrowRight} size={19} color={palette.greenDark} />
        </TouchableOpacity>
        <RText style={styles.detailsHeaderTitle}>تعديل الملف الشخصي</RText>
        <View style={styles.detailsTopSpacer} />
      </View>
      <View style={styles.editProfileAvatarWrap}>
        <TouchableOpacity style={styles.editProfileAvatar} onPress={pickAvatar} activeOpacity={0.85}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.editProfileAvatarImage} />
          ) : (
            <AppIcon icon={Icons.User} size={38} color={palette.white} />
          )}
          <View style={styles.editProfileAvatarBadge}>
            <AppIcon icon={avatarUploading ? Icons.Loader : Icons.Camera} size={14} color={palette.white} />
          </View>
        </TouchableOpacity>
        <RText style={styles.editProfileAvatarText}>
          {avatarUploading ? 'جارٍ رفع الصورة...' : 'اضغط لتغيير صورة الحساب'}
        </RText>
        {avatarError ? (
          <RText style={[styles.editProfileHint, { color: palette.danger, textAlign: 'center' }]}>{avatarError}</RText>
        ) : null}
      </View>
      {error ? (
        <RText style={[styles.authQuestion, { color: palette.danger }]}>{error}</RText>
      ) : null}
      <AuthField label="الاسم الأول" value={form.firstName} onChangeText={update('firstName')} placeholder="محمد" icon={Icons.User} />
      <AuthField label="الكنية" value={form.lastName} onChangeText={update('lastName')} placeholder="الأحمد" icon={Icons.User} />
      <View style={styles.authFieldBlock}>
        <RText style={styles.authLabel}>رقم الهاتف</RText>
        <View style={[styles.authInputShell, styles.authInputShellDisabled]}>
          <TextInput
            style={styles.authInput}
            value={user?.phone || ''}
            editable={false}
            textAlign="right"
          />
          <AppIcon icon={Icons.Phone} size={20} color={palette.muted} />
        </View>
        <RText style={styles.editProfileHint}>رقم الهاتف هو معرّف حسابك ولا يمكن تغييره.</RText>
      </View>
      <TouchableOpacity
        style={[styles.authPrimary, !canSave && styles.authPrimaryDisabled]}
        onPress={save}
        disabled={!canSave}
      >
        <RText style={styles.authPrimaryText}>{saving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}</RText>
      </TouchableOpacity>
    </ScreenScroll>
  );
}

function AuthField({ label, placeholder, icon, secure = false, leadingIcon, value, onChangeText, blockStyle }) {
  const [visible, setVisible] = useState(false);
  const secureEntry = secure && !visible;
  const LeadingIcon = secure ? (visible ? Icons.Eye : Icons.EyeOff) : leadingIcon;

  return (
    <View style={[styles.authFieldBlock, blockStyle]}>
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

export function AuthScreen({
  session,
  authLoading,
  authError,
  rememberedAccount,
  initialMode = 'login',
  onLogin,
  onRegister,
  onVerifyRegister,
  onRequestPasswordOtp,
  onResetPassword,
  onLogout,
}) {
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: rememberedAccount?.phone || '',
    password: '',
    confirmPassword: '',
  });
  const [localAuthError, setLocalAuthError] = useState('');
  const [remember, setRemember] = useState(Boolean(rememberedAccount?.phone));
  const [otpCode, setOtpCode] = useState('');
  const [pendingRegister, setPendingRegister] = useState(null);
  const [pendingReset, setPendingReset] = useState(null);
  const [resetForm, setResetForm] = useState({ phone: '', password: '' });
  const login = mode === 'login';

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);
  const update = (key) => (value) => {
    setLocalAuthError('');
    setForm((current) => ({ ...current, [key]: value }));
  };
  const updateReset = (key) => (value) => {
    setLocalAuthError('');
    setResetForm((current) => ({ ...current, [key]: value }));
  };

  const requestRegisterOtp = async () => {
    if (form.password !== form.confirmPassword) {
      setLocalAuthError('كلمة المرور وتأكيدها غير متطابقين');
      return;
    }

    const verification = await onRegister?.({
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      password: form.password,
      role: 'CUSTOMER',
    });
    if (verification) {
      setPendingRegister(verification);
      setOtpCode('');
    }
  };

  const verifyRegisterOtp = async () => {
    await onVerifyRegister?.({
      phone: pendingRegister?.phone || form.phone,
      requestId: pendingRegister?.requestId,
      code: otpCode,
    });
  };

  const requestResetOtp = async () => {
    setLocalAuthError('');
    const verification = await onRequestPasswordOtp?.({ phone: resetForm.phone });
    if (verification) {
      setPendingReset(verification);
      setOtpCode('');
    }
  };

  const resetPassword = async () => {
    setLocalAuthError('');
    const done = await onResetPassword?.({
      phone: pendingReset?.phone || resetForm.phone,
      requestId: pendingReset?.requestId,
      code: otpCode,
      password: resetForm.password,
    });
    if (done) {
      setPendingReset(null);
      setOtpCode('');
      setMode('login');
    }
  };

  if (session?.user) {
    return (
      <ScreenScroll>
        <View style={styles.successScreen}>
          <Image
            source={reviewMascotImage}
            style={styles.successMascot}
            resizeMode="contain"
          />
          <RText style={styles.successTitle}>أهلًا {session.user.firstName}</RText>
          <RText style={styles.successText}>تم ربط حسابك بالباك إند ويمكنك مزامنة السلة والطلبات.</RText>
          <TouchableOpacity style={styles.successButton} onPress={onLogout}>
            <RText style={styles.successButtonText}>تسجيل الخروج</RText>
          </TouchableOpacity>
        </View>
      </ScreenScroll>
    );
  }

  if (mode === 'reset') {
    return (
      <ScreenScroll>
        <RText style={styles.authTitle}>استرجاع كلمة المرور</RText>
        {authError || localAuthError ? (
          <RText style={[styles.authQuestion, { color: palette.danger }]}>{authError || localAuthError}</RText>
        ) : null}
        {!pendingReset ? (
          <>
            <RText style={styles.authHint}>أدخل رقم الهاتف المرتبط بحسابك وسنرسل رمز التحقق عبر تليغرام.</RText>
            <AuthField label="رقم الهاتف" value={resetForm.phone} onChangeText={updateReset('phone')} placeholder="رقم الهاتف" icon={Icons.Phone} />
            <TouchableOpacity style={styles.authPrimary} onPress={requestResetOtp}>
              <RText style={styles.authPrimaryText}>{authLoading ? 'جارٍ التحقق...' : 'إرسال رمز تليغرام'}</RText>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <RText style={styles.authHint}>تم إرسال رمز التحقق إلى تليغرام للرقم {pendingReset.phone}.</RText>
            <AuthField label="رمز تليغرام" value={otpCode} onChangeText={setOtpCode} placeholder="123456" icon={Icons.MessageCircle || Icons.Send} />
            <AuthField label="كلمة المرور الجديدة" value={resetForm.password} onChangeText={updateReset('password')} placeholder="**********" icon={Icons.Lock} leadingIcon={Icons.EyeOff} secure />
            <TouchableOpacity style={styles.authPrimary} onPress={resetPassword}>
              <RText style={styles.authPrimaryText}>{authLoading ? 'جارٍ الحفظ...' : 'تغيير كلمة المرور'}</RText>
            </TouchableOpacity>
            <TouchableOpacity onPress={requestResetOtp}>
              <RText style={styles.linkText}>إعادة إرسال رمز تليغرام</RText>
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity onPress={() => setMode('login')}>
          <RText style={styles.linkText}>العودة إلى تسجيل الدخول</RText>
        </TouchableOpacity>
      </ScreenScroll>
    );
  }

  if (mode === 'signup' && pendingRegister) {
    return (
      <ScreenScroll>
        <RText style={styles.authTitle}>Verify Telegram code</RText>
        {authError ? (
          <RText style={[styles.authQuestion, { color: palette.danger }]}>{authError}</RText>
        ) : null}
        <RText style={styles.authQuestion}>We sent a Telegram verification code to {pendingRegister.phone}.</RText>
        <AuthField label="Telegram code" value={otpCode} onChangeText={setOtpCode} placeholder="123456" icon={Icons.MessageCircle || Icons.Send} />
        <TouchableOpacity style={styles.authPrimary} onPress={verifyRegisterOtp}>
          <RText style={styles.authPrimaryText}>{authLoading ? 'Verifying...' : 'Create account'}</RText>
        </TouchableOpacity>
        <TouchableOpacity onPress={requestRegisterOtp}>
          <RText style={styles.linkText}>Resend Telegram code</RText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setPendingRegister(null)}>
          <RText style={styles.linkText}>Edit registration details</RText>
        </TouchableOpacity>
      </ScreenScroll>
    );
  }

  return (
    <ScreenScroll>
      <RText style={styles.authTitle}>{login ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</RText>
      {authError || localAuthError ? (
        <RText style={[styles.authQuestion, { color: palette.danger }]}>{authError || localAuthError}</RText>
      ) : null}
      {login ? (
        <>
          <AuthField label="رقم الهاتف" value={form.phone} onChangeText={update('phone')} placeholder="رقم الهاتف" icon={Icons.Phone} />
          <AuthField label="كلمة المرور" value={form.password} onChangeText={update('password')} placeholder="**********" icon={Icons.Lock} leadingIcon={Icons.EyeOff} secure />
          <View style={styles.authInline}>
            <TouchableOpacity onPress={() => setMode('reset')}>
              <RText style={styles.linkText}>نسيت كلمة المرور؟</RText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rememberRow} onPress={() => setRemember((current) => !current)}>
              <View style={[styles.checkbox, remember && styles.checkboxChecked]}>
                {remember ? <AppIcon icon={Icons.Check} size={10} color={palette.white} /> : null}
              </View>
              <RText style={styles.tinyMuted}>تذكرني</RText>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.authPrimary} onPress={() => onLogin?.({ phone: form.phone, password: form.password, remember })}>
            <RText style={styles.authPrimaryText}>{authLoading ? 'جاري الدخول...' : 'تسجيل الدخول'}</RText>
          </TouchableOpacity>
          <RText style={styles.authQuestion}>لم تقم بالاشتراك معنا؟</RText>
          <TouchableOpacity onPress={() => setMode('signup')}>
            <RText style={styles.authSignupLink}>إنشاء الحساب سهل ويستغرق أقل من دقيقة</RText>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.twoColumns}>
            <AuthField blockStyle={styles.authFieldHalf} label="الاسم الأول" value={form.firstName} onChangeText={update('firstName')} placeholder="الاسم الأول" icon={Icons.User} />
            <AuthField blockStyle={styles.authFieldHalf} label="اسم العائلة" value={form.lastName} onChangeText={update('lastName')} placeholder="اسم العائلة" icon={Icons.User} />
          </View>
          <AuthField label="رقم الهاتف" value={form.phone} onChangeText={update('phone')} placeholder="**********" icon={Icons.Phone} />
          <AuthField label="كلمة المرور" value={form.password} onChangeText={update('password')} placeholder="**********" icon={Icons.Lock} leadingIcon={Icons.EyeOff} secure />
          <AuthField label="تأكيد كلمة المرور" value={form.confirmPassword} onChangeText={update('confirmPassword')} placeholder="**********" icon={Icons.Lock} leadingIcon={Icons.EyeOff} secure />
          <TouchableOpacity
            style={styles.authPrimary}
            onPress={requestRegisterOtp}
          >
            <RText style={styles.authPrimaryText}>{authLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}</RText>
          </TouchableOpacity>
          <View style={styles.authQuestionRow}>
            <RText style={styles.authInlineQuestion}>لديك حساب مسبق؟</RText>
            <TouchableOpacity onPress={() => setMode('login')}>
              <RText style={styles.linkText}>تسجيل دخول</RText>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScreenScroll>
  );
}
