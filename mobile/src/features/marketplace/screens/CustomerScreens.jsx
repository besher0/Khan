import React, { useMemo, useState } from 'react';
import { Image, ImageBackground, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { styles } from '../theme/styles';
import * as Icons from '../../../../icons';
import {
  AppIcon,
  CouponCard,
  ProductCard,
  RText,
  ReelCard,
  SectionTitle,
  formatSyp,
  images,
  palette,
} from '../shared/marketplaceShared';
export { HomeScreen } from './HomeScreen';
export { SearchScreen } from './SearchScreen';
export { StoreScreen } from './StoreScreen';
export { CollectionScreen } from './CollectionScreen';
export { ProductDetailsScreen } from './ProductDetailsScreen';
export { ReelsScreen } from './ReelsScreen';
import { DataNotice, listOrEmpty, ScreenScroll, useMarketplaceLayout } from './screenShared.jsx';


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
  const [showOrderSummary, setShowOrderSummary] = useState(false);
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.cartContent, showOrderSummary && styles.cartContentSummaryStep]}
      >
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
        {showOrderSummary ? (
          <CartOrderSummary subtotal={subtotal} shippingCost={shippingCost} onCheckout={onCheckout} />
        ) : null}
      </ScrollView>
      {!showOrderSummary ? (
        <CartCheckoutSheet itemCount={itemCount} subtotal={subtotal} onCheckout={() => setShowOrderSummary(true)} />
      ) : null}
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

export function AuthScreen({
  session,
  authLoading,
  authError,
  onLogin,
  onRegister,
  onVerifyRegister,
  onRequestPasswordOtp,
  onResetPassword,
  onLogout,
}) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
  });
  const [otpCode, setOtpCode] = useState('');
  const [pendingRegister, setPendingRegister] = useState(null);
  const [pendingReset, setPendingReset] = useState(null);
  const [resetForm, setResetForm] = useState({ phone: '', password: '' });
  const login = mode === 'login';
  const update = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));
  const updateReset = (key) => (value) => setResetForm((current) => ({ ...current, [key]: value }));

  const requestRegisterOtp = async () => {
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
    const verification = await onRequestPasswordOtp?.({ phone: resetForm.phone });
    if (verification) {
      setPendingReset(verification);
      setOtpCode('');
    }
  };

  const resetPassword = async () => {
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

  if (mode === 'reset') {
    return (
      <ScreenScroll>
        <RText style={styles.authTitle}>Reset password</RText>
        {authError ? (
          <RText style={[styles.authQuestion, { color: palette.danger }]}>{authError}</RText>
        ) : null}
        {!pendingReset ? (
          <>
            <AuthField label="Phone number" value={resetForm.phone} onChangeText={updateReset('phone')} placeholder="09XXXXXXXX" icon={Icons.Phone} />
            <TouchableOpacity style={styles.authPrimary} onPress={requestResetOtp}>
              <RText style={styles.authPrimaryText}>{authLoading ? 'Sending Telegram code...' : 'Send Telegram code'}</RText>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <AuthField label="Telegram code" value={otpCode} onChangeText={setOtpCode} placeholder="123456" icon={Icons.MessageCircle || Icons.Send} />
            <AuthField label="New password" value={resetForm.password} onChangeText={updateReset('password')} placeholder="**********" icon={Icons.Lock} leadingIcon={Icons.EyeOff} secure />
            <TouchableOpacity style={styles.authPrimary} onPress={resetPassword}>
              <RText style={styles.authPrimaryText}>{authLoading ? 'Resetting...' : 'Reset password'}</RText>
            </TouchableOpacity>
            <TouchableOpacity onPress={requestResetOtp}>
              <RText style={styles.linkText}>Resend Telegram code</RText>
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity onPress={() => setMode('login')}>
          <RText style={styles.linkText}>Back to login</RText>
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
            <TouchableOpacity onPress={() => setMode('reset')}>
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
            onPress={requestRegisterOtp}
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
