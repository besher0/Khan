import React, { useEffect, useRef, useState } from 'react';
import { Image, ScrollView, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { authApi, cartApi, catalogApi, favoritesApi, notificationsApi, ordersApi, reviewsApi } from '../../services/api';
import { styles } from './theme/styles';
import {
  AppIcon,
  RText,
  normalizeCart,
  normalizeBanner,
  normalizeCategory,
  normalizeCoupon,
  normalizeProduct,
  normalizeReel,
  palette,
} from './shared/marketplaceShared';
import * as Icons from '../../../icons';
import onboardingDeliveryImage from '../../../assets/onboarding-delivery.png';
import onboardingReelsImage from '../../../assets/onboarding-reels.png';
import onboardingShoppingImage from '../../../assets/onboarding-shopping.png';
import {
  AuthScreen,
  CartScreen,
  CheckoutScreen,
  AccountScreen,
  CollectionScreen,
  EditProfileScreen,
  FavoritesScreen,
  HomeScreen,
  NotificationsScreen,
  OrderDeliveredScreen,
  OrdersScreen,
  OrderSuccessScreen,
  OrderTrackingScreen,
  ProductDetailsScreen,
  ReelsScreen,
  SearchScreen,
  StoreScreen,
} from './screens/CustomerScreens';

const bottomTabs = [
  { key: 'account', label: 'حسابي', icon: Icons.User, screen: 'account' },
  { key: 'cart', label: 'السلة', icon: Icons.ShoppingCart, screen: 'cart' },
  { key: 'reels', label: 'خان', icon: Icons.Video, screen: 'reels', center: true },
  { key: 'shop', label: 'تسوق', icon: Icons.Search, screen: 'search' },
  { key: 'home', label: 'الرئيسية', icon: Icons.Home, screen: 'home' },
];

function CartTabIcon({ size = 21, color = palette.green }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.8 5.8h2.1l1.6 8.6h8.5c1 0 1.8-.7 2.1-1.7l1-4.4H8.1"
        stroke={color}
        strokeWidth={2.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="10.2" cy="18.3" r="1.2" fill={color} />
      <Circle cx="17.1" cy="18.3" r="1.2" fill={color} />
    </Svg>
  );
}

function ShopTabIcon({ size = 21, color = palette.muted }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5.2 8.2h5.9"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      <Path
        d="M3.8 11.8h7.1"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      <Path
        d="M9.2 5.1a7 7 0 1 1 2.2 13.6"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M17 17l3.2 3.2" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  );
}

function BottomNav({ screen, onChange, cartCount }) {
  return (
    <View style={styles.bottomNav}>
      {bottomTabs.map((item) => {
        const active = screen === item.screen;
        return (
          <TouchableOpacity
            key={item.key}
            style={[styles.bottomItem, item.center && styles.bottomCenter]}
            onPress={() => onChange(item.screen)}
          >
            <View style={[item.center ? styles.centerButton : styles.navIconWrap, active && styles.navIconActive]}>
              {item.key === 'cart' ? (
                <CartTabIcon size={21} color={palette.green} />
              ) : item.key === 'shop' ? (
                <ShopTabIcon size={21} color={active ? palette.green : palette.muted} />
              ) : (
                <AppIcon icon={item.icon} size={item.center ? 23 : 21} color={active || item.center ? palette.green : palette.muted} />
              )}
              {item.key === 'cart' && cartCount > 0 ? (
                <View style={styles.cartBadge}>
                  <RText style={styles.cartBadgeText}>{cartCount > 9 ? '9+' : cartCount}</RText>
                </View>
              ) : null}
            </View>
            {!item.center ? (
              <RText style={[styles.bottomLabel, active && styles.bottomLabelActive]}>{item.label}</RText>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function normalizeHomePayload(home, productsResponse) {
  const featured = home?.featuredProducts || [];
  const products = productsResponse?.items?.length ? productsResponse.items : featured;

  return {
    categories: (home?.categories || []).map(normalizeCategory),
    products: products.map(normalizeProduct),
    reels: (home?.latestReels || []).map(normalizeReel),
    coupons: (home?.coupons || []).map(normalizeCoupon),
    banners: (home?.banners || []).map(normalizeBanner).filter(Boolean),
  };
}

function canSyncProduct(product) {
  return Boolean(product?.raw?.id && product?.id);
}

const FAVORITES_KEY = 'khan.customer.favorites';
const ONBOARDING_KEY = 'khan.customer.onboarding.done';
const swipeScreens = ['account', 'cart', 'reels', 'search', 'home'];

const onboardingSlides = [
  {
    id: 'discover',
    image: onboardingShoppingImage,
    title: 'اكتشف عالم التسوق الأقرب إليك',
    body: 'آلاف المنتجات والمتاجر والعروض بمكان واحد.',
  },
  {
    id: 'simple',
    image: onboardingDeliveryImage,
    title: 'كل ما تحتاجه... بخطوات بسيطة',
    body: 'اطلب من متاجرك المفضلة وتتبع طلباتك بسهولة.',
  },
  {
    id: 'reels',
    image: onboardingReelsImage,
    title: 'شاهد المنتجات بالفيديو قبل الشراء',
    body: 'تصفح ريلز قصيرة واكتشف أفضل العروض بسهولة.',
  },
];

function readLocalFavorites() {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalFavorites(favorites) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function writeOnboardingDone() {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ONBOARDING_KEY, '1');
}

function OnboardingScreen({ onLogin, onSignup, onGuest }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [sliderWidth, setSliderWidth] = useState(1);
  const { height } = useWindowDimensions();
  const scrollRef = useRef(null);
  const imageHeight = Math.min(250, Math.max(150, height * 0.3));
  const goTo = (index) => {
    const next = Math.max(0, Math.min(onboardingSlides.length - 1, index));
    setActiveIndex(next);
    scrollRef.current?.scrollTo({ x: next * sliderWidth, animated: true });
  };

  return (
    <View style={styles.onboardingScreen}>
      <View style={styles.onboardingTop}>
        <TouchableOpacity style={styles.guestLink} onPress={onGuest}>
          <AppIcon icon={Icons.ChevronLeft} size={17} color={palette.green} />
          <RText style={styles.guestLinkText}>أكمل التسوق كزائر</RText>
        </TouchableOpacity>
      </View>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.onboardingPager}
        contentContainerStyle={styles.onboardingPagerContent}
        onLayout={(event) => setSliderWidth(event.nativeEvent.layout.width || 1)}
        onMomentumScrollEnd={(event) => {
          const width = event.nativeEvent.layoutMeasurement.width || 1;
          setActiveIndex(Math.round(event.nativeEvent.contentOffset.x / width));
        }}
      >
        {onboardingSlides.map((slide) => (
          <View key={slide.id} style={[styles.onboardingSlide, { width: sliderWidth }]}>
            <Image source={slide.image} style={[styles.onboardingImage, { height: imageHeight }]} resizeMode="contain" />
            <RText style={styles.onboardingTitle}>{slide.title}</RText>
            <RText style={styles.onboardingBody}>{slide.body}</RText>
          </View>
        ))}
      </ScrollView>
      <View style={styles.onboardingActions}>
        <TouchableOpacity style={styles.onboardingLoginButton} onPress={onLogin}>
          <RText style={styles.onboardingLoginText}>تسجيل دخول</RText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.onboardingSignupButton} onPress={onSignup}>
          <RText style={styles.onboardingSignupText}>إنشاء حساب</RText>
        </TouchableOpacity>
      </View>
      <View style={styles.onboardingFooter}>
        <TouchableOpacity
          style={[styles.onboardingArrow, activeIndex === 0 && styles.onboardingArrowDisabled]}
          onPress={() => goTo(activeIndex - 1)}
        >
          <AppIcon icon={Icons.ChevronLeft} size={20} color={activeIndex === 0 ? palette.muted : palette.green} />
        </TouchableOpacity>
        <View style={styles.onboardingDots}>
          {onboardingSlides.map((slide, index) => (
            <View key={`dot-${slide.id}`} style={[styles.onboardingDot, activeIndex === index && styles.onboardingDotActive]} />
          ))}
        </View>
        <TouchableOpacity
          style={[styles.onboardingArrow, styles.onboardingArrowActive, activeIndex === onboardingSlides.length - 1 && styles.onboardingArrowDisabled]}
          onPress={() => goTo(activeIndex + 1)}
        >
          <AppIcon icon={Icons.ChevronRight} size={20} color={activeIndex === onboardingSlides.length - 1 ? palette.muted : palette.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

async function copyText(text) {
  if (!text) return false;

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  if (typeof document === 'undefined') return false;

  const input = document.createElement('textarea');
  input.value = text;
  input.setAttribute('readonly', '');
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.appendChild(input);
  input.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(input);
  return copied;
}

export default function PhoneExperience() {
  const initialScreen =
    typeof window !== 'undefined' && window.location?.search
      ? new URLSearchParams(window.location.search).get('screen') || 'home'
      : 'home';
  const [screen, setScreen] = useState(initialScreen);
  const [catalog, setCatalog] = useState({});
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [collectionType, setCollectionType] = useState('recommended');
  const [collectionBackScreen, setCollectionBackScreen] = useState('home');
  const [collectionData, setCollectionData] = useState(null);
  const [collectionLoading, setCollectionLoading] = useState(false);
  const [collectionError, setCollectionError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedReel, setSelectedReel] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartCouponCode, setCartCouponCode] = useState('');
  const [favorites, setFavorites] = useState(() => (authApi.getSession('customer') ? readLocalFavorites() : []));
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState('');
  const [session, setSession] = useState(() => authApi.getSession('customer'));
  const [rememberedCustomer, setRememberedCustomer] = useState(() => authApi.getRememberedCustomer());
  const [showOnboarding, setShowOnboarding] = useState(() => !authApi.getSession('customer'));
  const [authInitialMode, setAuthInitialMode] = useState('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [confirmingDelivery, setConfirmingDelivery] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [swipeStart, setSwipeStart] = useState(null);

  const loadCatalog = async () => {
    setCatalogLoading(true);
    setCatalogError('');
    try {
      const [home, productsResponse] = await Promise.all([
        catalogApi.home(),
        catalogApi.products({ take: 20 }),
      ]);
      setCatalog(normalizeHomePayload(home, productsResponse));
    } catch (error) {
      setCatalogError(error.message);
    } finally {
      setCatalogLoading(false);
    }
  };

  const loadCart = async () => {
    if (!authApi.getSession('customer')) return;
    try {
      const remoteCart = await cartApi.get();
      setCart(normalizeCart(remoteCart));
    } catch (error) {
      setToast(error.message);
    }
  };

  const loadFavorites = async () => {
    if (!authApi.getSession('customer')) {
      setFavorites([]);
      return;
    }

    try {
      const remoteFavorites = await favoritesApi.list();
      const remoteIds = Array.from(new Set((remoteFavorites || []).map((item) => item.productId || item.product?.id).filter(Boolean)));
      setFavorites(remoteIds);
      writeLocalFavorites(remoteIds);
    } catch (error) {
      setToast(error.message);
    }
  };

  const loadNotifications = async () => {
    if (!authApi.getSession('customer')) {
      setNotifications([]);
      return;
    }

    try {
      const remoteNotifications = await notificationsApi.list();
      setNotifications(remoteNotifications || []);
    } catch (error) {
      setToast(error.message);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  useEffect(() => {
    loadCart();
    loadFavorites();
    loadNotifications();
  }, [session]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  const requireCustomerSession = (message = 'سجل دخولك لإضافة المنتجات إلى السلة') => {
    if (session) return true;
    setAuthInitialMode('login');
    setToast(message);
    setScreen('auth');
    return false;
  };

  const syncOrUpdateLocalCart = async (product, quantity = 1) => {
    if (!requireCustomerSession()) return;

    if (!canSyncProduct(product)) {
      setToast('لا يمكن إضافة هذا المنتج حالياً');
      return;
    }

    try {
      const remoteCart = await cartApi.addItem(product.id, quantity);
      setCart(normalizeCart(remoteCart));
      setToast('تمت إضافة المنتج إلى السلة');
    } catch (error) {
      setToast(error.message);
    }
  };

  const addToCart = (product, quantity = 1) => {
    syncOrUpdateLocalCart(product, quantity);
  };

  const updateQuantity = async (product, quantity, itemId) => {
    if (session && itemId) {
      try {
        const remoteCart = quantity <= 0
          ? await cartApi.removeItem(itemId)
          : await cartApi.updateItem(itemId, quantity);
        setCart(normalizeCart(remoteCart));
        return;
      } catch (error) {
        setToast(error.message);
      }
    }

    if (quantity <= 0) {
      setCart((current) => current.filter((item) => item.product.id !== product.id));
      return;
    }
    setCart((current) =>
      current.map((item) => (item.product.id === product.id ? { ...item, quantity } : item)),
    );
  };

  const removeFromCart = async (product, itemId) => {
    if (session && itemId) {
      try {
        const remoteCart = await cartApi.removeItem(itemId);
        setCart(normalizeCart(remoteCart));
        return;
      } catch (error) {
        setToast(error.message);
      }
    }
    setCart((current) => current.filter((item) => item.product.id !== product.id));
    setToast('تم حذف المنتج من السلة');
  };

  const toggleFavorite = async (product) => {
    if (!session) {
      setAuthInitialMode('login');
      setToast('سجل دخولك لحفظ المنتج في المفضلة');
      setScreen('auth');
      return;
    }

    const key = product.id || product.title;
    const wasFavorite = favorites.includes(key);
    const nextFavorites = wasFavorite
      ? favorites.filter((favorite) => favorite !== key)
      : [...favorites, key];

    setFavorites(nextFavorites);
    writeLocalFavorites(nextFavorites);

    if (!product.id) return;

    try {
      if (wasFavorite) {
        await favoritesApi.remove(product.id);
      } else {
        await favoritesApi.add(product.id);
      }
    } catch (error) {
      setToast(error.message);
    }
  };

  const markAllNotificationsRead = async () => {
    setNotifications((current) => current.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() })));
    if (!session) return;

    try {
      await notificationsApi.markAllRead();
    } catch (error) {
      setToast(error.message);
    }
  };

  const openProduct = (product) => {
    setSelectedProduct(product);
    setScreen('product');
  };

  const openReel = (reel) => {
    setSelectedReel(reel);
    setScreen('reels');
  };

  const handleSearch = async (query) => {
    setScreen('search');
    if (!query?.trim()) {
      setSearchResults(null);
      return;
    }

    try {
      const response = await catalogApi.search({ q: query.trim(), take: 20 });
      setSearchResults({
        products: (response.products || []).map(normalizeProduct),
        stores: response.stores || [],
        reels: (response.reels || []).map(normalizeReel),
      });
    } catch (error) {
      setToast(error.message);
    }
  };

  const openCollection = async (type, backScreen = 'home') => {
    setCollectionType(type);
    setCollectionBackScreen(backScreen);
    setCollectionData(null);
    setCollectionError('');
    setCollectionLoading(true);
    setScreen('collection');

    try {
      if (type === 'reels') {
        const response = await catalogApi.reels({ take: 100 });
        setCollectionData({ reels: (response.items || []).map(normalizeReel) });
        return;
      }
      if (type === 'coupons') {
        const response = await catalogApi.coupons({ take: 100 });
        setCollectionData({ coupons: (response.items || []).map(normalizeCoupon) });
        return;
      }
      const response = await catalogApi.products({ take: 100 });
      setCollectionData({ products: (response.items || []).map(normalizeProduct) });
    } catch (error) {
      setCollectionError(error.message);
    } finally {
      setCollectionLoading(false);
    }
  };

  const copyCoupon = async (code) => {
    try {
      const copied = await copyText(code);
      setToast(copied ? 'تم نسخ الكوبون' : 'تعذر نسخ الكوبون');
    } catch (error) {
      setToast('تعذر نسخ الكوبون');
    }
  };

  const applyCartCoupon = (code) => {
    if (!code) {
      setCartCouponCode('');
      setToast('الكوبون غير صالح لهذه السلة');
      return;
    }

    setCartCouponCode(code);
    setToast('تم تطبيق الكوبون');
  };

  const handleLogin = async (payload) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const { remember, ...credentials } = payload;
      const nextSession = await authApi.login(credentials, 'customer');
      const role = nextSession?.user?.role;

      if (role === 'ADMIN' || role === 'OPS') {
        authApi.clearSession('customer');
        authApi.setSession(nextSession, 'admin');
        if (typeof window !== 'undefined') window.location.assign('/dashboard/admin');
        return;
      }

      if (role === 'MERCHANT') {
        authApi.clearSession('customer');
        authApi.setSession(nextSession, 'merchant');
        if (typeof window !== 'undefined') window.location.assign('/dashboard/merchant');
        return;
      }

      if (remember) {
        const account = {
          phone: credentials.phone,
          firstName: nextSession?.user?.firstName || '',
          lastName: nextSession?.user?.lastName || '',
        };
        authApi.setRememberedCustomer(account);
        setRememberedCustomer(account);
      } else {
        authApi.clearRememberedCustomer();
        setRememberedCustomer(null);
      }

      setSession(nextSession);
      setToast('تم تسجيل الدخول وربط الحساب');
      setScreen('home');
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (payload) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      return await authApi.requestRegisterOtp(payload);
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyRegister = async (payload) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const nextSession = await authApi.verifyRegisterOtp(payload, 'customer');
      setSession(nextSession);
      setToast('Account created and linked.');
      setScreen('home');
      return nextSession;
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRequestPasswordOtp = async (payload) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      return await authApi.requestPasswordOtp(payload);
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResetPassword = async (payload) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      await authApi.resetPassword(payload);
      setToast('Password was reset. You can log in now.');
      return true;
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    authApi.clearSession('customer');
    setSession(null);
    setCart([]);
    setFavorites([]);
    writeLocalFavorites([]);
    setToast('تم تسجيل الخروج');
  };

  const handleUpdateProfile = async (payload) => {
    setProfileSaving(true);
    setProfileError('');
    try {
      const user = await authApi.updateProfile(payload, 'customer');
      const nextSession = { ...session, user };
      authApi.setSession(nextSession, 'customer');
      setSession(nextSession);
      setToast('تم حفظ التغييرات');
      setScreen('account');
    } catch (error) {
      setProfileError(error.message);
    } finally {
      setProfileSaving(false);
    }
  };

  const finishOnboarding = (nextScreen = 'home', nextAuthMode = 'login') => {
    writeOnboardingDone();
    setShowOnboarding(false);
    setAuthInitialMode(nextAuthMode);
    setScreen(nextScreen);
  };

  const completeCheckout = async (payload) => {
    if (!requireCustomerSession('سجل دخولك لإتمام الطلب')) return;

    setCheckoutLoading(true);
    try {
      const order = await ordersApi.checkout(payload);
      setLastOrder(order);
      setCart([]);
      setScreen('success');
    } catch (error) {
      setToast(error.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const loadOrders = async () => {
    if (!authApi.getSession('customer')) {
      setOrders([]);
      return;
    }

    setOrdersLoading(true);
    setOrdersError('');
    try {
      const remoteOrders = await ordersApi.mine();
      setOrders(remoteOrders || []);
    } catch (error) {
      setOrdersError(error.message);
    } finally {
      setOrdersLoading(false);
    }
  };

  const openOrders = () => {
    if (!session) {
      setAuthInitialMode('login');
      setScreen('auth');
      return;
    }
    setScreen('orders');
    loadOrders();
  };

  const openOrder = async (order) => {
    setSelectedOrder(order);
    setScreen('orderTracking');

    if (!order?.id || !session) return;
    try {
      const fresh = await ordersApi.get(order.id);
      setSelectedOrder(fresh);
      setOrders((current) => current.map((item) => (item.id === fresh.id ? fresh : item)));
    } catch {
      // keep the list snapshot if the refresh fails
    }
  };

  const handleConfirmDelivery = async (order) => {
    if (!order?.id || confirmingDelivery) return;

    if (order.status === 'DELIVERED') {
      setScreen('orderDelivered');
      return;
    }

    setConfirmingDelivery(true);
    try {
      const updated = await ordersApi.confirmDelivery(order.id);
      setSelectedOrder(updated);
      setOrders((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setScreen('orderDelivered');
    } catch (error) {
      setToast(error.message);
    } finally {
      setConfirmingDelivery(false);
    }
  };

  const handleReorder = async (order) => {
    if (!requireCustomerSession('سجل دخولك لإضافة منتجات الطلب إلى السلة')) return;

    const items = (order?.items || []).filter((item) => item.productId);
    if (!items.length) {
      setToast('لا يمكن إعادة هذا الطلب');
      return;
    }

    let added = 0;
    for (const item of items) {
      try {
        const remoteCart = await cartApi.addItem(item.productId, item.quantity || 1);
        setCart(normalizeCart(remoteCart));
        added += 1;
      } catch {
        // skip items that are no longer available
      }
    }

    if (added > 0) {
      setToast('تمت إضافة منتجات الطلب إلى السلة');
      setScreen('cart');
    } else {
      setToast('منتجات هذا الطلب لم تعد متوفرة');
    }
  };

  const handleSubmitReview = async (payload) => {
    if (!payload?.orderId || reviewSubmitting) return;
    setReviewSubmitting(true);
    try {
      await reviewsApi.create(payload);
      setToast('شكرًا لك! تم إرسال تقييمك');
      setScreen('home');
    } catch (error) {
      setToast(error.message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const sharedProductProps = {
    onOpenProduct: openProduct,
    onAddToCart: addToCart,
    onToggleFavorite: toggleFavorite,
    favorites,
  };
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  if (showOnboarding && !session) {
    return (
      <View style={styles.phoneFrame}>
        <OnboardingScreen
          onGuest={() => finishOnboarding('home')}
          onLogin={() => finishOnboarding('auth', 'login')}
          onSignup={() => finishOnboarding('auth', 'signup')}
        />
      </View>
    );
  }

  const content = {
    home: (
      <HomeScreen
        {...sharedProductProps}
        catalog={catalog}
        loading={catalogLoading}
        error={catalogError}
        onRetry={loadCatalog}
        onSearch={handleSearch}
        onOpenFavorites={() => setScreen('favorites')}
        onOpenNotifications={() => setScreen('notifications')}
        onOpenReel={openReel}
        onShowAll={(type) => openCollection(type, 'home')}
        onCopyCoupon={copyCoupon}
        notificationCount={notifications.filter((item) => !item.readAt).length}
      />
    ),
    favorites: (
      <FavoritesScreen
        products={catalog.products || []}
        favorites={favorites}
        onBack={() => setScreen('home')}
        onOpenProduct={openProduct}
        onAddToCart={addToCart}
        onToggleFavorite={toggleFavorite}
      />
    ),
    notifications: (
      <NotificationsScreen
        notifications={notifications}
        onBack={() => setScreen('home')}
        onMarkAllRead={markAllNotificationsRead}
      />
    ),
    account: (
      <AccountScreen
        session={session}
        catalog={catalog}
        loading={catalogLoading}
        error={catalogError}
        onRetry={loadCatalog}
        favorites={favorites}
        onOpenProduct={openProduct}
        onAddToCart={addToCart}
        onToggleFavorite={toggleFavorite}
        onOpenAuth={(mode = 'login') => {
          setAuthInitialMode(mode);
          setScreen('auth');
        }}
        onOpenFavorites={() => setScreen('favorites')}
        onOpenNotifications={() => setScreen('notifications')}
        onOpenOrders={openOrders}
        onOpenCoupons={() => openCollection('coupons', 'account')}
        onShowAll={(type) => openCollection(type, 'account')}
        onOpenSavedStores={() => setToast('المتاجر المحفوظة قريبًا')}
        onOpenSupport={() => setToast('المساعدة والدعم قريبًا')}
        onOpenAbout={() => setToast('خان — تسوّق محلي بكل سهولة')}
        onEditProfile={() => {
          setProfileError('');
          setScreen('editProfile');
        }}
        onLogout={handleLogout}
      />
    ),
    editProfile: (
      <EditProfileScreen
        session={session}
        saving={profileSaving}
        error={profileError}
        onSave={handleUpdateProfile}
        onBack={() => setScreen('home')}
      />
    ),
    search: (
      <SearchScreen
        {...sharedProductProps}
        catalog={catalog}
        searchResults={searchResults}
        onSearch={handleSearch}
      />
    ),
    store: (
      <StoreScreen
        {...sharedProductProps}
        catalog={catalog}
        onShowAll={(type) => openCollection(type, 'store')}
        onSubmitReview={() => setToast('يحتاج إرسال التقييم إلى طلب سابق من نفس المتجر')}
      />
    ),
    collection: (
      <CollectionScreen
        {...sharedProductProps}
        type={collectionType}
        catalog={catalog}
        collectionData={collectionData}
        loading={collectionLoading}
        error={collectionError}
        onRetry={() => openCollection(collectionType, collectionBackScreen)}
        onBack={() => setScreen('home')}
        onOpenReel={openReel}
        onCopyCoupon={copyCoupon}
      />
    ),
    reels: <ReelsScreen reel={selectedReel} onAddToCart={addToCart} onBack={() => setScreen('home')} />,
    auth: (
      <AuthScreen
        session={session}
        authLoading={authLoading}
        authError={authError}
        rememberedAccount={rememberedCustomer}
        initialMode={authInitialMode}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onVerifyRegister={handleVerifyRegister}
        onRequestPasswordOtp={handleRequestPasswordOtp}
        onResetPassword={handleResetPassword}
        onLogout={handleLogout}
      />
    ),
    cart: (
      <CartScreen
        cart={cart}
        session={session}
        catalog={catalog}
        loading={catalogLoading}
        error={catalogError}
        favorites={favorites}
        coupons={catalog.coupons || []}
        couponCode={cartCouponCode}
        onApplyCoupon={applyCartCoupon}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onContinueShopping={() => setScreen('home')}
        onLogin={() => {
          setAuthInitialMode('login');
          setScreen('auth');
        }}
        onOpenProduct={openProduct}
        onAddToCart={addToCart}
        onToggleFavorite={toggleFavorite}
        onShowAll={(type) => openCollection(type, 'cart')}
        onRetry={loadCatalog}
        onCheckout={() => setScreen('checkout')}
      />
    ),
    checkout: (
      <CheckoutScreen
        cart={cart}
        couponCode={cartCouponCode}
        coupons={catalog.coupons || []}
        onBack={() => setScreen('home')}
        onComplete={completeCheckout}
        submitting={checkoutLoading}
      />
    ),
    success: <OrderSuccessScreen order={lastOrder} onHome={() => setScreen('home')} />,
    orders: (
      <OrdersScreen
        orders={orders}
        loading={ordersLoading}
        error={ordersError}
        onBack={() => setScreen('home')}
        onOpenOrder={openOrder}
        onReorder={handleReorder}
      />
    ),
    orderTracking: (
      <OrderTrackingScreen
        order={selectedOrder}
        confirming={confirmingDelivery}
        onBack={() => setScreen('home')}
        onConfirmDelivery={handleConfirmDelivery}
        onSupport={() => setToast('المساعدة والدعم قريبًا')}
      />
    ),
    orderDelivered: (
      <OrderDeliveredScreen
        order={selectedOrder}
        submitting={reviewSubmitting}
        onSubmitReview={handleSubmitReview}
        onHome={() => setScreen('home')}
      />
    ),
    product: (
      <ProductDetailsScreen
        product={selectedProduct}
        onBack={() => setScreen('home')}
        onAddToCart={addToCart}
        onToggleFavorite={toggleFavorite}
        isFavorite={favorites.includes(selectedProduct?.id || selectedProduct?.title)}
        onGoToCart={() => setScreen('cart')}
      />
    ),
  }[screen];

  const handleSwipeRelease = (event) => {
    if (!swipeStart || !swipeScreens.includes(screen)) {
      setSwipeStart(null);
      return;
    }

    const touch = event.nativeEvent.changedTouches?.[0];
    const endX = touch?.pageX ?? event.nativeEvent.pageX;
    const deltaX = endX - swipeStart.x;
    setSwipeStart(null);
    if (Math.abs(deltaX) < 70) return;

    const currentIndex = swipeScreens.indexOf(screen);
    const nextIndex = deltaX > 0
      ? Math.max(0, currentIndex - 1)
      : Math.min(swipeScreens.length - 1, currentIndex + 1);
    if (nextIndex !== currentIndex) setScreen(swipeScreens[nextIndex]);
  };

  return (
    <View style={styles.phoneFrame}>
      <View
        style={styles.phoneContent}
        onTouchStart={(event) => {
          const touch = event.nativeEvent.changedTouches?.[0];
          setSwipeStart({ x: touch?.pageX ?? event.nativeEvent.pageX });
        }}
        onTouchEnd={handleSwipeRelease}
      >
        {content}
      </View>
      {toast ? (
        <View style={styles.toast}>
          <AppIcon icon={Icons.CircleCheck} size={18} color={palette.white} />
          <RText style={styles.toastText}>{toast}</RText>
        </View>
      ) : null}
      {screen !== 'reels' && !(screen === 'cart' && session) ? (
        <BottomNav screen={screen} onChange={setScreen} cartCount={cartCount} />
      ) : null}
    </View>
  );
}
