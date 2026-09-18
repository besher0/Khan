import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import * as Icons from '../../../../icons';
import { catalogApi, reviewsApi, uploadsApi } from '../../../services/api';
import { styles } from '../theme/styles';
import {
  AppIcon,
  CouponCard,
  ProductCard,
  RText,
  RtlHorizontalScroll,
  SectionTitle,
  StoreCard,
  StoreHeaderSearch,
  StarsRow,
  formatReviewDate,
  normalizeProduct,
  normalizeStore,
  palette,
  reviewSummaryOf,
} from '../shared/marketplaceShared';
import { DataNotice, listOrEmpty, ScreenScroll, useMarketplaceLayout } from './screenShared.jsx';

const REVIEW_SORTS = [
  { key: 'latest', label: 'الأحدث' },
  { key: 'oldest', label: 'الأقدم' },
  { key: 'highest', label: 'الأعلى تقييماً' },
  { key: 'lowest', label: 'الأقل تقييماً' },
];

const ALL_PRODUCTS_TAB = 'كل المنتجات';

/* ------------------------------ All stores ------------------------------ */

export function AllStoresScreen({
  catalog,
  stores,
  loading,
  error,
  onRetry,
  onBack,
  onOpenStore,
  onCopyCoupon,
  session,
  onOpenSavedStores,
}) {
  const [query, setQuery] = useState('');
  const categories = listOrEmpty(catalog?.categories);
  const coupons = listOrEmpty(catalog?.coupons);
  const { productCardStyle, collectionCardStyle } = useMarketplaceLayout();
  const [activeTab, setActiveTab] = useState('الكل');

  const tabs = ['الكل', ...categories.map((category) => category.label).filter(Boolean)];
  const filteredStores = stores.filter((store) => {
    if (!query.trim()) return activeTab === 'الكل' || store.raw?.categories?.some((category) => category.name === activeTab);
    const needle = query.trim().toLowerCase();
    return (
      store.name.toLowerCase().includes(needle) ||
      (store.description || '').toLowerCase().includes(needle)
    );
  });

  return (
    <ScreenScroll>
      <StoreHeaderSearch title="المتاجر" query={query} onQueryChange={setQuery} onSubmit={() => {}} onBack={onBack} />
      <DataNotice loading={loading} error={error} onRetry={onRetry} />

      {coupons.length ? (
        <>
          <SectionTitle title="كوبونات المتاجر" icon={Icons.Ticket || Icons.Tag} />
          <RtlHorizontalScroll refreshKey={`stores-coupons-${coupons.length}`} contentContainerStyle={styles.horizontalCards}>
            {coupons.slice(0, 8).map((coupon, index) => (
              <CouponCard key={`store-coupon-${coupon.id || index}`} coupon={coupon} index={index} onCopy={onCopyCoupon} />
            ))}
          </RtlHorizontalScroll>
        </>
      ) : null}

      {session ? (
        <TouchableOpacity style={styles.storeRatingButton} onPress={onOpenSavedStores} activeOpacity={0.85}>
          <AppIcon icon={Icons.Tag} size={14} color={palette.white} />
          <RText style={styles.storeRatingButtonText}>المتاجر المحفوظة</RText>
        </TouchableOpacity>
      ) : null}

      {tabs.length > 1 ? (
        <RtlHorizontalScroll refreshKey={`stores-tabs-${tabs.length}`} contentContainerStyle={styles.tabs}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={`store-tab-${tab}`}
              style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
              onPress={() => setActiveTab(tab)}
            >
              <RText style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</RText>
            </TouchableOpacity>
          ))}
        </RtlHorizontalScroll>
      ) : null}

      <View style={styles.storeCardGrid}>
        {filteredStores.map((store, index) => (
          <StoreCard
            key={`store-card-${store.id}`}
            store={store}
            index={index}
            style={collectionCardStyle || productCardStyle}
            onPress={onOpenStore}
          />
        ))}
      </View>
      {!loading && !filteredStores.length ? (
        <RText style={styles.collectionEmpty}>لا توجد متاجر مطابقة.</RText>
      ) : null}
    </ScreenScroll>
  );
}

/* ---------------------------- Store details ----------------------------- */

export function StoreDetailsScreen({
  storeId,
  catalog,
  savedStoreIds,
  onToggleSave,
  onOpenProduct,
  onAddToCart,
  onToggleFavorite,
  favorites,
  onShowAll,
  onOpenReviews,
  onBack,
  onCopyCoupon,
}) {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(ALL_PRODUCTS_TAB);
  const { productCardStyle } = useMarketplaceLayout();
  const isSaved = savedStoreIds.includes(storeId);

  const loadStore = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    setError('');
    try {
      const [storeResponse, productsResponse] = await Promise.all([
        catalogApi.store(storeId),
        catalogApi.storeProducts(storeId, { take: 60 }),
      ]);
      setStore(normalizeStore(storeResponse));
      setProducts((productsResponse?.items || []).map(normalizeProduct).filter(Boolean));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    loadStore();
  }, [loadStore]);

  const categoryTabs = useMemo(() => {
    const labels = (store?.categories || []).map((category) => category.label).filter(Boolean);
    return [ALL_PRODUCTS_TAB, ...labels];
  }, [store]);

  const filteredProducts = products.filter((product) => {
    if (activeCategory === ALL_PRODUCTS_TAB) return true;
    return product.category === activeCategory;
  });

  if (loading && !store) {
    return (
      <ScreenScroll>
        <StoreHeaderSearch onBack={onBack} query="" onQueryChange={() => {}} onSubmit={() => {}} />
        <DataNotice loading />
      </ScreenScroll>
    );
  }

  if (error && !store) {
    return (
      <ScreenScroll>
        <StoreHeaderSearch onBack={onBack} query="" onQueryChange={() => {}} onSubmit={() => {}} />
        <DataNotice error={error} onRetry={loadStore} />
      </ScreenScroll>
    );
  }

  if (!store) {
    return (
      <ScreenScroll>
        <StoreHeaderSearch onBack={onBack} query="" onQueryChange={() => {}} onSubmit={() => {}} />
        <RText style={styles.collectionEmpty}>تعذر العثور على المتجر.</RText>
      </ScreenScroll>
    );
  }

  const workingHours = store.openingTime && store.closingTime ? `${store.openingTime} - ${store.closingTime}` : 'متاح دائماً';

  return (
    <ScreenScroll>
      <StoreHeaderSearch title={store.name} query="" onQueryChange={() => {}} onSubmit={() => {}} onBack={onBack} />

      <View style={[styles.storeBanner, styles.storeBannerWide]}>
        {store.banner || store.logo ? (
          <Image source={store.banner || store.logo} style={styles.storeBannerImage} />
        ) : null}
        <View style={styles.storeBannerOverlay} />
        <TouchableOpacity
          style={[styles.storeBannerTag, isSaved && styles.storeBannerTagSaved]}
          onPress={() => onToggleSave?.(storeId)}
          activeOpacity={0.85}
        >
          <AppIcon icon={Icons.Tag} size={14} color={isSaved ? palette.white : palette.greenDark} strokeWidth={2.4} />
          <RText style={[styles.storeBannerTagText, isSaved && styles.storeBannerTagTextSaved]}>
            {isSaved ? 'محفوظ' : 'حفظ المتجر'}
          </RText>
        </TouchableOpacity>
        <RText style={styles.storeBannerTitle}>{store.name}</RText>
        <RText style={styles.storeBannerSub}>
          {store.description || `${store.productCount} منتج متاح`}
        </RText>
      </View>

      <View style={styles.storeInfoCard}>
        <View style={styles.storeInfoGrid}>
          <View style={styles.storeInfoCell}>
            <AppIcon icon={Icons.Star} size={17} color={palette.amber} fill={palette.amber} strokeWidth={1.6} />
            <RText style={styles.storeInfoValue}>{Number(store.rating || 0).toFixed(1)}</RText>
            <RText style={styles.storeInfoLabel}>{store.ratingCount} تقييم</RText>
          </View>
          <View style={styles.storeInfoCell}>
            <AppIcon icon={Icons.Package} size={17} color={palette.green} />
            <RText style={styles.storeInfoValue}>{store.productCount}</RText>
            <RText style={styles.storeInfoLabel}>منتج</RText>
          </View>
          <View style={styles.storeInfoCell}>
            <AppIcon icon={Icons.Clock3} size={17} color={palette.green} />
            <RText style={styles.storeInfoValue}>{workingHours}</RText>
            <RText style={styles.storeInfoLabel}>أوقات العمل</RText>
          </View>
        </View>
      </View>

      {store.coupons.length ? (
        <>
          <SectionTitle title="كوبونات المتجر" icon={Icons.Ticket || Icons.Tag} />
          <RtlHorizontalScroll refreshKey={`store-details-coupons-${store.coupons.length}`} contentContainerStyle={styles.horizontalCards}>
            {store.coupons.map((coupon, index) => (
              <CouponCard key={`store-details-coupon-${coupon.id || index}`} coupon={coupon} index={index} onCopy={onCopyCoupon} />
            ))}
          </RtlHorizontalScroll>
        </>
      ) : null}

      <View style={styles.storeRatingCard}>
        <View style={styles.storeRatingScoreWrap}>
          <RText style={styles.storeRatingScore}>{Number(store.rating || 0).toFixed(1)}</RText>
          <StarsRow value={store.rating} size={11} />
          <RText style={styles.tinyMuted}>{store.ratingCount} تقييم</RText>
        </View>
        <View style={styles.storeRatingMeta}>
          <RText style={styles.storeRatingTitle}>تقييمات المتجر</RText>
          <RText style={styles.tinyMuted}>اقرأ تجارب العملاء مع هذا المتجر</RText>
          <TouchableOpacity style={styles.storeRatingButton} onPress={onOpenReviews} activeOpacity={0.85}>
            <RText style={styles.storeRatingButtonText}>عرض التقييمات</RText>
          </TouchableOpacity>
        </View>
      </View>

      <SectionTitle title="منتجات المتجر" icon={Icons.Package} onAction={() => onShowAll?.('recommended')} />
      {categoryTabs.length > 1 ? (
        <RtlHorizontalScroll refreshKey={`store-products-tabs-${categoryTabs.length}`} contentContainerStyle={styles.tabs}>
          {categoryTabs.map((tab) => (
            <TouchableOpacity
              key={`store-product-tab-${tab}`}
              style={[styles.tabItem, activeCategory === tab && styles.tabItemActive]}
              onPress={() => setActiveCategory(tab)}
            >
              <RText style={[styles.tabText, activeCategory === tab && styles.tabTextActive]}>{tab}</RText>
            </TouchableOpacity>
          ))}
        </RtlHorizontalScroll>
      ) : null}
      <View style={styles.productGrid}>
        {filteredProducts.map((product) => (
          <ProductCard
            key={`store-product-${product.id || product.title}`}
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
      {!filteredProducts.length ? (
        <RText style={styles.collectionEmpty}>لا توجد منتجات في هذا القسم.</RText>
      ) : null}
      <View style={{ height: 12 }} />
    </ScreenScroll>
  );
}

/* ---------------------------- Store reviews ----------------------------- */

export function StoreReviewsScreen({
  storeId,
  store,
  onSubmitRate,
  onBack,
}) {
  const [sort, setSort] = useState('latest');
  const [reloadKey, setReloadKey] = useState(0);
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!storeId) return;
      setLoading(true);
      setError('');
      try {
        const response = await reviewsApi.store(storeId, sort);
        if (!cancelled) setPayload(response);
      } catch (loadError) {
        if (!cancelled) setError(loadError.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [storeId, sort, reloadKey]);

  const summary = reviewSummaryOf(payload);
  const total = summary.total || 1;

  return (
    <ScreenScroll>
      <StoreHeaderSearch title="تقييمات المتجر" query="" onQueryChange={() => {}} onSubmit={() => {}} onBack={onBack} />

      <View style={styles.reviewSummaryCard}>
        <View style={styles.reviewSummaryScoreWrap}>
          <RText style={styles.reviewSummaryScore}>{summary.average.toFixed(1)}</RText>
          <StarsRow value={summary.average} size={13} />
          <RText style={styles.reviewSummaryCount}>{summary.total} تقييم</RText>
        </View>
        <View style={styles.reviewBars}>
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = summary.distribution[stars] || 0;
            return (
              <View key={`dist-${stars}`} style={styles.reviewBarLine}>
                <RText style={styles.reviewBarCount}>{count}</RText>
                <View style={styles.reviewBarTrack}>
                  <View style={[styles.reviewBarFill, { width: `${Math.round((count / total) * 100)}%` }]} />
                </View>
                <RText style={styles.reviewBarLabel}>{stars} نجوم</RText>
              </View>
            );
          })}
        </View>
      </View>

      <TouchableOpacity style={styles.rateStoreButton} onPress={onSubmitRate} activeOpacity={0.85}>
        <AppIcon icon={Icons.Star} size={16} color={palette.white} fill={palette.white} strokeWidth={1.6} />
        <RText style={styles.rateStoreButtonText}>قيم هذا المتجر</RText>
      </TouchableOpacity>

      <View style={styles.sortRow}>
        <RText style={styles.sortRowLabel}>ترتيب حسب:</RText>
        {REVIEW_SORTS.map((option) => (
          <TouchableOpacity
            key={`sort-${option.key}`}
            style={[styles.sortChip, sort === option.key && styles.sortChipActive]}
            onPress={() => setSort(option.key)}
          >
            <RText style={[styles.sortChipText, sort === option.key && styles.sortChipTextActive]}>{option.label}</RText>
          </TouchableOpacity>
        ))}
      </View>

      <DataNotice loading={loading} error={error} onRetry={() => setReloadKey((current) => current + 1)} />

      {!loading && !summary.items.length ? (
        <RText style={styles.collectionEmpty}>لا توجد تقييمات منشورة بعد لهذا المتجر.</RText>
      ) : null}

      {summary.items.map((review) => (
        <View key={`store-review-${review.id}`} style={styles.reviewCard}>
          <View style={styles.reviewCardHeader}>
            <View style={styles.reviewAvatar}>
              <AppIcon icon={Icons.User} size={20} color={palette.green} />
            </View>
            <View style={styles.reviewHeaderTexts}>
              <RText style={styles.reviewName}>{review.userName}</RText>
              <StarsRow value={review.rating} size={11} />
            </View>
            <RText style={styles.commentDate}>{formatReviewDate(review.createdAt)}</RText>
          </View>
          {review.comment ? <RText style={styles.commentText}>{review.comment}</RText> : null}
          {review.images.length ? (
            <View style={styles.reviewImagesRow}>
              {review.images.map((image, index) => (
                <Image key={`store-review-image-${review.id}-${index}`} source={image} style={styles.reviewImage} />
              ))}
            </View>
          ) : null}
        </View>
      ))}
      <View style={{ height: 12 }} />
    </ScreenScroll>
  );
}

/* ------------------------------ Rate store ------------------------------ */

export function RateStoreScreen({
  store,
  submitting,
  onSubmit,
  onBack,
  onLogin,
  session,
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [eligibility, setEligibility] = useState(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(true);
  const [eligibilityError, setEligibilityError] = useState('');
  const ratingWords = { 1: 'سيئة', 2: 'مقبولة', 3: 'جيدة', 4: 'جيدة جداً', 5: 'ممتازة' };
  const storeId = store?.id;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!session || !storeId) {
        setEligibility(null);
        setEligibilityLoading(false);
        return;
      }
      setEligibilityLoading(true);
      setEligibilityError('');
      try {
        const response = await reviewsApi.storeEligibility(storeId);
        if (!cancelled) setEligibility(response);
      } catch (loadError) {
        if (!cancelled) setEligibilityError(loadError.message);
      } finally {
        if (!cancelled) setEligibilityLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [storeId, session]);

  const pickImage = () => {
    if (uploading || images.length >= 3) return;
    if (typeof document === 'undefined') {
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const uploaded = await uploadsApi.file(file, 'customer');
        setImages((current) => [...current, uploaded.url].slice(0, 3));
      } catch {
        // surfaced through disabled state; keep silent like other upload paths
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  const orderId = eligibility?.order?.id || null;
  const eligible = Boolean(eligibility?.eligible) && !eligibility?.alreadyReviewed;

  const renderBody = () => {
    if (!session) {
      return (
        <View style={styles.rateNotice}>
          <AppIcon icon={Icons.Lock} size={20} color="#8A5A00" />
          <RText style={styles.rateNoticeText}>سجل دخولك لتتمكن من تقييم هذا المتجر.</RText>
          <TouchableOpacity style={styles.rateLoginButton} onPress={onLogin} activeOpacity={0.85}>
            <RText style={styles.rateLoginButtonText}>تسجيل الدخول</RText>
          </TouchableOpacity>
        </View>
      );
    }
    if (eligibilityLoading) {
      return <DataNotice loading />;
    }
    if (eligibilityError) {
      return <DataNotice error={eligibilityError} onRetry={() => setEligibilityLoading(true)} />;
    }
    if (!eligible) {
      return (
        <View style={styles.rateNotice}>
          <AppIcon icon={Icons.CircleAlert} size={20} color="#8A5A00" />
          <RText style={styles.rateNoticeText}>
            {eligibility?.alreadyReviewed
              ? 'قيّمت هذا المتجر من طلبك الأخير، شكرًا لمشاركتك!'
              : 'يمكنك تقييم المتجر بعد استلام طلب من هذا المتجر. اطلب ثم أكّد الاستلام ليظهر خيار التقييم.'}
          </RText>
        </View>
      );
    }
    return (
      <>
        <View style={styles.rateSummaryCard}>
          <View style={styles.rateSummaryAvatar}>
            {store?.logo || store?.banner ? (
              <Image source={store.logo || store.banner} style={styles.rateSummaryImage} />
            ) : (
              <AppIcon icon={Icons.Store || Icons.ShoppingBag} size={24} color={palette.green} />
            )}
          </View>
          <View style={styles.rateSummaryTexts}>
            <RText style={styles.rateSummaryName}>{store?.name || 'المتجر'}</RText>
            <RText style={styles.tinyMuted}>شاركنا تجربتك مع هذا المتجر</RText>
          </View>
        </View>

        <RText style={styles.rateQuestion}>كيف كانت تجربتك في المتجر؟</RText>
        <View style={styles.rateStarsSelector}>
          {[1, 2, 3, 4, 5].map((value) => (
            <TouchableOpacity key={`rate-star-${value}`} onPress={() => setRating(value)} activeOpacity={0.7}>
              <AppIcon
                icon={Icons.Star}
                size={38}
                color={value <= rating ? palette.amber : '#D6DBDF'}
                fill={value <= rating ? palette.amber : 'transparent'}
                strokeWidth={1.6}
              />
            </TouchableOpacity>
          ))}
        </View>
        <RText style={styles.rateHint}>{ratingWords[rating]}</RText>

        <RText style={styles.deliveredNoteLabel}>اكتب تعليقك (اختياري)</RText>
        <TextInput
          style={styles.commentBox}
          value={comment}
          onChangeText={setComment}
          placeholder="اكتب تعليقك (اختياري)"
          placeholderTextColor="#A7AFB7"
          multiline
          textAlign="right"
          textAlignVertical="top"
        />

        <RText style={styles.deliveredNoteLabel}>أضف صورة من تجربتك (اختياري)</RText>
        <View style={styles.rateUploadRow}>
          {images.map((url, index) => (
            <View key={`rate-upload-${url}-${index}`} style={styles.rateUploadThumbWrap}>
              <Image source={{ uri: url }} style={styles.rateUploadThumb} />
              <TouchableOpacity
                style={styles.rateUploadRemove}
                onPress={() => setImages((current) => current.filter((item, itemIndex) => itemIndex !== index))}
              >
                <AppIcon icon={Icons.X} size={11} color={palette.white} strokeWidth={3} />
              </TouchableOpacity>
            </View>
          ))}
          {images.length < 3 ? (
            <TouchableOpacity style={styles.rateUploadAdd} onPress={pickImage} activeOpacity={0.8}>
              <AppIcon icon={uploading ? Icons.Loader : Icons.Camera} size={20} color={palette.muted} />
              <RText style={styles.rateUploadAddText}>{uploading ? 'جارٍ الرفع...' : 'إضافة صورة'}</RText>
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.rateSubmitFixed, submitting && styles.trackConfirmDisabled]}
          disabled={submitting}
          onPress={() => onSubmit?.({ orderId, rating, comment: comment.trim() || undefined, imageUrls: images })}
          activeOpacity={0.85}
        >
          <RText style={styles.submitText}>{submitting ? 'جارٍ الإرسال...' : 'إرسال التقييم'}</RText>
        </TouchableOpacity>
        <View style={{ height: 16 }} />
      </>
    );
  };

  return (
    <ScreenScroll>
      <StoreHeaderSearch title="تقييم المتجر" query="" onQueryChange={() => {}} onSubmit={() => {}} onBack={onBack} />
      {renderBody()}
    </ScreenScroll>
  );
}

/* ---------------------------- Saved stores ------------------------------ */

export function SavedStoresScreen({
  savedStores,
  loading,
  error,
  onRetry,
  onOpenStore,
  onRemove,
  onBack,
  onOpenAllStores,
}) {
  const { productCardStyle, collectionCardStyle } = useMarketplaceLayout();

  return (
    <ScreenScroll>
      <StoreHeaderSearch title="المتاجر المحفوظة" query="" onQueryChange={() => {}} onSubmit={() => {}} onBack={onBack} />
      <DataNotice loading={loading} error={error} onRetry={onRetry} />

      {savedStores.length ? (
        <View style={styles.storeCardGrid}>
          {savedStores.map((store, index) => (
            <StoreCard
              key={`saved-store-${store.id}`}
              store={store}
              index={index}
              style={collectionCardStyle || productCardStyle}
              onPress={onOpenStore}
            />
          ))}
        </View>
      ) : (
        <>
          <RText style={styles.collectionEmpty}>لا توجد متاجر محفوظة بعد.</RText>
          <TouchableOpacity style={[styles.rateStoreButton, styles.rateStoreButtonDisabled]} onPress={onOpenAllStores} activeOpacity={0.85}>
            <RText style={styles.rateStoreButtonText}>تصفح المتاجر</RText>
          </TouchableOpacity>
        </>
      )}
    </ScreenScroll>
  );
}
