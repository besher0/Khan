import React from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import * as Icons from '../../../../icons';
import googleImage from '../../../../assets/google.jpg';
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
  google: googleImage,
  storeBanner: storeBannerImage,
};

const couponColors = [palette.green, palette.amber, palette.greenDark, palette.danger];
const IconCircle = Icons.Circle || Icons.Dot;

export function AppIcon({ icon, size = 20, color = palette.ink, strokeWidth = 2, fill = 'none' }) {
  const Glyph = icon || IconCircle;
  return <Glyph size={size} color={color} strokeWidth={strokeWidth} fill={fill} />;
}

export function CartIcon({ size = 20, color = palette.green }) {
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

export function RText({ children, style, ...props }) {
  return (
    <Text {...props} style={[styles.rtlText, style]}>
      {children}
    </Text>
  );
}

export function RtlHorizontalScroll({
  children,
  contentContainerStyle,
  style,
  refreshKey,
}) {
  const items = React.Children.toArray(children);
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: false });
    });
  }, [refreshKey]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.rtlHorizontalScroll, style]}
      contentContainerStyle={[
        styles.rtlHorizontalContent,
        contentContainerStyle,
      ]}
      onContentSizeChange={() => {
        scrollRef.current?.scrollToEnd({ animated: false });
      }}
      onTouchStart={(event) => event?.stopPropagation?.()}
      onTouchEnd={(event) => event?.stopPropagation?.()}
    >
      {items.map((child, index) => (
        <View
          key={child.key || `rtl-${index}`}
          style={styles.rtlHorizontalItem}
        >
          {child}
        </View>
      ))}
    </ScrollView>
  );
}

export function formatSyp(value) {
  const amount = Number(value) || 0;
  return `${new Intl.NumberFormat('ar-SY').format(amount)} ل.س`;
}

function resolveRemoteImage(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return { uri: url };
  return { uri: `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}` };
}

export function normalizeCategory(category, index = 0) {
  if (!category?.name) return null;
  return {
    id: category.id,
    label: category.name,
    image: resolveRemoteImage(category.imageUrl),
    icon: Icons.Grid2X2 || Icons.Grid3X3,
    raw: category,
  };
}

export function normalizeProduct(product, index = 0) {
  if (!product?.name && product?.title) return product;
  if (!product?.name) return null;
  const imageUrl = product?.images?.[0]?.url || product?.product?.images?.[0]?.url;
  const priceValue = Number(product?.price || 0);

  return {
    id: product.id,
    title: product.name,
    store: product?.store?.name || '',
    storeId: product?.storeId || product?.store?.id,
    category: product?.category?.name,
    price: formatSyp(priceValue),
    priceValue,
    stock: product?.stock ?? 0,
    image: resolveRemoteImage(imageUrl),
    freeDelivery: Boolean(product?.freeDelivery),
    rating: Number(product?.ratingAvg || 0),
    description: product?.description || '',
    raw: product,
  };
}

export function normalizeCoupon(coupon, index = 0) {
  if (!coupon?.code) return null;
  const label = coupon.type === 'PERCENT' ? `خصم ${coupon.value}%` : formatSyp(coupon.value);
  return {
    id: coupon.id,
    code: coupon.code,
    label,
    storeId: coupon.storeId || coupon.store?.id,
    color: couponColors[index % couponColors.length],
    raw: coupon,
  };
}

export function normalizeBanner(banner, index = 0) {
  if (!banner?.imageUrl) return null;
  return {
    id: banner.id,
    title: banner.title || '',
    subtitle: banner.subtitle || '',
    image: resolveRemoteImage(banner.imageUrl),
    ctaLabel: banner.ctaLabel || '',
    targetUrl: banner.targetUrl || '',
    position: Number(banner.position || index),
    product: banner.product ? normalizeProduct(banner.product, index) : null,
    raw: banner,
  };
}

export function normalizeReel(reel, index = 0) {
  if (!reel?.title && !reel?.image) return null;
  if (reel?.image) return reel;
  return {
    id: reel.id,
    title: reel.title,
    image: resolveRemoteImage(reel.thumbnailUrl),
    product: reel.product ? normalizeProduct(reel.product, index) : null,
    raw: reel,
  };
}

export function normalizeCart(cart) {
  return (cart?.items || [])
    .map((item, index) => ({
      id: item.id,
      quantity: item.quantity,
      product: normalizeProduct(item.product, index),
    }))
    .filter((item) => item.product);
}

export function HeaderSearch({
  title,
  compact = false,
  value,
  onChangeText,
  onSubmit,
  onOpenFavorites,
  onOpenNotifications,
  notificationCount = 0,
}) {
  return (
    <View style={[styles.header, compact && styles.headerCompact]}>
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.roundIconGhost} onPress={onOpenNotifications}>
          <AppIcon icon={Icons.Bell} size={19} color={palette.amber} />
          {notificationCount > 0 ? (
            <View style={styles.headerBadge}>
              <RText style={styles.headerBadgeText}>{notificationCount > 9 ? '9+' : notificationCount}</RText>
            </View>
          ) : null}
        </TouchableOpacity>
        <TouchableOpacity style={styles.roundIconGhost} onPress={onOpenFavorites}>
          <AppIcon icon={Icons.Heart} size={19} color={palette.amber} />
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

export function CategoryStrip({ double = false, items = [] }) {
  const list = double ? items : items;
  if (!list.length) return null;

  return (
    <View style={[styles.categoryStrip, double && styles.categoryStripDouble]}>
      {list.map((item, index) => (
        <CategoryBubble key={`${item.id || item.label}-${index}`} item={item} />
      ))}
    </View>
  );
}

export function SectionTitle({ title, icon, action = 'عرض الكل', onAction }) {
  return (
    <View style={styles.sectionTitle}>
      <TouchableOpacity onPress={onAction} disabled={!onAction}>
        <RText style={styles.sectionAction}>{action}</RText>
      </TouchableOpacity>
      <View style={styles.sectionName}>
        {icon ? <AppIcon icon={icon} size={16} color={palette.green} /> : null}
        <RText style={styles.sectionHeading}>{title}</RText>
      </View>
    </View>
  );
}

export function ReelCard({ item, onPress, style }) {
  return (
    <TouchableOpacity style={[styles.reelCard, style]} onPress={() => onPress?.(item)}>
      {item.image ? (
        <Image source={item.image} style={styles.reelThumb} />
      ) : (
        <View style={[styles.reelThumb, { alignItems: 'center', justifyContent: 'center', backgroundColor: palette.greenSoft }]}>
          <AppIcon icon={Icons.Video} size={24} color={palette.green} />
        </View>
      )}
      <View style={styles.reelPlay}>
        <AppIcon icon={Icons.CirclePlay || Icons.PlayCircle} size={18} color={palette.white} />
      </View>
      <View style={styles.reelMeta}>
        <TouchableOpacity style={styles.miniCart}>
          <CartIcon size={15} color={palette.green} />
        </TouchableOpacity>
        <RText numberOfLines={1} style={styles.reelTitle}>
          {item.title}
        </RText>
      </View>
    </TouchableOpacity>
  );
}

export function CouponCard({ coupon, index, style, onCopy }) {
  return (
    <TouchableOpacity style={[styles.couponCard, { backgroundColor: coupon.color }, style]}>
      <View style={styles.ticketCutLeft} />
      <View style={styles.ticketCutRight} />
      <RText style={styles.couponPrice}>{coupon.label || '-'}</RText>
      <RText style={styles.couponCode}>كود: {coupon.code}</RText>
      <TouchableOpacity
        style={styles.copyButton}
        onPress={(event) => {
          event?.stopPropagation?.();
          onCopy?.(coupon.code);
        }}
      >
        <RText style={styles.copyButtonText}>نسخ</RText>
      </TouchableOpacity>
      <RText style={styles.couponIndex}>0{index + 1}</RText>
    </TouchableOpacity>
  );
}

export function RatingPill({ rating = 0 }) {
  const value = Number(rating) || 0;
  return (
    <View style={styles.ratingPill}>
      <RText style={styles.ratingText}>{value.toFixed(1)}</RText>
      <AppIcon icon={Icons.Star} size={11} color={palette.amber} strokeWidth={2.8} />
    </View>
  );
}

export function ProductCard({
  product,
  compact = false,
  style,
  onOpen,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
  showcase = false,
}) {
  return (
    <TouchableOpacity
      style={[styles.productCard, compact && styles.productCardCompact, showcase && styles.productCardShowcase, style]}
      onPress={() => onOpen?.(product)}
    >
      <View style={[styles.productImageBox, showcase && styles.productImageBoxShowcase]}>
        {product.image ? (
          <Image source={product.image} style={styles.productImage} />
        ) : (
          <View style={[styles.productImage, { alignItems: 'center', justifyContent: 'center', backgroundColor: palette.greenSoft }]}>
            <AppIcon icon={Icons.Package} size={28} color={palette.green} />
          </View>
        )}
        <TouchableOpacity
          style={styles.heartButton}
          onPress={(event) => {
            event?.stopPropagation?.();
            onToggleFavorite?.(product);
          }}
        >
          <AppIcon
            icon={Icons.Heart}
            size={17}
            color={isFavorite ? palette.amber : palette.white}
            strokeWidth={isFavorite ? 3 : 2}
          />
        </TouchableOpacity>
        <View style={[styles.productBadges, showcase && styles.productBadgesShowcase]}>
          <RatingPill rating={product.rating} />
          {product.freeDelivery || showcase ? (
            <View style={styles.deliveryPill}>
              <AppIcon icon={Icons.Truck} size={10} color={palette.white} />
              <RText style={styles.deliveryText}>توصيل مجاني</RText>
            </View>
          ) : null}
        </View>
      </View>
      <RText numberOfLines={2} style={[styles.productTitle, showcase && styles.productTitleShowcase]}>
        {product.title}
      </RText>
      <View style={styles.storeLine}>
        <View style={styles.storeAvatar} />
        <RText numberOfLines={1} style={styles.storeName}>
          {product.store}
        </RText>
      </View>
      <RText style={[styles.productPrice, showcase && styles.productPriceShowcase]}>{product.price}</RText>
      <TouchableOpacity
        style={[styles.productCart, showcase && styles.productCartShowcase]}
        onPress={(event) => {
          event?.stopPropagation?.();
          onAddToCart?.(product);
        }}
      >
        <CartIcon size={16} color={palette.green} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export function Tabs({ tabs, active, onChange, compact = false }) {
  return (
    <RtlHorizontalScroll
      refreshKey={`tabs-${tabs.join('|')}`}
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
    </RtlHorizontalScroll>
  );
}
