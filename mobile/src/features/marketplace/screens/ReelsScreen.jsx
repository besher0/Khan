import { useState } from 'react';
import { ImageBackground, TouchableOpacity, View } from 'react-native';
import * as Icons from '../../../../icons';
import { styles } from '../theme/styles';
import { AppIcon, RText, formatSyp, palette } from '../shared/marketplaceShared';

export function ReelsScreen({ reel, onAddToCart, onBack }) {
  const [quantity, setQuantity] = useState(1);
  const currentProduct = reel?.product;

  if (!reel) {
    return (
      <View style={styles.emptyCart}>
        <View style={styles.emptyCartIcon}>
          <AppIcon icon={Icons.Video} size={38} color={palette.green} />
        </View>
        <RText style={styles.emptyCartTitle}>لا توجد ريلز متاحة</RText>
        <TouchableOpacity style={styles.emptyCartButton} onPress={onBack}>
          <RText style={styles.emptyCartButtonText}>العودة</RText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.reelsScreen}>
      {reel.image ? (
        <ImageBackground source={reel.image} style={styles.reelsBackground} resizeMode="cover">
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
              <RText style={styles.detailsStoreName}>{reel?.title || '-'}</RText>
              <View style={styles.qtyRow}>
                <RText style={styles.sheetPrice}>{currentProduct ? formatSyp((currentProduct.priceValue || 0) * quantity) : '-'}</RText>
                <View style={styles.qtyControls}>
                  <TouchableOpacity style={styles.qtyButton} onPress={() => setQuantity((current) => Math.max(1, current - 1))}>
                    <AppIcon icon={Icons.Minus} size={14} color={palette.muted} />
                  </TouchableOpacity>
                  <RText style={styles.qtyValue}>{quantity}</RText>
                  <TouchableOpacity style={styles.qtyButton} onPress={() => setQuantity((current) => current + 1)}>
                    <AppIcon icon={Icons.Plus} size={14} color={palette.muted} />
                  </TouchableOpacity>
                  <RText style={styles.qtyLabel}>العناصر المختارة</RText>
                </View>
              </View>
              {currentProduct ? (
                <TouchableOpacity style={styles.addToCartButton} onPress={() => onAddToCart(currentProduct, quantity)}>
                  <AppIcon icon={Icons.ShoppingCart} size={22} color={palette.white} />
                  <RText style={styles.addToCartText}>أضف للسلة</RText>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </ImageBackground>
      ) : (
        <View style={[styles.reelsBackground, { alignItems: 'center', justifyContent: 'center', backgroundColor: palette.greenSoft }]}>
          <AppIcon icon={Icons.Video} size={42} color={palette.green} />
        </View>
      )}
    </View>
  );
}
