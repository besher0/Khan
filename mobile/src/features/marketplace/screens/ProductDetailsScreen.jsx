import { useEffect, useState } from 'react';
import { Image, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import * as Icons from '../../../../icons';
import { styles } from '../theme/styles';
import { AppIcon, RText, StarsRow, formatReviewDate, formatSyp, reviewSummaryOf, palette } from '../shared/marketplaceShared';
import { authApi, reviewsApi, uploadsApi } from '../../../services/api';

export function ProductDetailsScreen({
  product,
  onBack,
  onAddToCart,
  onToggleFavorite,
  isFavorite,
  onGoToCart,
  onOpenStore,
  onOpenReviews,
  onRateProduct,
  submittingReview = false,
}) {
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showRateForm, setShowRateForm] = useState(false);
  const [productRating, setProductRating] = useState(5);
  const [productComment, setProductComment] = useState('');
  const [productImages, setProductImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [eligibility, setEligibility] = useState(null);

  const productId = product?.id;
  const hasSession = Boolean(authApi.getSession('customer'));

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!productId) return;
      setReviewLoading(true);
      setReviews([]);
      setShowRateForm(false);
      setProductComment('');
      setProductImages([]);
      try {
        const response = await reviewsApi.product(productId);
        if (!cancelled) setReviews(response);
      } catch {
        if (!cancelled) setReviews(null);
      } finally {
        if (!cancelled) setReviewLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  useEffect(() => {
    let cancelled = false;
    const loadEligibility = async () => {
      if (!productId || !hasSession) {
        setEligibility(null);
        return;
      }
      try {
        const response = await reviewsApi.productEligibility(productId);
        if (!cancelled) setEligibility(response);
      } catch {
        if (!cancelled) setEligibility(null);
      }
    };
    loadEligibility();
    return () => {
      cancelled = true;
    };
  }, [productId, hasSession]);

  if (!product) return null;

  const summary = reviewSummaryOf(reviews);
  const canRate = eligibility?.eligible && !eligibility?.alreadyReviewed;

  const pickImage = () => {
    if (uploadingImage || productImages.length >= 3) return;
    if (typeof document === 'undefined') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploadingImage(true);
      try {
        const uploaded = await uploadsApi.file(file, 'customer');
        setProductImages((current) => [...current, uploaded.url].slice(0, 3));
      } catch {
        // keep silent like other upload paths
      } finally {
        setUploadingImage(false);
      }
    };
    input.click();
  };

  const storeId = product?.storeId || product?.raw?.storeId;
  const storeName = product?.store || 'المتجر';

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
            <RText style={styles.detailsStoreName}>{storeName}</RText>
            <RText style={styles.tinyMuted}>{product.category || '-'}</RText>
          </View>
          {storeId ? (
            <TouchableOpacity style={styles.detailsStoreButton} onPress={() => onOpenStore?.(storeId)}>
              <RText style={styles.detailsStoreButtonText}>زيارة المتجر</RText>
            </TouchableOpacity>
          ) : null}
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

        <View style={styles.detailsDivider} />
        <View style={styles.productReviewsBlock}>
          <View style={styles.detailsBadgeRow}>
            <RText style={styles.detailsSectionTitle}>تقييمات المنتج</RText>
            {storeId && onOpenReviews ? (
              <TouchableOpacity onPress={onOpenReviews}>
                <RText style={styles.sectionAction}>تقييمات المتجر</RText>
              </TouchableOpacity>
            ) : null}
          </View>
          <RText style={styles.tinyMuted}>
            {summary.total ? `${summary.average.toFixed(1)} من 5 (${summary.total} تقييم)` : 'لا توجد تقييمات بعد'}
          </RText>

          {hasSession ? (
            canRate ? (
              !showRateForm ? (
                <TouchableOpacity style={styles.productRateButton} onPress={() => setShowRateForm(true)} activeOpacity={0.85}>
                  <RText style={styles.productRateButtonText}>قيّم هذا المنتج</RText>
                </TouchableOpacity>
              ) : (
                <View>
                  <View style={styles.rateStarsSelector}>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <TouchableOpacity key={`product-rate-star-${value}`} onPress={() => setProductRating(value)} activeOpacity={0.7}>
                        <AppIcon
                          icon={Icons.Star}
                          size={30}
                          color={value <= productRating ? palette.amber : '#D6DBDF'}
                          fill={value <= productRating ? palette.amber : 'transparent'}
                          strokeWidth={1.6}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <RText style={styles.deliveredNoteLabel}>تعليقك (اختياري)</RText>
                  <TextInput
                    style={styles.commentBox}
                    value={productComment}
                    onChangeText={setProductComment}
                    placeholder="اكتب تعليقك (اختياري)"
                    placeholderTextColor="#A7AFB7"
                    multiline
                    textAlign="right"
                    textAlignVertical="top"
                  />
                  <View style={styles.rateUploadRow}>
                    {productImages.map((url, index) => (
                      <View key={`product-rate-image-${url}-${index}`} style={styles.rateUploadThumbWrap}>
                        <Image source={{ uri: url }} style={styles.rateUploadThumb} />
                        <TouchableOpacity
                          style={styles.rateUploadRemove}
                          onPress={() => setProductImages((current) => current.filter((item, itemIndex) => itemIndex !== index))}
                        >
                          <AppIcon icon={Icons.X} size={11} color={palette.white} strokeWidth={3} />
                        </TouchableOpacity>
                      </View>
                    ))}
                    {productImages.length < 3 ? (
                      <TouchableOpacity style={styles.rateUploadAdd} onPress={pickImage} activeOpacity={0.8}>
                        <AppIcon icon={uploadingImage ? Icons.Loader : Icons.Camera} size={18} color={palette.muted} />
                        <RText style={styles.rateUploadAddText}>{uploadingImage ? 'جارٍ الرفع...' : 'إضافة صورة'}</RText>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    style={[styles.rateSubmitFixed, submittingReview && styles.trackConfirmDisabled]}
                    disabled={submittingReview}
                    onPress={async () => {
                      await onRateProduct?.({
                        orderId: eligibility.order.id,
                        productId,
                        rating: productRating,
                        comment: productComment.trim() || undefined,
                        imageUrls: productImages,
                      });
                      setShowRateForm(false);
                    }}
                    activeOpacity={0.85}
                  >
                    <RText style={styles.submitText}>{submittingReview ? 'جارٍ الإرسال...' : 'إرسال التقييم'}</RText>
                  </TouchableOpacity>
                </View>
              )
            ) : eligibility?.alreadyReviewed ? (
              <RText style={[styles.editProfileHint, { textAlign: 'center', marginTop: 10 }]}>
                قيّمت هذا المنتج من قبل، شكرًا لمشاركتك!
              </RText>
            ) : null
          ) : null}

          {reviewLoading ? (
            <RText style={[styles.tinyMuted, { marginTop: 10, textAlign: 'center' }]}>جارٍ تحميل التقييمات...</RText>
          ) : null}
          {summary.items.map((review) => (
            <View key={`product-review-${review.id}`} style={styles.productReviewCard}>
              <View style={styles.reviewCardHeader}>
                <View style={styles.reviewAvatar}>
                  <AppIcon icon={Icons.User} size={18} color={palette.green} />
                </View>
                <View style={styles.reviewHeaderTexts}>
                  <RText style={styles.reviewName}>{review.userName}</RText>
                  <StarsRow value={review.rating} size={10} />
                </View>
                <RText style={styles.commentDate}>{formatReviewDate(review.createdAt)}</RText>
              </View>
              {review.comment ? <RText style={styles.commentText}>{review.comment}</RText> : null}
              {review.images.length ? (
                <View style={styles.productReviewImagesRow}>
                  {review.images.map((image, index) => (
                    <Image key={`product-review-image-${review.id}-${index}`} source={image} style={styles.productReviewImage} />
                  ))}
                </View>
              ) : null}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
