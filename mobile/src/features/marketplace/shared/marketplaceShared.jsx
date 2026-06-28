import React from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as Icons from '../../../../icons';
import cupImage from '../../../../assets/cup.jpg';
import electronicsImage from '../../../../assets/electronics.jpg';
import fashionImage from '../../../../assets/fashion.jpg';
import giftBoxImage from '../../../../assets/gift-box.jpg';
import googleImage from '../../../../assets/google.jpg';
import gymImage from '../../../../assets/gym.jpg';
import phoneWatchImage from '../../../../assets/phone-watch.jpg';
import reelPhoneImage from '../../../../assets/reel-phone.jpg';
import shoeImage from '../../../../assets/shoe.jpg';
import storeBannerImage from '../../../../assets/store-banner.jpg';
import { API_ORIGIN } from '../../../services/api';
import { styles } from '../theme/styles';

export const palette = {
  green: '#179B7D',
  greenDark: '#075247',
  greenSoft: '#E8FAF4',
  amber: '#F7B531',
  amberSoft: '#FFF3D8',
  ink: '#1E252B',
  muted: '#7B858F',
  border: '#E7EBEF',
  panel: '#F7F8F6',
  white: '#FFFFFF',
  danger: '#EE6B6E',
};

export const images = {
  cup: cupImage,
  shoe: shoeImage,
  phoneWatch: phoneWatchImage,
  giftBox: giftBoxImage,
  fashion: fashionImage,
  gym: gymImage,
  electronics: electronicsImage,
  storeBanner: storeBannerImage,
  reelPhone: reelPhoneImage,
  google: googleImage,
};

const productImages = [images.cup, images.shoe, images.phoneWatch, images.giftBox, images.gym, images.fashion];
const couponColors = [palette.green, palette.amber, palette.greenDark, palette.danger];
const IconCircle = Icons.Circle || Icons.Dot;

export function AppIcon({ icon, size = 20, color = palette.ink, strokeWidth = 2 }) {
  const Glyph = icon || IconCircle;
  return <Glyph size={size} color={color} strokeWidth={strokeWidth} />;
}

export function RText({ children, style, ...props }) {
  return (
    <Text {...props} style={[styles.rtlText, style]}>
      {children}
    </Text>
  );
}

export function DeviceStatus() {
  return (
    <View style={styles.statusBar}>
      <RText style={styles.statusTime}>9:41</RText>
      <View style={styles.statusIcons}>
        <View style={styles.signalBars}>
          <View style={[styles.signalBar, { height: 5 }]} />
          <View style={[styles.signalBar, { height: 8 }]} />
          <View style={[styles.signalBar, { height: 11 }]} />
          <View style={[styles.signalBar, { height: 14 }]} />
        </View>
        <RText style={styles.wifi}>5G</RText>
        <View style={styles.battery}>
          <View style={styles.batteryFill} />
        </View>
      </View>
    </View>
  );
}

export function formatSyp(value) {
  const amount = Number(value) || 0;
  return `${new Intl.NumberFormat('ar-SY').format(amount)} ل.س`;
}

function resolveRemoteImage(url, fallback) {
  if (!url) return fallback;
  if (url.startsWith('http://') || url.startsWith('https://')) return { uri: url };
  if (url.startsWith('/uploads')) return fallback;
  return { uri: `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}` };
}

export const categories = [
  { id: 'gifts', label: 'هدايا', image: images.giftBox, icon: Icons.Gift },
  { id: 'electronics', label: 'إلكترونيات', image: images.electronics, icon: Icons.Smartphone },
  { id: 'stores', label: 'متاجر', image: images.storeBanner, icon: Icons.Store },
  { id: 'sports', label: 'رياضة', image: images.gym, icon: Icons.Dumbbell },
  { id: 'fashion', label: 'أزياء', image: images.fashion, icon: Icons.Shirt },
  { id: 'more', label: 'المزيد', icon: Icons.Grid2X2 || Icons.Grid3X3 },
];

export const products = [
  {
    id: 'fallback-watch',
    title: 'ساعة ذكية جديدة من سلسلة خان',
    store: 'متجر الشريحة الذكية',
    price: formatSyp(50000),
    priceValue: 50000,
    image: images.cup,
    freeDelivery: true,
    rating: 4.5,
  },
  {
    id: 'fallback-shoe',
    title: 'حذاء يومي أبيض بتوصيل مجاني',
    store: 'متجر الهدايا الذكية',
    price: formatSyp(50000),
    priceValue: 50000,
    image: images.shoe,
    freeDelivery: true,
    rating: 4.5,
  },
  {
    id: 'fallback-bundle',
    title: 'ساعة وهاتف مع سماعات لاسلكية',
    store: 'متجر الإلكترونيات',
    price: formatSyp(50000),
    priceValue: 50000,
    image: images.phoneWatch,
    freeDelivery: false,
    rating: 4.5,
  },
  {
    id: 'fallback-gift',
    title: 'مجموعة هدايا مكتبية فاخرة',
    store: 'متجر الهدايا',
    price: formatSyp(75000),
    priceValue: 75000,
    image: images.giftBox,
    freeDelivery: false,
    rating: 4.5,
  },
  {
    id: 'fallback-gym',
    title: 'معدات رياضة منزلية',
    store: 'نادي خان',
    price: formatSyp(50000),
    priceValue: 50000,
    image: images.gym,
    freeDelivery: false,
    rating: 4.5,
  },
  {
    id: 'fallback-fashion',
    title: 'عرض أزياء موسمي محدود',
    store: 'خان ستايل',
    price: formatSyp(50000),
    priceValue: 50000,
    image: images.fashion,
    freeDelivery: false,
    rating: 4.5,
  },
];

export const productUnitPrice = 50000;

export const reels = [
  { id: 'fallback-reel-phone', title: 'خصم على هاتف A07', image: images.reelPhone, product: products[2] },
  { id: 'fallback-reel-cup', title: 'كوب ذكي مع غطاء محكم', image: images.cup, product: products[0] },
  { id: 'fallback-reel-watch', title: 'ساعة وسماعات', image: images.phoneWatch, product: products[2] },
];

export const coupons = [
  { id: 'fallback-coupon-1', code: 'KHAN10', label: 'خصم 10%', color: palette.green },
  { id: 'fallback-coupon-2', code: 'SAVE50', label: formatSyp(50000), color: palette.amber },
  { id: 'fallback-coupon-3', code: 'FREEDEL', label: 'توصيل مجاني', color: palette.greenDark },
];

export const adminRows = [
  { name: 'المتجر الذكي', kind: 'إلكتروني', status: 'مفعل', value: '120,300 ل.س' },
  { name: 'خان ستايل', kind: 'أزياء', status: 'مفعل', value: '89,400 ل.س' },
  { name: 'هدايا خان', kind: 'هدايا', status: 'قيد المراجعة', value: '45,000 ل.س' },
  { name: 'نادي الرياضة', kind: 'رياضة', status: 'مفعل', value: '76,250 ل.س' },
];

export function normalizeCategory(category, index = 0) {
  if (!category?.name) return categories[index % categories.length];
  return {
    id: category.id,
    label: category.name,
    image: resolveRemoteImage(category.imageUrl, categories[index % categories.length]?.image),
    icon: categories[index % categories.length]?.icon || Icons.Grid2X2,
    raw: category,
  };
}

export function normalizeProduct(product, index = 0) {
  if (!product?.name && product?.title) return product;
  const fallback = products[index % products.length];
  const imageUrl = product?.images?.[0]?.url || product?.product?.images?.[0]?.url;
  const priceValue = Number(product?.price ?? fallback.priceValue);

  return {
    id: product?.id || fallback.id,
    title: product?.name || fallback.title,
    store: product?.store?.name || fallback.store,
    storeId: product?.storeId || product?.store?.id,
    category: product?.category?.name,
    price: formatSyp(priceValue),
    priceValue,
    stock: product?.stock ?? 0,
    image: resolveRemoteImage(imageUrl, fallback.image),
    freeDelivery: Boolean(product?.freeDelivery),
    rating: Number(product?.ratingAvg || fallback.rating || 4.5),
    raw: product,
  };
}

export function normalizeCoupon(coupon, index = 0) {
  if (!coupon?.code) return coupons[index % coupons.length];
  const label = coupon.type === 'PERCENT' ? `خصم ${coupon.value}%` : formatSyp(coupon.value);
  return {
    id: coupon.id,
    code: coupon.code,
    label,
    color: couponColors[index % couponColors.length],
    raw: coupon,
  };
}

export function normalizeReel(reel, index = 0) {
  if (!reel?.title || reel?.image) return reels[index % reels.length] || reel;
  return {
    id: reel.id,
    title: reel.title,
    image: resolveRemoteImage(reel.thumbnailUrl, reels[index % reels.length]?.image || images.reelPhone),
    product: reel.product ? normalizeProduct(reel.product, index) : products[index % products.length],
    raw: reel,
  };
}

export function normalizeCart(cart) {
  return (cart?.items || []).map((item, index) => ({
    id: item.id,
    quantity: item.quantity,
    product: normalizeProduct(item.product, index),
  }));
}

export function HeaderSearch({ title, compact = false, value, onChangeText, onSubmit }) {
  return (
    <View style={[styles.header, compact && styles.headerCompact]}>
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.roundIconGhost}>
          <AppIcon icon={Icons.Bell} size={19} color={palette.amber} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.roundIconGhost}>
          <AppIcon icon={Icons.ShoppingBag} size={19} color={palette.amber} />
        </TouchableOpacity>
      </View>
      {title ? <RText style={styles.headerTitle}>{title}</RText> : null}
      <View style={styles.searchWrap}>
        <TouchableOpacity style={styles.searchButton} onPress={onSubmit}>
          <AppIcon icon={Icons.Search} size={18} color={palette.white} />
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="ابحث عن أي شيء تريده..."
          placeholderTextColor="#A8AFB7"
          textAlign="right"
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
        />
      </View>
    </View>
  );
}

export function CategoryBubble({ item }) {
  return (
    <TouchableOpacity style={styles.categoryItem}>
      <View style={styles.categoryImageWrap}>
        {item.image ? (
          <Image source={item.image} style={styles.categoryImage} />
        ) : (
          <AppIcon icon={item.icon} color={palette.muted} />
        )}
      </View>
      <RText numberOfLines={1} style={styles.categoryLabel}>
        {item.label}
      </RText>
    </TouchableOpacity>
  );
}

export function CategoryStrip({ double = false, items = categories }) {
  const list = double ? [...items, ...items.slice(0, 4)] : items;
  return (
    <View style={[styles.categoryStrip, double && styles.categoryStripDouble]}>
      {list.map((item, index) => (
        <CategoryBubble key={`${item.id || item.label}-${index}`} item={item} />
      ))}
    </View>
  );
}

export function SectionTitle({ title, icon, action = 'عرض الكل' }) {
  return (
    <View style={styles.sectionTitle}>
      <TouchableOpacity>
        <RText style={styles.sectionAction}>{action}</RText>
      </TouchableOpacity>
      <View style={styles.sectionName}>
        {icon ? <AppIcon icon={icon} size={16} color={palette.green} /> : null}
        <RText style={styles.sectionHeading}>{title}</RText>
      </View>
    </View>
  );
}

export function PromoBanner() {
  return (
    <View style={styles.promoBanner}>
      <View style={styles.promoText}>
        <RText style={styles.promoTitle}>عروض وحسومات!</RText>
        <RText style={styles.promoBody}>خصومات مميزة على مطاعم، كافيهات، متاجر وخدمات قريبة منك</RText>
        <TouchableOpacity style={styles.promoButton}>
          <RText style={styles.promoButtonText}>اكتشف الآن</RText>
          <AppIcon icon={Icons.ChevronLeft} size={14} color={palette.amber} />
        </TouchableOpacity>
      </View>
      <Image source={images.giftBox} style={styles.promoImage} />
    </View>
  );
}

export function ReelCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.reelCard} onPress={() => onPress?.(item)}>
      <Image source={item.image} style={styles.reelThumb} />
      <View style={styles.reelPlay}>
        <AppIcon icon={Icons.CirclePlay || Icons.PlayCircle} size={18} color={palette.white} />
        <RText style={styles.reelCount}>12.3k</RText>
      </View>
      <View style={styles.reelMeta}>
        <TouchableOpacity style={styles.miniCart}>
          <AppIcon icon={Icons.ShoppingCart} size={15} color={palette.green} />
        </TouchableOpacity>
        <RText numberOfLines={1} style={styles.reelTitle}>
          {item.title}
        </RText>
      </View>
    </TouchableOpacity>
  );
}

export function CouponCard({ coupon, index }) {
  return (
    <TouchableOpacity style={[styles.couponCard, { backgroundColor: coupon.color }]}>
      <View style={styles.ticketCutLeft} />
      <View style={styles.ticketCutRight} />
      <RText style={styles.couponPrice}>{coupon.label || formatSyp(50000)}</RText>
      <RText style={styles.couponCode}>كود: {coupon.code}</RText>
      <TouchableOpacity style={styles.copyButton}>
        <RText style={styles.copyButtonText}>نسخ</RText>
      </TouchableOpacity>
      <RText style={styles.couponIndex}>0{index + 1}</RText>
    </TouchableOpacity>
  );
}

export function RatingPill({ rating = 4.5 }) {
  return (
    <View style={styles.ratingPill}>
      <RText style={styles.ratingText}>{Number(rating || 0).toFixed(1)}</RText>
      <AppIcon icon={Icons.Star} size={11} color={palette.amber} strokeWidth={2.8} />
    </View>
  );
}

export function ProductCard({
  product,
  compact = false,
  onOpen,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
}) {
  return (
    <TouchableOpacity
      style={[styles.productCard, compact && styles.productCardCompact]}
      onPress={() => onOpen?.(product)}
    >
      <View style={styles.productImageBox}>
        <Image source={product.image} style={styles.productImage} />
        <TouchableOpacity style={styles.heartButton} onPress={() => onToggleFavorite?.(product)}>
          <AppIcon
            icon={Icons.Heart}
            size={17}
            color={isFavorite ? palette.amber : palette.white}
            strokeWidth={isFavorite ? 3 : 2}
          />
        </TouchableOpacity>
        <View style={styles.productBadges}>
          <RatingPill rating={product.rating} />
          {product.freeDelivery ? (
            <View style={styles.deliveryPill}>
              <RText style={styles.deliveryText}>توصيل مجاني</RText>
            </View>
          ) : null}
        </View>
      </View>
      <RText numberOfLines={2} style={styles.productTitle}>
        {product.title}
      </RText>
      <View style={styles.storeLine}>
        <View style={styles.storeAvatar} />
        <RText numberOfLines={1} style={styles.storeName}>
          {product.store}
        </RText>
      </View>
      <RText style={styles.productPrice}>{product.price}</RText>
      <TouchableOpacity style={styles.productCart} onPress={() => onAddToCart?.(product)}>
        <AppIcon icon={Icons.ShoppingCart} size={16} color={palette.green} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export function Tabs({ tabs, active, onChange, compact = false }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.tabs, compact && styles.tabsCompact]}
    >
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tabItem, active === tab && styles.tabItemActive]}
          onPress={() => onChange(tab)}
        >
          <RText style={[styles.tabText, active === tab && styles.tabTextActive]}>{tab}</RText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
