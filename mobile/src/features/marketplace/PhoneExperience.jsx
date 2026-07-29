import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { authApi, cartApi, catalogApi, ordersApi } from '../../services/api';
import { styles } from './theme/styles';
import {
  AppIcon,
  RText,
  normalizeCart,
  normalizeCategory,
  normalizeCoupon,
  normalizeProduct,
  normalizeReel,
  palette,
} from './shared/marketplaceShared';
import * as Icons from '../../../icons';
import {
  AuthScreen,
  CartScreen,
  CheckoutScreen,
  CollectionScreen,
  HomeScreen,
  OrderSuccessScreen,
  ProductDetailsScreen,
  ReelsScreen,
  SearchScreen,
  StoreScreen,
} from './screens/CustomerScreens';

const bottomTabs = [
  { key: 'account', label: 'حسابي', icon: Icons.User, screen: 'auth' },
  { key: 'cart', label: 'السلة', icon: Icons.ShoppingCart, screen: 'cart' },
  { key: 'reels', label: 'خان', icon: Icons.Video, screen: 'reels', center: true },
  { key: 'shop', label: 'تسوق', icon: Icons.Search, screen: 'search' },
  { key: 'home', label: 'الرئيسية', icon: Icons.Home, screen: 'home' },
];

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
              <AppIcon icon={item.icon} size={item.center ? 23 : 21} color={active || item.center ? palette.green : palette.muted} />
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
  };
}

function canSyncProduct(product) {
  return Boolean(product?.raw?.id && product?.id);
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
  const [favorites, setFavorites] = useState([]);
  const [toast, setToast] = useState('');
  const [session, setSession] = useState(() => authApi.getSession('customer'));
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

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

  useEffect(() => {
    loadCatalog();
  }, []);

  useEffect(() => {
    loadCart();
  }, [session]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  const syncOrUpdateLocalCart = async (product, quantity = 1) => {
    setCart((current) => {
      const key = product.id || product.title;
      const existing = current.find((item) => (item.product.id || item.product.title) === key);
      if (existing) {
        return current.map((item) =>
          (item.product.id || item.product.title) === key
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...current, { product, quantity }];
    });

    if (!session || !canSyncProduct(product)) {
      setToast('تمت الإضافة إلى السلة المحلية');
      return;
    }

    try {
      const remoteCart = await cartApi.addItem(product.id, quantity);
      setCart(normalizeCart(remoteCart));
      setToast('تمت مزامنة السلة مع الباك إند');
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

  const toggleFavorite = (product) => {
    const key = product.id || product.title;
    setFavorites((current) =>
      current.includes(key) ? current.filter((title) => title !== key) : [...current, key],
    );
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

  const handleLogin = async (payload) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const nextSession = await authApi.login(payload, 'customer');
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
      const nextSession = await authApi.register(payload, 'customer');
      setSession(nextSession);
      setToast('تم إنشاء الحساب وربطه');
      setScreen('home');
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
    setToast('تم تسجيل الخروج');
  };

  const completeCheckout = async (payload) => {
    setCheckoutLoading(true);
    try {
      if (session) {
        const order = await ordersApi.checkout(payload);
        setLastOrder(order);
      } else {
        setLastOrder({ number: `LOCAL-${Date.now().toString().slice(-6)}` });
      }
      setCart([]);
      setScreen('success');
    } catch (error) {
      setToast(error.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const sharedProductProps = {
    onOpenProduct: openProduct,
    onAddToCart: addToCart,
    onToggleFavorite: toggleFavorite,
    favorites,
  };

  const content = {
    home: (
      <HomeScreen
        {...sharedProductProps}
        catalog={catalog}
        loading={catalogLoading}
        error={catalogError}
        onRetry={loadCatalog}
        onSearch={handleSearch}
        onOpenReel={openReel}
        onShowAll={(type) => openCollection(type, 'home')}
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
        onBack={() => setScreen(collectionBackScreen)}
        onOpenReel={openReel}
      />
    ),
    reels: <ReelsScreen reel={selectedReel} onAddToCart={addToCart} onBack={() => setScreen('home')} />,
    auth: (
      <AuthScreen
        session={session}
        authLoading={authLoading}
        authError={authError}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onLogout={handleLogout}
      />
    ),
    cart: (
      <CartScreen
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onContinueShopping={() => setScreen('home')}
        onCheckout={() => setScreen('checkout')}
      />
    ),
    checkout: (
      <CheckoutScreen
        cart={cart}
        onBack={() => setScreen('cart')}
        onComplete={completeCheckout}
        submitting={checkoutLoading}
      />
    ),
    success: <OrderSuccessScreen order={lastOrder} onHome={() => setScreen('home')} />,
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

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <View style={styles.phoneFrame}>
      <View style={styles.phoneContent}>{content}</View>
      {toast ? (
        <View style={styles.toast}>
          <AppIcon icon={Icons.CircleCheck} size={18} color={palette.white} />
          <RText style={styles.toastText}>{toast}</RText>
        </View>
      ) : null}
      {screen !== 'reels' ? (
        <BottomNav screen={screen} onChange={setScreen} cartCount={cartCount} />
      ) : null}
    </View>
  );
}
