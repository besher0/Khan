import { useState } from 'react';
import { Image, ScrollView, TouchableOpacity, View } from 'react-native';
import * as Icons from '../../../../icons';
import { styles } from '../theme/styles';
import { AppIcon, RText, formatSyp, palette } from '../shared/marketplaceShared';

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
            <RText style={styles.detailsStoreName}>{product.store}</RText>
            <RText style={styles.tinyMuted}>{product.category || '-'}</RText>
          </View>
          <TouchableOpacity style={styles.detailsStoreButton}>
            <RText style={styles.detailsStoreButtonText}>زيارة المتجر</RText>
          </TouchableOpacity>
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
      </View>
    </ScrollView>
  );
}
