import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import * as Icons from './icons';
import cupImage from './assets/cup.jpg';
import electronicsImage from './assets/electronics.jpg';
import fashionImage from './assets/fashion.jpg';
import giftBoxImage from './assets/gift-box.jpg';
import googleImage from './assets/google.jpg';
import gymImage from './assets/gym.jpg';
import phoneWatchImage from './assets/phone-watch.jpg';
import reelPhoneImage from './assets/reel-phone.jpg';
import shoeImage from './assets/shoe.jpg';
import storeBannerImage from './assets/store-banner.jpg';

const palette = {
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

const images = {
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

const IconCircle = Icons.Circle || Icons.Dot;

function AppIcon({ icon, size = 20, color = palette.ink, strokeWidth = 2 }) {
  const Glyph = icon || IconCircle;
  return <Glyph size={size} color={color} strokeWidth={strokeWidth} />;
}

function RText({ children, style, ...props }) {
  return (
    <Text {...props} style={[styles.rtlText, style]}>
      {children}
    </Text>
  );
}

function DeviceStatus() {
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
        <RText style={styles.wifi}>⌁</RText>
        <View style={styles.battery}>
          <View style={styles.batteryFill} />
        </View>
      </View>
    </View>
  );
}

function HeaderSearch({ title, compact = false }) {
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
        <TouchableOpacity style={styles.searchButton}>
          <AppIcon icon={Icons.Search} size={18} color={palette.white} />
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="ابحث عن أي شيء تريده..."
          placeholderTextColor="#A8AFB7"
          textAlign="right"
        />
      </View>
    </View>
  );
}

const categories = [
  { label: 'هدايا', image: images.giftBox, icon: Icons.Gift },
  { label: 'الكترونيات', image: images.electronics, icon: Icons.Smartphone },
  { label: 'متاجر', image: images.storeBanner, icon: Icons.Store },
  { label: 'رياضة', image: images.gym, icon: Icons.Dumbbell },
  { label: 'أزياء', image: images.fashion, icon: Icons.Shirt },
  { label: 'المزيد', icon: Icons.Grid2X2 || Icons.Grid3X3 },
];

const products = [
  { title: 'ساعة ذكية جديدة من سلسلة خان', store: 'متجر الشريحة الذكية', price: '50.000 ل.س', image: images.cup },
  { title: 'حذاء يومي أبيض بتوصيل مجاني', store: 'متجر الهدايا الذكية', price: '50.000 ل.س', image: images.shoe },
  { title: 'ساعة وهاتف مع سماعات لاسلكية', store: 'متجر الالكترونيات', price: '50.000 ل.س', image: images.phoneWatch },
  { title: 'مجموعة هدايا مكتبية فاخرة', store: 'متجر الهدايا', price: '50.000 ل.س', image: images.giftBox },
  { title: 'معدات رياضة منزلية', store: 'نادي خان', price: '50.000 ل.س', image: images.gym },
  { title: 'عرض أزياء موسمي محدود', store: 'خان ستايل', price: '50.000 ل.س', image: images.fashion },
];

const productUnitPrice = 50000;

function formatSyp(value) {
  return `${new Intl.NumberFormat('ar-SY').format(value)} ل.س`;
}

const reels = [
  { title: 'خصم على هاتف A07', image: images.reelPhone },
  { title: 'كوب ذكي مع غطاء محكم', image: images.cup },
  { title: 'ساعة وسماعات', image: images.phoneWatch },
];

const coupons = [
  { code: 'e35gd', color: palette.green },
  { code: 'e35gd', color: palette.amber },
  { code: 'e35gd', color: palette.green },
];

const adminRows = [
  { name: 'المتجر الذكي', kind: 'الكتروني', status: 'مفعل', value: '120,300 ل.س' },
  { name: 'خان ستايل', kind: 'أزياء', status: 'مفعل', value: '89,400 ل.س' },
  { name: 'هدايا خان', kind: 'هدايا', status: 'قيد المراجعة', value: '45,000 ل.س' },
  { name: 'نادي الرياضة', kind: 'رياضة', status: 'مفعل', value: '76,250 ل.س' },
];

function CategoryBubble({ item }) {
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

function SectionTitle({ title, icon, action = 'عرض الكل' }) {
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

function PromoBanner() {
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

function ReelCard({ item }) {
  return (
    <TouchableOpacity style={styles.reelCard}>
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

function CouponCard({ coupon, index }) {
  return (
    <TouchableOpacity style={[styles.couponCard, { backgroundColor: coupon.color }]}>
      <View style={styles.ticketCutLeft} />
      <View style={styles.ticketCutRight} />
      <RText style={styles.couponPrice}>50.000 ل.س</RText>
      <RText style={styles.couponCode}>كود: {coupon.code}</RText>
      <TouchableOpacity style={styles.copyButton}>
        <RText style={styles.copyButtonText}>نسخ</RText>
      </TouchableOpacity>
      <RText style={styles.couponIndex}>0{index + 1}</RText>
    </TouchableOpacity>
  );
}

function RatingPill() {
  return (
    <View style={styles.ratingPill}>
      <RText style={styles.ratingText}>4.5</RText>
      <AppIcon icon={Icons.Star} size={11} color={palette.amber} strokeWidth={2.8} />
    </View>
  );
}

function ProductCard({
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
          <RatingPill />
          <View style={styles.deliveryPill}>
            <RText style={styles.deliveryText}>توصيل مجاني</RText>
          </View>
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

function CategoryStrip({ double = false }) {
  const list = double ? [...categories, ...categories.slice(0, 4)] : categories;
  return (
    <View style={[styles.categoryStrip, double && styles.categoryStripDouble]}>
      {list.map((item, index) => (
        <CategoryBubble key={`${item.label}-${index}`} item={item} />
      ))}
    </View>
  );
}

function Tabs({ tabs, active, onChange, compact = false }) {
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

function HomeScreen({ onOpenProduct, onAddToCart, onToggleFavorite, favorites }) {
  const [tab, setTab] = useState('الكل');
  return (
    <ScreenScroll>
      <HeaderSearch />
      <PromoBanner />
      <CategoryStrip />
      <SectionTitle title="ريلز خان" icon={Icons.Video} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCards}>
        {reels.map((item) => (
          <ReelCard key={item.title} item={item} />
        ))}
      </ScrollView>
      <SectionTitle title="كوبونات خان" icon={Icons.Ticket || Icons.Tag} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCards}>
        {coupons.map((coupon, index) => (
          <CouponCard key={`${coupon.code}-${index}`} coupon={coupon} index={index} />
        ))}
      </ScrollView>
      <SectionTitle title="موصى به لك" icon={Icons.Flame || Icons.Star} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCards}>
        {products.slice(0, 3).map((product) => (
          <ProductCard
            key={product.title}
            product={product}
            compact
            onOpen={onOpenProduct}
            onAddToCart={onAddToCart}
            onToggleFavorite={onToggleFavorite}
            isFavorite={favorites.includes(product.title)}
          />
        ))}
      </ScrollView>
      <View style={styles.offerBand}>
        <View style={styles.offerCard}>
          <Image source={images.cup} style={styles.offerImage} />
          <View style={styles.offerText}>
            <RText style={styles.offerTitle}>توصيل مجاني</RText>
            <RText style={styles.offerSub}>اشتري 500 ألف وأكثر</RText>
            <TouchableOpacity style={styles.offerButton}>
              <RText style={styles.offerButtonText}>تسوق الآن</RText>
            </TouchableOpacity>
          </View>
        </View>
        <View style={[styles.offerCard, styles.offerCardAmber]}>
          <Image source={images.giftBox} style={styles.offerImage} />
          <View style={styles.offerText}>
            <RText style={styles.offerTitle}>خصم حتى</RText>
            <RText style={styles.offerSub}>اشتري ووفر أكثر</RText>
            <TouchableOpacity style={[styles.offerButton, styles.offerButtonAmber]}>
              <RText style={styles.offerButtonText}>تسوق الآن</RText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Tabs tabs={['الكل', 'عروض', 'أدوات معدلة', 'ألعاب أطفال', 'المنزل', 'العروض']} active={tab} onChange={setTab} />
      <View style={styles.productGrid}>
        {products.map((product) => (
          <ProductCard
            key={`grid-${product.title}`}
            product={product}
            onOpen={onOpenProduct}
            onAddToCart={onAddToCart}
            onToggleFavorite={onToggleFavorite}
            isFavorite={favorites.includes(product.title)}
          />
        ))}
      </View>
    </ScreenScroll>
  );
}

function SearchScreen({ onOpenProduct, onAddToCart, onToggleFavorite, favorites }) {
  const [tab, setTab] = useState('الكل');
  return (
    <ScreenScroll>
      <HeaderSearch compact />
      <CategoryStrip double />
      <Tabs tabs={['الكل', 'عروض', 'ألعاب أطفال', 'المنزل', 'العروض']} active={tab} onChange={setTab} />
      <View style={styles.productGrid}>
        {products.slice(0, 4).map((product) => (
          <ProductCard
            key={`search-${product.title}`}
            product={product}
            onOpen={onOpenProduct}
            onAddToCart={onAddToCart}
            onToggleFavorite={onToggleFavorite}
            isFavorite={favorites.includes(product.title)}
          />
        ))}
      </View>
    </ScreenScroll>
  );
}

function StoreInfoScreen({ onOpenProduct, onAddToCart, onToggleFavorite, favorites }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.storeInner}>
      <View style={styles.storeTopActions}>
        <TouchableOpacity style={styles.roundIconGhost}>
          <AppIcon icon={Icons.Heart} size={18} color={palette.amber} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.roundIconGhost}>
          <AppIcon icon={Icons.Share2} size={18} color={palette.amber} />
        </TouchableOpacity>
        <RText style={styles.storeScreenTitle}>ألبسة اللؤلؤ</RText>
        <TouchableOpacity style={styles.greenTiny}>
          <AppIcon icon={Icons.ArrowLeft} size={16} color={palette.white} />
        </TouchableOpacity>
      </View>
      <Image source={images.storeBanner} style={styles.storeHero} />
      <View style={styles.storeStats}>
        <Metric icon={Icons.Clock} label="ساعات العمل" value="6:00 - 23:00" />
        <Metric icon={Icons.Tag} label="الفئة" value="ألبسة" />
        <Metric icon={Icons.MessageCircle} label="التقييم" value="4.5/5" />
        <Metric icon={Icons.Users} label="عدد التعليقات" value="1,356" />
      </View>
      <SectionTitle title="كوبونات خان" icon={Icons.Ticket || Icons.Tag} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCards}>
        {coupons.map((coupon, index) => (
          <CouponCard key={`store-coupon-${index}`} coupon={coupon} index={index} />
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
          <RText style={styles.tinyMuted}>1,212 تقييم</RText>
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
      <Tabs tabs={['الكل', 'عروض', 'أدوات معدلة', 'ألعاب أطفال', 'المنزل']} active="الكل" onChange={() => {}} />
      <View style={styles.productGrid}>
        {products.slice(0, 4).map((product) => (
          <ProductCard
            key={`store-${product.title}`}
            product={product}
            onOpen={onOpenProduct}
            onAddToCart={onAddToCart}
            onToggleFavorite={onToggleFavorite}
            isFavorite={favorites.includes(product.title)}
          />
        ))}
      </View>
    </ScrollView>
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

function StoreListScreen() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.storeInner}>
      <HeaderSearch title="المتاجر" compact />
      <SectionTitle title="كوبونات خان" icon={Icons.Ticket || Icons.Tag} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCards}>
        {coupons.map((coupon, index) => (
          <CouponCard key={`list-coupon-${index}`} coupon={coupon} index={index} />
        ))}
      </ScrollView>
      <Tabs tabs={['الكل', 'خصومات', 'عروض', 'الكتروني', 'المنزل']} active="الكتروني" onChange={() => {}} />
      <View style={styles.storeCardGrid}>
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <View key={item} style={styles.storeMiniCard}>
            <Image source={images.electronics} style={styles.storeMiniImage} />
            <RText style={styles.storeMiniTitle}>متجر سمارت</RText>
            <RText style={styles.storeMiniSub}>ألبسة</RText>
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

function ReviewsScreen({ rateMode = false }) {
  if (rateMode) {
    return (
      <View style={styles.rateScreen}>
        <View style={styles.reviewStoreHeader}>
          <View style={styles.storeAvatarLarge} />
          <View style={{ flex: 1 }}>
            <RText style={styles.reviewStoreName}>اسم المتجر</RText>
            <RText style={styles.categoryChipText}>الكترونيات</RText>
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
        />
        <RText style={styles.rateQuestion}>اضف صورة من تجربتك (اختياري)</RText>
        <View style={styles.uploadRow}>
          <View style={styles.uploadBox} />
          <View style={styles.uploadBox} />
          <TouchableOpacity style={styles.uploadDashed}>
            <AppIcon icon={Icons.Camera} size={22} color={palette.muted} />
            <RText style={styles.uploadText}>إضافة صورة</RText>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.submitButton}>
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
          <RText style={styles.tinyMuted}>1,212 تقييم</RText>
        </View>
        <TouchableOpacity style={styles.rateButton}>
          <RText style={styles.rateButtonText}>قيّم هذا المتجر</RText>
        </TouchableOpacity>
      </View>
      <View style={styles.commentHeader}>
        <RText style={styles.sectionHeading}>جميع التعليقات (1,232)</RText>
        <RText style={styles.tinyMuted}>الترتيب: الأحدث أولاً</RText>
      </View>
      {['أحمد هندي', 'رامي محمد', 'حسام حسين', 'محمد محمد'].map((name) => (
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
            <RText style={styles.commentText}>جودة ممتازة جداً وخصومات رائعة.</RText>
          </View>
          <RText style={styles.commentDate}>22/2/2026</RText>
        </View>
      ))}
    </ScrollView>
  );
}

function StoreScreen({ onOpenProduct, onAddToCart, onToggleFavorite, favorites }) {
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
          onOpenProduct={onOpenProduct}
          onAddToCart={onAddToCart}
          onToggleFavorite={onToggleFavorite}
          favorites={favorites}
        />
      ) : null}
      {view === 'المتاجر' ? <StoreListScreen /> : null}
      {view === 'التقييمات' ? <ReviewsScreen /> : null}
      {view === 'إرسال تقييم' ? <ReviewsScreen rateMode /> : null}
    </View>
  );
}

function ProductDetailsScreen({
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
          <View style={styles.detailsDotActive} />
          <View style={styles.detailsDot} />
          <View style={styles.detailsDot} />
        </View>
      </View>

      <View style={styles.detailsBody}>
        <View style={styles.detailsBadgeRow}>
          <View style={styles.detailsDelivery}>
            <AppIcon icon={Icons.Truck} size={14} color={palette.green} />
            <RText style={styles.detailsDeliveryText}>توصيل مجاني</RText>
          </View>
          <View style={styles.detailsRating}>
            <RText style={styles.detailsRatingText}>4.5</RText>
            <AppIcon icon={Icons.Star} size={13} color={palette.amber} />
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
          مع إمكانية التوصيل المجاني.
        </RText>

        <View style={styles.detailsQuantityRow}>
          <RText style={styles.detailsSectionTitle}>الكمية</RText>
          <View style={styles.detailsQuantity}>
            <TouchableOpacity
              style={styles.detailsQtyButton}
              onPress={() => setQuantity((current) => Math.max(1, current - 1))}
            >
              <AppIcon icon={Icons.Minus} size={16} color={palette.greenDark} />
            </TouchableOpacity>
            <RText style={styles.detailsQtyValue}>{quantity}</RText>
            <TouchableOpacity
              style={styles.detailsQtyButton}
              onPress={() => setQuantity((current) => current + 1)}
            >
              <AppIcon icon={Icons.Plus} size={16} color={palette.greenDark} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.detailsAddButton} onPress={() => onAddToCart(product, quantity)}>
          <View>
            <RText style={styles.detailsAddText}>أضف إلى السلة</RText>
            <RText style={styles.detailsAddSub}>{formatSyp(productUnitPrice * quantity)}</RText>
          </View>
          <AppIcon icon={Icons.ShoppingCart} size={22} color={palette.white} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function CartScreen({ cart, onUpdateQuantity, onRemove, onContinueShopping, onCheckout }) {
  const subtotal = cart.reduce((total, item) => total + productUnitPrice * item.quantity, 0);

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

      {cart.map(({ product, quantity }) => (
        <View key={product.title} style={styles.cartItem}>
          <Image source={product.image} style={styles.cartItemImage} />
          <View style={styles.cartItemBody}>
            <RText numberOfLines={2} style={styles.cartItemTitle}>
              {product.title}
            </RText>
            <RText style={styles.cartItemStore}>{product.store}</RText>
            <RText style={styles.cartItemPrice}>{formatSyp(productUnitPrice * quantity)}</RText>
            <View style={styles.cartItemFooter}>
              <View style={styles.cartQty}>
                <TouchableOpacity
                  style={styles.cartQtyButton}
                  onPress={() => onUpdateQuantity(product, quantity - 1)}
                >
                  <AppIcon icon={Icons.Minus} size={14} color={palette.greenDark} />
                </TouchableOpacity>
                <RText style={styles.cartQtyValue}>{quantity}</RText>
                <TouchableOpacity
                  style={styles.cartQtyButton}
                  onPress={() => onUpdateQuantity(product, quantity + 1)}
                >
                  <AppIcon icon={Icons.Plus} size={14} color={palette.greenDark} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.cartRemove} onPress={() => onRemove(product)}>
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

function CheckoutScreen({ cart, onBack, onComplete }) {
  const [payment, setPayment] = useState('cash');
  const subtotal = cart.reduce((total, item) => total + productUnitPrice * item.quantity, 0);

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
        <AuthField label="المدينة" placeholder="دمشق" icon={Icons.MapPin} />
        <AuthField label="العنوان بالتفصيل" placeholder="الحي، الشارع، البناء" icon={Icons.Home} />
        <AuthField label="رقم الهاتف" placeholder="09XXXXXXXX" icon={Icons.Phone} />
      </View>

      <RText style={styles.checkoutSectionTitle}>طريقة الدفع</RText>
      <View style={styles.paymentOptions}>
        <TouchableOpacity
          style={[styles.paymentOption, payment === 'cash' && styles.paymentOptionActive]}
          onPress={() => setPayment('cash')}
        >
          <View style={[styles.paymentRadio, payment === 'cash' && styles.paymentRadioActive]}>
            {payment === 'cash' ? <View style={styles.paymentRadioDot} /> : null}
          </View>
          <View style={{ flex: 1 }}>
            <RText style={styles.paymentTitle}>الدفع عند الاستلام</RText>
            <RText style={styles.tinyMuted}>ادفع نقدًا عند وصول الطلب</RText>
          </View>
          <AppIcon icon={Icons.Banknote} size={24} color={palette.green} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.paymentOption, payment === 'card' && styles.paymentOptionActive]}
          onPress={() => setPayment('card')}
        >
          <View style={[styles.paymentRadio, payment === 'card' && styles.paymentRadioActive]}>
            {payment === 'card' ? <View style={styles.paymentRadioDot} /> : null}
          </View>
          <View style={{ flex: 1 }}>
            <RText style={styles.paymentTitle}>بطاقة إلكترونية</RText>
            <RText style={styles.tinyMuted}>بطاقة ائتمانية أو محفظة رقمية</RText>
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

      <TouchableOpacity style={styles.checkoutButton} onPress={onComplete}>
        <RText style={styles.checkoutText}>تأكيد الطلب</RText>
        <AppIcon icon={Icons.CircleCheck} size={20} color={palette.white} />
      </TouchableOpacity>
    </ScrollView>
  );
}

function OrderSuccessScreen({ onHome }) {
  return (
    <View style={styles.successScreen}>
      <View style={styles.successIcon}>
        <AppIcon icon={Icons.Check} size={44} color={palette.white} strokeWidth={3} />
      </View>
      <RText style={styles.successTitle}>تم تأكيد طلبك</RText>
      <RText style={styles.successText}>سنرسل لك تحديثات الطلب وحالة التوصيل أولًا بأول.</RText>
      <View style={styles.successOrderNumber}>
        <RText style={styles.tinyMuted}>رقم الطلب</RText>
        <RText style={styles.successNumber}>KH-2026-1048</RText>
      </View>
      <TouchableOpacity style={styles.successButton} onPress={onHome}>
        <RText style={styles.successButtonText}>العودة إلى الرئيسية</RText>
      </TouchableOpacity>
    </View>
  );
}

function ReelsScreen({ onAddToCart, onBack }) {
  const [quantity, setQuantity] = useState(1);

  return (
    <View style={styles.reelsScreen}>
      <ImageBackground source={images.reelPhone} style={styles.reelsBackground} resizeMode="cover">
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
            <View style={styles.qtyRow}>
              <RText style={styles.sheetPrice}>50.000 ل.س</RText>
              <View style={styles.qtyControls}>
                <TouchableOpacity
                  style={styles.qtyButton}
                  onPress={() => setQuantity((current) => Math.max(1, current - 1))}
                >
                  <AppIcon icon={Icons.Minus} size={14} color={palette.muted} />
                </TouchableOpacity>
                <RText style={styles.qtyValue}>{quantity}</RText>
                <TouchableOpacity style={styles.qtyButton} onPress={() => setQuantity((current) => current + 1)}>
                  <AppIcon icon={Icons.Plus} size={14} color={palette.muted} />
                </TouchableOpacity>
                <RText style={styles.qtyLabel}>العناصر المختارة</RText>
              </View>
            </View>
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={() => onAddToCart(products[2], quantity)}
            >
              <AppIcon icon={Icons.ShoppingCart} size={22} color={palette.white} />
              <RText style={styles.addToCartText}>أضف للسلة</RText>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

function AuthField({ label, placeholder, icon, secure = false, leadingIcon }) {
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
        />
        <AppIcon icon={icon} size={20} color={palette.amber} />
      </View>
    </View>
  );
}

function AuthScreen() {
  const [mode, setMode] = useState('login');
  const login = mode === 'login';
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
      {login ? (
        <>
          <AuthField label="البريد الإلكتروني" placeholder="البريد الإلكتروني" icon={Icons.Mail} />
          <AuthField label="كلمة المرور" placeholder="**********" icon={Icons.Lock} leadingIcon={Icons.EyeOff} secure />
          <View style={styles.authInline}>
            <TouchableOpacity>
              <RText style={styles.linkText}>نسيت كلمة المرور؟</RText>
            </TouchableOpacity>
            <View style={styles.rememberRow}>
              <View style={styles.checkbox} />
              <RText style={styles.tinyMuted}>تذكرني</RText>
            </View>
          </View>
          <TouchableOpacity style={styles.authPrimary}>
            <RText style={styles.authPrimaryText}>تسجيل الدخول</RText>
          </TouchableOpacity>
          <RText style={styles.authQuestion}>لم تقم بالاشتراك معنا؟</RText>
          <TouchableOpacity onPress={() => setMode('signup')}>
            <RText style={styles.linkText}>إنشاء حساب سهل وستستغرق أقل من دقيقة</RText>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.twoColumns}>
            <AuthField label="الاسم الأول" placeholder="الاسم الأول" icon={Icons.User} />
            <AuthField label="اسم العائلة" placeholder="اسم العائلة" icon={Icons.User} />
          </View>
          <AuthField label="رقم الهاتف" placeholder="**********" icon={Icons.Phone} />
          <AuthField label="البريد الإلكتروني" placeholder="البريد الإلكتروني" icon={Icons.Mail} />
          <AuthField label="كلمة المرور" placeholder="**********" icon={Icons.Lock} leadingIcon={Icons.EyeOff} secure />
          <AuthField label="تأكيد كلمة المرور" placeholder="**********" icon={Icons.Lock} leadingIcon={Icons.EyeOff} secure />
          <View style={styles.termsRow}>
            <View style={styles.checkbox} />
            <RText style={styles.linkText}>أوافق على شروط وأحكام استخدام خان!</RText>
          </View>
          <TouchableOpacity style={styles.authPrimary}>
            <RText style={styles.authPrimaryText}>إنشاء حساب</RText>
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
        <RText style={styles.googleText}>سجل عن طريق الغوغل</RText>
      </TouchableOpacity>
    </ScreenScroll>
  );
}

function ScreenScroll({ children }) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.screenScrollContent}
    >
      {children}
    </ScrollView>
  );
}

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

function PhoneExperience() {
  const initialScreen =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('screen') || 'home'
      : 'home';
  const initialCart =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('seedCart') === '1'
      ? [
          { product: products[0], quantity: 1 },
          { product: products[1], quantity: 2 },
        ]
      : [];
  const [screen, setScreen] = useState(initialScreen);
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [cart, setCart] = useState(initialCart);
  const [favorites, setFavorites] = useState([]);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 1800);
    return () => clearTimeout(timer);
  }, [toast]);

  const addToCart = (product, quantity = 1) => {
    setCart((current) => {
      const existing = current.find((item) => item.product.title === product.title);
      if (existing) {
        return current.map((item) =>
          item.product.title === product.title
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...current, { product, quantity }];
    });
    setToast(`تمت إضافة ${quantity} إلى السلة`);
  };

  const updateQuantity = (product, quantity) => {
    if (quantity <= 0) {
      setCart((current) => current.filter((item) => item.product.title !== product.title));
      return;
    }
    setCart((current) =>
      current.map((item) => (item.product.title === product.title ? { ...item, quantity } : item)),
    );
  };

  const removeFromCart = (product) => {
    setCart((current) => current.filter((item) => item.product.title !== product.title));
    setToast('تم حذف المنتج من السلة');
  };

  const toggleFavorite = (product) => {
    setFavorites((current) =>
      current.includes(product.title)
        ? current.filter((title) => title !== product.title)
        : [...current, product.title],
    );
  };

  const openProduct = (product) => {
    setSelectedProduct(product);
    setScreen('product');
  };

  const sharedProductProps = {
    onOpenProduct: openProduct,
    onAddToCart: addToCart,
    onToggleFavorite: toggleFavorite,
    favorites,
  };

  const content = {
    home: <HomeScreen {...sharedProductProps} />,
    search: <SearchScreen {...sharedProductProps} />,
    store: <StoreScreen {...sharedProductProps} />,
    reels: <ReelsScreen onAddToCart={addToCart} onBack={() => setScreen('home')} />,
    auth: <AuthScreen />,
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
        onComplete={() => {
          setCart([]);
          setScreen('success');
        }}
      />
    ),
    success: <OrderSuccessScreen onHome={() => setScreen('home')} />,
    product: (
      <ProductDetailsScreen
        product={selectedProduct}
        onBack={() => setScreen('home')}
        onAddToCart={addToCart}
        onToggleFavorite={toggleFavorite}
        isFavorite={favorites.includes(selectedProduct.title)}
        onGoToCart={() => setScreen('cart')}
      />
    ),
  }[screen];

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <View style={styles.phoneFrame}>
      <DeviceStatus />
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

function AdminSidebar({ active, onChange, compact }) {
  const items = [
    { key: 'dashboard', label: 'الصفحة الرئيسية', icon: Icons.Home },
    { key: 'orders', label: 'الطلبات', icon: Icons.ClipboardList },
    { key: 'products', label: 'المنتجات', icon: Icons.Package },
    { key: 'reels', label: 'ريلز', icon: Icons.Video },
    { key: 'coupons', label: 'الكوبونات والخصومات', icon: Icons.Percent },
    { key: 'users', label: 'العملاء والمستخدمين', icon: Icons.Users },
    { key: 'reviews', label: 'إدارة التعليقات', icon: Icons.MessageCircle },
    { key: 'wallet', label: 'محفظة المتجر', icon: Icons.Wallet },
    { key: 'settings', label: 'الإعدادات', icon: Icons.Settings },
  ];

  if (compact) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.adminChipNav}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.key}
            onPress={() => onChange(item.key)}
            style={[styles.adminChip, active === item.key && styles.adminChipActive]}
          >
            <AppIcon icon={item.icon} size={16} color={active === item.key ? palette.white : palette.greenDark} />
            <RText style={[styles.adminChipText, active === item.key && styles.adminChipTextActive]}>{item.label}</RText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }

  return (
    <View style={styles.adminSidebar}>
      <RText style={styles.adminLogo}>خان</RText>
      {items.map((item) => (
        <TouchableOpacity
          key={item.key}
          onPress={() => onChange(item.key)}
          style={[styles.sidebarItem, active === item.key && styles.sidebarItemActive]}
        >
          <AppIcon icon={item.icon} size={18} color={palette.white} />
          <RText style={styles.sidebarText}>{item.label}</RText>
        </TouchableOpacity>
      ))}
      <View style={styles.supportLine}>
        <AppIcon icon={Icons.Headphones} size={18} color={palette.white} />
        <RText style={styles.sidebarText}>مركز المساعدة</RText>
      </View>
    </View>
  );
}

function AdminTopBar({ compact }) {
  return (
    <View style={[styles.adminTopBar, compact && styles.adminTopBarCompact]}>
      <View style={styles.adminUser}>
        <View style={styles.adminAvatar} />
        <View>
          <RText style={styles.adminUserName}>محمد أحمد</RText>
          <RText style={styles.tinyMuted}>صاحب متجر</RText>
        </View>
      </View>
      <View style={styles.adminSearch}>
        <TextInput
          placeholder="ابحث عن طلب، منتج، مستخدم..."
          placeholderTextColor="#9AA3AA"
          textAlign="right"
          style={styles.adminSearchInput}
        />
        <AppIcon icon={Icons.Search} size={17} color={palette.muted} />
      </View>
      <TouchableOpacity style={styles.adminNotify}>
        <AppIcon icon={Icons.Bell} size={19} color={palette.green} />
      </TouchableOpacity>
    </View>
  );
}

function StatCard({ icon, value, label, tone = 'green', delta = '+23%' }) {
  const accent = tone === 'amber' ? palette.amber : tone === 'danger' ? palette.danger : palette.green;
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${accent}18` }]}>
        <AppIcon icon={icon} size={20} color={accent} />
      </View>
      <RText style={styles.statValue}>{value}</RText>
      <RText style={styles.statLabel}>{label}</RText>
      <RText style={[styles.statDelta, { color: accent }]}>{delta}</RText>
    </View>
  );
}

function ChartCard() {
  const points = [42, 78, 58, 88, 132, 96, 64];
  return (
    <View style={styles.chartCard}>
      <View style={styles.cardHeader}>
        <RText style={styles.adminCardTitle}>المبيعات</RText>
        <RText style={styles.adminCardValue}>2,334,000 ل.س</RText>
      </View>
      <View style={styles.chartArea}>
        {points.map((height, index) => (
          <View key={index} style={styles.chartColumn}>
            <View style={[styles.chartBarSoft, { height: height * 0.55 }]} />
            <View style={[styles.chartBar, { height: height * 0.45 }]} />
          </View>
        ))}
      </View>
    </View>
  );
}

function PerformanceCard() {
  return (
    <View style={styles.performanceCard}>
      <RText style={styles.adminCardTitle}>أداء المتجر</RText>
      <View style={styles.donutWrap}>
        <View style={styles.donutOuter}>
          <View style={styles.donutInner}>
            <RText style={styles.donutPercent}>95%</RText>
          </View>
        </View>
      </View>
      <View style={styles.starsRow}>
        {[0, 1, 2, 3, 4].map((item) => (
          <AppIcon key={item} icon={Icons.Star} size={14} color={palette.amber} />
        ))}
      </View>
      <TouchableOpacity style={styles.secondaryButton}>
        <RText style={styles.secondaryButtonText}>عرض تفاصيل التقييم</RText>
      </TouchableOpacity>
    </View>
  );
}

function AdminTable({ type }) {
  const headersByType = {
    orders: ['المتجر', 'الحالة', 'المبلغ', 'رقم الطلب', 'الإجراءات'],
    products: ['المنتج', 'الفئة', 'السعر', 'المخزون', 'الإجراءات'],
    coupons: ['الكود', 'تاريخ الانتهاء', 'الخصم', 'المستخدم', 'الحالة'],
    users: ['الاسم', 'الهاتف', 'الطلبات', 'التقييم', 'الحالة'],
    reviews: ['المتجر', 'المستخدم', 'التقييم', 'التعليق', 'الإجراءات'],
    wallet: ['التاريخ', 'الحساب', 'المبلغ', 'طريقة الدفع', 'الحالة'],
  };
  const headers = headersByType[type] || ['الاسم', 'الفئة', 'الحالة', 'القيمة', 'الإجراءات'];

  return (
    <View style={styles.tableCard}>
      <View style={styles.tableTools}>
        <TouchableOpacity style={styles.adminPrimary}>
          <AppIcon icon={Icons.Plus} size={16} color={palette.white} />
          <RText style={styles.adminPrimaryText}>إضافة</RText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <AppIcon icon={Icons.SlidersHorizontal} size={16} color={palette.muted} />
          <RText style={styles.filterText}>تصنيف</RText>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            {headers.map((header) => (
              <RText key={header} style={styles.tableHeaderText}>
                {header}
              </RText>
            ))}
          </View>
          {adminRows.map((row, index) => (
            <View key={`${row.name}-${index}`} style={styles.tableRow}>
              <View style={styles.tableEntity}>
                <Image source={index % 2 ? images.electronics : images.giftBox} style={styles.tableThumb} />
                <RText style={styles.tableName}>{row.name}</RText>
              </View>
              <RText style={styles.tableCell}>{row.kind}</RText>
              <View style={[styles.statusBadge, row.status === 'مفعل' ? styles.statusGood : styles.statusWarn]}>
                <RText style={[styles.statusText, row.status === 'مفعل' ? styles.statusTextGood : styles.statusTextWarn]}>
                  {row.status}
                </RText>
              </View>
              <RText style={styles.tableCell}>{row.value}</RText>
              <View style={styles.tableActions}>
                <TouchableOpacity>
                  <AppIcon icon={Icons.Eye} size={16} color={palette.muted} />
                </TouchableOpacity>
                <TouchableOpacity>
                  <AppIcon icon={Icons.Pencil} size={16} color={palette.green} />
                </TouchableOpacity>
                <TouchableOpacity>
                  <AppIcon icon={Icons.Trash2} size={16} color={palette.danger} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function ProductAdminGrid() {
  return (
    <View style={styles.adminProductGrid}>
      {products.slice(0, 6).map((product, index) => (
        <View key={`admin-product-${product.title}`} style={styles.adminProductCard}>
          <Image source={product.image} style={styles.adminProductImage} />
          <View style={styles.adminProductMeta}>
            <RText numberOfLines={1} style={styles.adminProductTitle}>
              {product.title}
            </RText>
            <RText style={styles.tinyMuted}>20 دقيقة</RText>
            <View style={styles.statusBadge}>
              <RText style={styles.statusTextGood}>{index % 2 ? 'منشور' : 'مميز'}</RText>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

function WalletPanel() {
  return (
    <View style={styles.walletGrid}>
      <ChartCard />
      <View style={styles.walletCard}>
        <RText style={styles.adminCardTitle}>إجمالي المحفظة</RText>
        <RText style={styles.walletAmount}>2,334,000 ل.س</RText>
        <View style={styles.walletLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: palette.green }]} />
            <RText style={styles.tinyMuted}>مدفوعات</RText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: palette.amber }]} />
            <RText style={styles.tinyMuted}>معلّق</RText>
          </View>
        </View>
      </View>
    </View>
  );
}

function AdminDashboard() {
  const { width } = useWindowDimensions();
  const compact = width < 900;
  const [active, setActive] = useState('dashboard');

  const tableType = useMemo(() => {
    if (['orders', 'products', 'coupons', 'users', 'reviews', 'wallet'].includes(active)) return active;
    return 'dashboard';
  }, [active]);

  return (
    <View style={[styles.adminShell, compact && styles.adminShellCompact]}>
      <AdminSidebar active={active} onChange={setActive} compact={compact} />
      <View style={styles.adminMain}>
        <AdminTopBar compact={compact} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.adminContent}>
          <View style={styles.statsGrid}>
            <StatCard icon={Icons.Store} value="123" label="متاجر جديدة" />
            <StatCard icon={Icons.Eye} value="432" label="زيارات اليوم" />
            <StatCard icon={Icons.Users} value="12,334" label="عملاء نشطين" tone="amber" delta="+8" />
            <StatCard icon={Icons.Wallet} value="2,334,000" label="المبيعات" />
          </View>
          {active === 'dashboard' ? (
            <>
              <View style={[styles.adminCardsRow, compact && styles.adminCardsColumn]}>
                <View style={styles.ordersMini}>
                  <RText style={styles.adminCardTitle}>آخر الطلبات</RText>
                  {adminRows.slice(0, 3).map((row) => (
                    <View key={`order-${row.name}`} style={styles.miniOrder}>
                      <Image source={images.giftBox} style={styles.miniOrderImg} />
                      <View style={{ flex: 1 }}>
                        <RText style={styles.tableName}>{row.name}</RText>
                        <RText style={styles.tinyMuted}>{row.value}</RText>
                      </View>
                      <View style={styles.statusBadge}>
                        <RText style={styles.statusTextGood}>قيد التسليم</RText>
                      </View>
                    </View>
                  ))}
                </View>
                <ChartCard />
                <PerformanceCard />
              </View>
              <RText style={styles.adminSectionTitle}>منتجات الأكثر مبيعاً</RText>
              <ProductAdminGrid />
            </>
          ) : active === 'wallet' ? (
            <>
              <WalletPanel />
              <AdminTable type="wallet" />
            </>
          ) : active === 'products' || active === 'reels' ? (
            <>
              <ProductAdminGrid />
              <AdminTable type="products" />
            </>
          ) : (
            <AdminTable type={tableType} />
          )}
        </ScrollView>
      </View>
    </View>
  );
}

function ModeSwitch({ mode, setMode }) {
  return (
    <View style={styles.modeSwitch}>
      <TouchableOpacity
        onPress={() => setMode('mobile')}
        style={[styles.modeButton, mode === 'mobile' && styles.modeButtonActive]}
      >
        <AppIcon icon={Icons.Smartphone} size={17} color={mode === 'mobile' ? palette.white : palette.green} />
        <RText style={[styles.modeButtonText, mode === 'mobile' && styles.modeButtonTextActive]}>التطبيق</RText>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setMode('admin')}
        style={[styles.modeButton, mode === 'admin' && styles.modeButtonActive]}
      >
        <AppIcon icon={Icons.LayoutDashboard || Icons.BarChart3} size={17} color={mode === 'admin' ? palette.white : palette.green} />
        <RText style={[styles.modeButtonText, mode === 'admin' && styles.modeButtonTextActive]}>الإدارة</RText>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  const { width } = useWindowDimensions();
  const initialMode =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('mode') || 'mobile'
      : 'mobile';
  const [mode, setMode] = useState(initialMode);

  return (
    <SafeAreaView style={styles.appRoot}>
      <ModeSwitch mode={mode} setMode={setMode} />
      <View style={[styles.workspace, mode === 'admin' && styles.workspaceAdmin]}>
        {mode === 'mobile' ? (
          <View style={[styles.phoneStage, width < 520 && styles.phoneStageSmall]}>
            <PhoneExperience />
          </View>
        ) : (
          <AdminDashboard />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appRoot: {
    flex: 1,
    backgroundColor: palette.panel,
    alignItems: 'center',
  },
  workspace: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  workspaceAdmin: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  phoneStage: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneStageSmall: {
    paddingHorizontal: 0,
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 414,
    height: '100%',
    maxHeight: 896,
    backgroundColor: palette.white,
    overflow: 'hidden',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: '#0D2A22',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  phoneContent: {
    flex: 1,
    backgroundColor: palette.white,
  },
  screenFull: {
    flex: 1,
    backgroundColor: palette.white,
  },
  screenScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  rtlText: {
    writingDirection: 'rtl',
    textAlign: 'right',
    color: palette.ink,
    fontFamily: 'System',
  },
  statusBar: {
    height: 48,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.white,
  },
  statusTime: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0D2542',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  signalBars: {
    height: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  signalBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: '#0D2542',
  },
  wifi: {
    color: '#0D2542',
    fontSize: 18,
    fontWeight: '800',
  },
  battery: {
    width: 24,
    height: 12,
    borderRadius: 3,
    borderWidth: 1.6,
    borderColor: '#0D2542',
    padding: 2,
  },
  batteryFill: {
    flex: 1,
    borderRadius: 2,
    backgroundColor: '#0D2542',
  },
  header: {
    minHeight: 58,
    paddingTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  headerCompact: {
    paddingTop: 0,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  roundIconGhost: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: palette.white,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    minWidth: 72,
  },
  searchWrap: {
    flex: 1,
    minWidth: 0,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: '#F3F4F5',
    paddingHorizontal: 5,
  },
  searchButton: {
    width: 34,
    height: 34,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.green,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 12,
    color: palette.ink,
    writingDirection: 'rtl',
  },
  promoBanner: {
    height: 126,
    marginTop: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: palette.green,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  promoText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  promoTitle: {
    color: palette.white,
    fontSize: 18,
    fontWeight: '900',
  },
  promoBody: {
    color: '#E7FFF7',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  promoButton: {
    marginTop: 10,
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: palette.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  promoButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: palette.greenDark,
  },
  promoImage: {
    width: 118,
    height: 96,
    borderRadius: 8,
    resizeMode: 'cover',
    marginRight: 10,
  },
  categoryStrip: {
    marginTop: 16,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    gap: 8,
  },
  categoryStripDouble: {
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    rowGap: 12,
  },
  categoryItem: {
    width: 56,
    alignItems: 'center',
  },
  categoryImageWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F3F4',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryLabel: {
    marginTop: 6,
    fontSize: 11,
    color: palette.ink,
    textAlign: 'center',
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionName: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '900',
  },
  sectionAction: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.green,
  },
  horizontalCards: {
    flexDirection: 'row-reverse',
    gap: 12,
    paddingHorizontal: 2,
    paddingBottom: 4,
  },
  reelCard: {
    width: 112,
    height: 150,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  reelThumb: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  reelPlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reelCount: {
    color: palette.white,
    fontSize: 10,
    fontWeight: '800',
  },
  reelMeta: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  miniCart: {
    width: 28,
    height: 28,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.white,
  },
  reelTitle: {
    flex: 1,
    color: palette.white,
    fontSize: 11,
    fontWeight: '800',
  },
  couponCard: {
    width: 132,
    height: 96,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  ticketCutLeft: {
    position: 'absolute',
    left: -8,
    top: 34,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: palette.white,
  },
  ticketCutRight: {
    position: 'absolute',
    right: -8,
    top: 34,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: palette.white,
  },
  couponPrice: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '900',
  },
  couponCode: {
    marginTop: 4,
    color: '#E8FFF7',
    fontSize: 10,
    fontWeight: '700',
  },
  copyButton: {
    marginTop: 8,
    width: 74,
    height: 24,
    borderRadius: 12,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyButtonText: {
    color: palette.greenDark,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  couponIndex: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    color: '#FFFFFF80',
    fontSize: 10,
  },
  productGrid: {
    marginTop: 12,
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  productCard: {
    width: '48%',
    backgroundColor: palette.white,
    borderRadius: 8,
    padding: 7,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: '#0F211C',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  productCardCompact: {
    width: 158,
  },
  productImageBox: {
    height: 132,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F2F3F2',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00000055',
  },
  productBadges: {
    position: 'absolute',
    left: 7,
    bottom: 7,
    right: 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingPill: {
    height: 22,
    paddingHorizontal: 7,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#00000066',
  },
  ratingText: {
    color: palette.white,
    fontSize: 10,
    fontWeight: '800',
  },
  deliveryPill: {
    height: 22,
    paddingHorizontal: 7,
    borderRadius: 11,
    justifyContent: 'center',
    backgroundColor: '#00000066',
  },
  deliveryText: {
    color: palette.white,
    fontSize: 9,
    fontWeight: '700',
  },
  productTitle: {
    marginTop: 8,
    minHeight: 38,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',
  },
  storeLine: {
    marginTop: 2,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
  },
  storeAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#CBD3D8',
  },
  storeName: {
    flex: 1,
    color: palette.muted,
    fontSize: 10,
  },
  productPrice: {
    marginTop: 7,
    fontSize: 16,
    color: palette.green,
    fontWeight: '900',
  },
  productCart: {
    marginTop: 6,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.greenSoft,
  },
  detailsContent: {
    paddingBottom: 120,
    backgroundColor: palette.white,
  },
  detailsTopBar: {
    height: 54,
    paddingHorizontal: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailsTopButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.greenSoft,
  },
  detailsHeaderTitle: {
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  detailsImageWrap: {
    height: 330,
    marginHorizontal: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F0F2F2',
  },
  detailsImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  detailsFavorite: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00000055',
  },
  detailsDots: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  detailsDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FFFFFF99',
  },
  detailsDotActive: {
    width: 20,
    height: 7,
    borderRadius: 4,
    backgroundColor: palette.white,
  },
  detailsBody: {
    padding: 16,
  },
  detailsBadgeRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailsDelivery: {
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 15,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
    backgroundColor: palette.greenSoft,
  },
  detailsDeliveryText: {
    color: palette.green,
    fontSize: 11,
    fontWeight: '800',
  },
  detailsRating: {
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.amberSoft,
  },
  detailsRatingText: {
    fontSize: 12,
    fontWeight: '900',
  },
  detailsTitle: {
    alignSelf: 'stretch',
    marginTop: 14,
    fontSize: 21,
    lineHeight: 29,
    fontWeight: '900',
  },
  detailsStoreRow: {
    marginTop: 14,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },
  detailsStoreAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#D8DDDF',
  },
  detailsStoreName: {
    fontSize: 13,
    fontWeight: '900',
  },
  detailsStoreButton: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.green,
    justifyContent: 'center',
  },
  detailsStoreButtonText: {
    color: palette.green,
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
  },
  detailsPrice: {
    marginTop: 18,
    color: palette.green,
    fontSize: 25,
    fontWeight: '900',
  },
  detailsDivider: {
    height: 1,
    marginVertical: 18,
    backgroundColor: palette.border,
  },
  detailsSectionTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  detailsDescription: {
    alignSelf: 'stretch',
    marginTop: 8,
    color: palette.muted,
    fontSize: 13,
    lineHeight: 22,
  },
  detailsQuantityRow: {
    marginTop: 22,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailsQuantity: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  detailsQtyButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.greenSoft,
  },
  detailsQtyValue: {
    minWidth: 22,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  detailsAddButton: {
    marginTop: 24,
    height: 60,
    borderRadius: 8,
    paddingHorizontal: 20,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.green,
  },
  detailsAddText: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '900',
  },
  detailsAddSub: {
    marginTop: 2,
    color: '#DFFFF5',
    fontSize: 11,
  },
  emptyCart: {
    flex: 1,
    paddingHorizontal: 30,
    paddingBottom: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCartIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.greenSoft,
  },
  emptyCartTitle: {
    marginTop: 18,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  emptyCartText: {
    marginTop: 8,
    color: palette.muted,
    fontSize: 13,
    textAlign: 'center',
  },
  emptyCartButton: {
    marginTop: 22,
    height: 46,
    paddingHorizontal: 30,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.green,
  },
  emptyCartButtonText: {
    color: palette.white,
    fontWeight: '900',
    textAlign: 'center',
  },
  cartContent: {
    padding: 16,
    paddingBottom: 120,
  },
  cartHeader: {
    marginBottom: 14,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cartTitle: {
    fontSize: 22,
    fontWeight: '900',
  },
  cartCount: {
    color: palette.muted,
    fontSize: 12,
  },
  cartItem: {
    minHeight: 148,
    marginBottom: 12,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.border,
    flexDirection: 'row-reverse',
    gap: 12,
    backgroundColor: palette.white,
  },
  cartItemImage: {
    width: 112,
    height: 126,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  cartItemBody: {
    flex: 1,
    alignItems: 'flex-end',
  },
  cartItemTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '900',
  },
  cartItemStore: {
    marginTop: 4,
    color: palette.muted,
    fontSize: 10,
  },
  cartItemPrice: {
    marginTop: 10,
    color: palette.green,
    fontSize: 16,
    fontWeight: '900',
  },
  cartItemFooter: {
    width: '100%',
    marginTop: 'auto',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cartQty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  cartQtyButton: {
    width: 27,
    height: 27,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.greenSoft,
  },
  cartQtyValue: {
    minWidth: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  cartRemove: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  cartRemoveText: {
    color: palette.danger,
    fontSize: 11,
    fontWeight: '800',
  },
  cartSummary: {
    marginTop: 8,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F6F8F7',
  },
  cartSummaryTitle: {
    marginBottom: 14,
    fontSize: 16,
    fontWeight: '900',
  },
  cartSummaryLine: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cartSummaryLabel: {
    color: palette.muted,
    fontSize: 13,
  },
  cartSummaryValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  cartSummaryFree: {
    color: palette.green,
    fontSize: 13,
    fontWeight: '900',
  },
  cartSummaryDivider: {
    height: 1,
    marginVertical: 14,
    backgroundColor: palette.border,
  },
  cartTotalLabel: {
    fontSize: 15,
    fontWeight: '900',
  },
  cartTotalValue: {
    color: palette.green,
    fontSize: 19,
    fontWeight: '900',
  },
  checkoutButton: {
    marginTop: 20,
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 18,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: palette.green,
  },
  checkoutText: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
  },
  checkoutContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  detailsTopSpacer: {
    width: 36,
    height: 36,
  },
  checkoutSectionTitle: {
    alignSelf: 'stretch',
    marginTop: 14,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: '900',
  },
  checkoutPanel: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.white,
  },
  paymentOptions: {
    gap: 10,
  },
  paymentOption: {
    minHeight: 72,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.border,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    backgroundColor: palette.white,
  },
  paymentOptionActive: {
    borderColor: palette.green,
    backgroundColor: palette.greenSoft,
  },
  paymentRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#B8C0C5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentRadioActive: {
    borderColor: palette.green,
  },
  paymentRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.green,
  },
  paymentTitle: {
    fontSize: 13,
    fontWeight: '900',
  },
  checkoutSummary: {
    marginTop: 20,
    marginBottom: 8,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F6F8F7',
  },
  successScreen: {
    flex: 1,
    paddingHorizontal: 28,
    paddingBottom: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.green,
  },
  successTitle: {
    marginTop: 22,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  successText: {
    maxWidth: 300,
    marginTop: 9,
    color: palette.muted,
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'center',
  },
  successOrderNumber: {
    width: '100%',
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: palette.greenSoft,
  },
  successNumber: {
    marginTop: 5,
    color: palette.greenDark,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  successButton: {
    marginTop: 24,
    height: 48,
    paddingHorizontal: 28,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.green,
  },
  successButtonText: {
    color: palette.white,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  offerBand: {
    marginTop: 18,
    flexDirection: 'row-reverse',
    gap: 10,
  },
  offerCard: {
    flex: 1,
    height: 94,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFEFE2',
    backgroundColor: palette.greenSoft,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  offerCardAmber: {
    backgroundColor: palette.amberSoft,
    borderColor: '#F8DE9D',
  },
  offerImage: {
    width: 62,
    height: '100%',
    resizeMode: 'cover',
  },
  offerText: {
    flex: 1,
    padding: 9,
    alignItems: 'flex-end',
  },
  offerTitle: {
    color: palette.green,
    fontWeight: '900',
    fontSize: 13,
  },
  offerSub: {
    marginTop: 2,
    color: palette.muted,
    fontSize: 9,
  },
  offerButton: {
    marginTop: 8,
    height: 24,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: palette.green,
    justifyContent: 'center',
  },
  offerButtonAmber: {
    backgroundColor: palette.amber,
  },
  offerButtonText: {
    color: palette.white,
    fontSize: 10,
    fontWeight: '800',
  },
  tabs: {
    flexDirection: 'row-reverse',
    gap: 12,
    paddingTop: 14,
    paddingBottom: 8,
  },
  tabsCompact: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 8,
  },
  tabItem: {
    minHeight: 34,
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: palette.ink,
  },
  tabText: {
    color: palette.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  tabTextActive: {
    color: palette.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  storeInner: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  storeTopActions: {
    marginTop: 8,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storeScreenTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '800',
  },
  greenTiny: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: palette.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeHero: {
    width: '100%',
    height: 108,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  storeStats: {
    marginTop: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.border,
    flexDirection: 'row-reverse',
    overflow: 'hidden',
  },
  metric: {
    flex: 1,
    minHeight: 76,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: palette.border,
  },
  metricLabel: {
    marginTop: 5,
    color: palette.muted,
    fontSize: 9,
    textAlign: 'center',
  },
  metricValue: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
  storeRatingCard: {
    marginTop: 18,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.border,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 16,
  },
  ratingScoreBox: {
    width: 82,
    alignItems: 'center',
  },
  bigRating: {
    fontSize: 36,
    fontWeight: '900',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  tinyMuted: {
    color: palette.muted,
    fontSize: 11,
  },
  ratingBars: {
    flex: 1,
    gap: 7,
  },
  ratingBarLine: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  ratingLabel: {
    width: 42,
    color: palette.muted,
    fontSize: 10,
  },
  ratingTrack: {
    flex: 1,
    height: 6,
    borderRadius: 4,
    backgroundColor: '#EDF0F1',
    overflow: 'hidden',
  },
  ratingFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: palette.green,
  },
  storeCardGrid: {
    marginTop: 12,
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  storeMiniCard: {
    width: '48%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 8,
  },
  storeMiniImage: {
    width: '100%',
    height: 82,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  storeMiniTitle: {
    marginTop: 7,
    fontWeight: '900',
    fontSize: 13,
  },
  storeMiniSub: {
    color: palette.muted,
    fontSize: 10,
  },
  storeMiniRating: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 3,
  },
  storeMiniRatingText: {
    fontSize: 10,
    color: palette.muted,
  },
  visitButton: {
    marginTop: 8,
    height: 30,
    borderRadius: 15,
    backgroundColor: palette.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visitText: {
    color: palette.white,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  rateButton: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    backgroundColor: palette.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rateButtonText: {
    color: palette.white,
    fontWeight: '900',
    textAlign: 'center',
  },
  commentHeader: {
    marginTop: 16,
    marginBottom: 6,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentCard: {
    minHeight: 92,
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 12,
    flexDirection: 'row-reverse',
    gap: 10,
    alignItems: 'center',
  },
  commentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E7EAED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentContent: {
    flex: 1,
    alignItems: 'flex-end',
  },
  commentName: {
    fontWeight: '900',
  },
  commentText: {
    marginTop: 6,
    fontSize: 12,
    color: palette.ink,
  },
  commentDate: {
    alignSelf: 'flex-start',
    color: palette.muted,
    fontSize: 10,
  },
  rateScreen: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  reviewStoreHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  storeAvatarLarge: {
    width: 76,
    height: 76,
    borderRadius: 8,
    backgroundColor: '#F0F1F2',
  },
  reviewStoreName: {
    fontSize: 17,
    fontWeight: '900',
  },
  categoryChipText: {
    alignSelf: 'flex-end',
    marginTop: 5,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: palette.greenSoft,
    color: palette.green,
    fontSize: 10,
    fontWeight: '800',
  },
  locationLine: {
    marginTop: 8,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  rateQuestion: {
    marginTop: 24,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  rateStars: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  rateWord: {
    marginTop: 8,
    color: palette.green,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
  commentBox: {
    marginTop: 16,
    minHeight: 92,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 14,
    color: palette.ink,
    textAlignVertical: 'top',
  },
  uploadRow: {
    marginTop: 14,
    flexDirection: 'row-reverse',
    gap: 10,
  },
  uploadBox: {
    flex: 1,
    height: 86,
    borderRadius: 8,
    backgroundColor: '#F0F1F1',
  },
  uploadDashed: {
    flex: 1,
    height: 86,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#AAB3BA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    marginTop: 6,
    color: palette.muted,
    fontSize: 11,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: 'auto',
    marginBottom: 24,
    height: 50,
    borderRadius: 8,
    backgroundColor: palette.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  reelsScreen: {
    flex: 1,
    minHeight: 760,
    backgroundColor: '#051B20',
  },
  reelsBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  reelsOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 18,
    paddingBottom: 18,
  },
  reelsTopButtons: {
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reelsLeftButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  reelsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reelsCartSheet: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: palette.white,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetPrice: {
    color: palette.green,
    fontSize: 18,
    fontWeight: '900',
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  qtyLabel: {
    fontSize: 12,
    color: palette.ink,
  },
  addToCartButton: {
    marginTop: 16,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  addToCartText: {
    color: palette.white,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  authTabs: {
    marginTop: 18,
    alignSelf: 'center',
    flexDirection: 'row-reverse',
    borderRadius: 20,
    backgroundColor: '#F2F4F4',
    padding: 4,
  },
  authTab: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 16,
    justifyContent: 'center',
  },
  authTabActive: {
    backgroundColor: palette.green,
  },
  authTabText: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  authTabTextActive: {
    color: palette.white,
  },
  authTitle: {
    marginTop: 36,
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '900',
  },
  authFieldBlock: {
    flex: 1,
    marginBottom: 14,
  },
  authLabel: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '700',
  },
  authInputShell: {
    height: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
  },
  authInput: {
    flex: 1,
    color: palette.ink,
    writingDirection: 'rtl',
  },
  twoColumns: {
    flexDirection: 'row-reverse',
    gap: 12,
  },
  authInline: {
    marginBottom: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rememberRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
  },
  checkbox: {
    width: 12,
    height: 12,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: palette.green,
  },
  linkText: {
    color: palette.green,
    fontWeight: '800',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  authPrimary: {
    height: 52,
    borderRadius: 8,
    backgroundColor: palette.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authPrimaryText: {
    color: palette.white,
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
  },
  authQuestion: {
    marginTop: 18,
    color: palette.ink,
    textAlign: 'center',
    fontSize: 13,
  },
  authQuestionRow: {
    marginTop: 14,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    gap: 6,
  },
  termsRow: {
    marginBottom: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  dividerRow: {
    marginVertical: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: palette.border,
  },
  googleButton: {
    height: 54,
    borderRadius: 8,
    backgroundColor: '#F2F2F2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  googleText: {
    fontSize: 14,
    color: palette.ink,
    textAlign: 'center',
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 82,
    backgroundColor: palette.white,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  bottomItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
  bottomCenter: {
    transform: [{ translateY: -16 }],
  },
  navIconWrap: {
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -11,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.amber,
    borderWidth: 2,
    borderColor: palette.white,
  },
  cartBadgeText: {
    color: palette.white,
    fontSize: 9,
    fontWeight: '900',
    textAlign: 'center',
  },
  navIconActive: {},
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.white,
    borderWidth: 8,
    borderColor: '#E5F8F2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F211C',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  bottomLabel: {
    marginTop: 4,
    color: palette.muted,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  bottomLabelActive: {
    color: palette.ink,
    fontWeight: '900',
  },
  toast: {
    position: 'absolute',
    left: 44,
    right: 44,
    bottom: 92,
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: palette.greenDark,
    shadowColor: '#071E18',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    zIndex: 20,
  },
  toastText: {
    color: palette.white,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  modeSwitch: {
    marginTop: 12,
    marginBottom: 10,
    height: 42,
    borderRadius: 22,
    padding: 4,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.border,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  modeButton: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 18,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  modeButtonActive: {
    backgroundColor: palette.green,
  },
  modeButtonText: {
    color: palette.green,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
  modeButtonTextActive: {
    color: palette.white,
  },
  adminShell: {
    flex: 1,
    width: '100%',
    flexDirection: 'row-reverse',
    backgroundColor: '#F2F3F1',
  },
  adminShellCompact: {
    flexDirection: 'column',
  },
  adminSidebar: {
    width: 238,
    backgroundColor: palette.greenDark,
    paddingVertical: 26,
    paddingHorizontal: 16,
  },
  adminLogo: {
    color: palette.white,
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 28,
  },
  sidebarItem: {
    height: 42,
    borderRadius: 8,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 10,
    marginBottom: 8,
  },
  sidebarItemActive: {
    backgroundColor: '#FFFFFF24',
  },
  sidebarText: {
    color: palette.white,
    fontSize: 13,
    fontWeight: '700',
  },
  supportLine: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#FFFFFF24',
    paddingTop: 18,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },
  adminChipNav: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row-reverse',
    gap: 8,
    backgroundColor: palette.white,
  },
  adminChip: {
    height: 34,
    borderRadius: 18,
    paddingHorizontal: 12,
    backgroundColor: '#EDF1F0',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  adminChipActive: {
    backgroundColor: palette.green,
  },
  adminChipText: {
    fontSize: 12,
    color: palette.greenDark,
    fontWeight: '800',
  },
  adminChipTextActive: {
    color: palette.white,
  },
  adminMain: {
    flex: 1,
  },
  adminTopBar: {
    height: 74,
    paddingHorizontal: 24,
    backgroundColor: palette.white,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 16,
  },
  adminTopBarCompact: {
    paddingHorizontal: 12,
    gap: 8,
  },
  adminUser: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },
  adminAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#C8D2D6',
  },
  adminUserName: {
    fontSize: 13,
    fontWeight: '900',
  },
  adminSearch: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F2F4F4',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
  },
  adminSearchInput: {
    flex: 1,
    color: palette.ink,
    writingDirection: 'rtl',
    fontSize: 13,
  },
  adminNotify: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.greenSoft,
  },
  adminContent: {
    padding: 24,
    paddingBottom: 40,
  },
  statsGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 14,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: 180,
    minHeight: 108,
    borderRadius: 8,
    padding: 16,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.border,
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  statValue: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: '900',
  },
  statLabel: {
    marginTop: 2,
    color: palette.muted,
    fontSize: 12,
  },
  statDelta: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    fontWeight: '900',
    fontSize: 13,
  },
  adminCardsRow: {
    marginTop: 18,
    flexDirection: 'row-reverse',
    gap: 14,
  },
  adminCardsColumn: {
    flexDirection: 'column',
  },
  ordersMini: {
    flex: 1,
    minWidth: 260,
    borderRadius: 8,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
  },
  miniOrder: {
    marginTop: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },
  miniOrderImg: {
    width: 44,
    height: 44,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  chartCard: {
    flex: 1.5,
    minWidth: 300,
    borderRadius: 8,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adminCardTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  adminCardValue: {
    color: palette.green,
    fontWeight: '900',
  },
  chartArea: {
    height: 150,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  chartColumn: {
    width: 22,
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    gap: 3,
  },
  chartBar: {
    width: 8,
    borderRadius: 4,
    backgroundColor: palette.green,
  },
  chartBarSoft: {
    width: 8,
    borderRadius: 4,
    backgroundColor: '#BFE9DF',
  },
  performanceCard: {
    width: 240,
    borderRadius: 8,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
    alignItems: 'center',
  },
  donutWrap: {
    marginTop: 12,
    alignItems: 'center',
  },
  donutOuter: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 12,
    borderColor: palette.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.white,
  },
  donutPercent: {
    color: palette.green,
    fontWeight: '900',
  },
  secondaryButton: {
    marginTop: 12,
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: palette.border,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: palette.green,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  adminSectionTitle: {
    marginTop: 24,
    marginBottom: 12,
    fontSize: 17,
    fontWeight: '900',
  },
  adminProductGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 14,
  },
  adminProductCard: {
    flexBasis: 170,
    flexGrow: 1,
    maxWidth: 230,
    borderRadius: 8,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.border,
    overflow: 'hidden',
  },
  adminProductImage: {
    height: 120,
    width: '100%',
    resizeMode: 'cover',
  },
  adminProductMeta: {
    padding: 10,
    alignItems: 'flex-end',
  },
  adminProductTitle: {
    fontSize: 13,
    fontWeight: '900',
  },
  tableCard: {
    marginTop: 18,
    borderRadius: 8,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
  },
  tableTools: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  adminPrimary: {
    height: 36,
    borderRadius: 18,
    paddingHorizontal: 14,
    backgroundColor: palette.green,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  adminPrimaryText: {
    color: palette.white,
    fontWeight: '900',
    fontSize: 12,
  },
  filterButton: {
    height: 36,
    borderRadius: 18,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: palette.border,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  filterText: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  table: {
    minWidth: 760,
  },
  tableHeader: {
    height: 42,
    borderRadius: 8,
    backgroundColor: '#F4F6F6',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  tableHeaderText: {
    flex: 1,
    color: palette.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  tableRow: {
    minHeight: 62,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  tableEntity: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  tableThumb: {
    width: 36,
    height: 36,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  tableName: {
    fontSize: 12,
    fontWeight: '900',
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    color: palette.ink,
  },
  statusBadge: {
    minWidth: 74,
    minHeight: 24,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: palette.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusGood: {
    backgroundColor: palette.greenSoft,
  },
  statusWarn: {
    backgroundColor: palette.amberSoft,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
  },
  statusTextGood: {
    color: palette.green,
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
  },
  statusTextWarn: {
    color: '#AA790F',
  },
  tableActions: {
    flex: 1,
    flexDirection: 'row-reverse',
    gap: 14,
    justifyContent: 'flex-start',
  },
  walletGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 14,
  },
  walletCard: {
    flex: 1,
    minWidth: 260,
    borderRadius: 8,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
  },
  walletAmount: {
    marginTop: 26,
    color: palette.green,
    fontSize: 28,
    fontWeight: '900',
  },
  walletLegend: {
    marginTop: 22,
    flexDirection: 'row-reverse',
    gap: 18,
  },
  legendItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
