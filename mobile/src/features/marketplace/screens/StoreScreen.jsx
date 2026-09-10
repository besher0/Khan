import { useState } from 'react';
import { ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import * as Icons from '../../../../icons';
import { styles } from '../theme/styles';
import { AppIcon, HeaderSearch, RText, Tabs, palette } from '../shared/marketplaceShared';

function StoreInfoScreen({ catalog, onOpenProduct, onAddToCart, onToggleFavorite, onShowAll, favorites }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.storeInner}>
      <RText style={styles.collectionEmpty}>لا توجد بيانات متجر محدد حالياً.</RText>
    </ScrollView>
  );
}

function StoreListScreen({ catalog, onShowAll }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.storeInner}>
      <HeaderSearch title="المتاجر" compact />
      <RText style={styles.collectionEmpty}>لا توجد متاجر متاحة من الباك إند حالياً.</RText>
    </ScrollView>
  );
}

function ReviewsScreen({ rateMode = false, onSubmitReview }) {
  const [comment, setComment] = useState('');

  if (rateMode) {
    return (
      <View style={styles.rateScreen}>
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
          value={comment}
          onChangeText={setComment}
        />
        <RText style={styles.rateQuestion}>أضف صورة من تجربتك (اختياري)</RText>
        <View style={styles.uploadRow}>
          <View style={styles.uploadBox} />
          <View style={styles.uploadBox} />
          <TouchableOpacity style={styles.uploadDashed}>
            <AppIcon icon={Icons.Camera} size={22} color={palette.muted} />
            <RText style={styles.uploadText}>إضافة صورة</RText>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.submitButton} onPress={() => onSubmitReview?.(comment)}>
          <RText style={styles.submitText}>إرسال التقييم</RText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.storeInner}>
      <RText style={styles.collectionEmpty}>لا توجد تقييمات متاحة من الباك إند حالياً.</RText>
    </ScrollView>
  );
}

export function StoreScreen({ catalog, onOpenProduct, onAddToCart, onToggleFavorite, onShowAll, favorites, onSubmitReview }) {
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
          catalog={catalog}
          onOpenProduct={onOpenProduct}
          onAddToCart={onAddToCart}
          onToggleFavorite={onToggleFavorite}
          onShowAll={onShowAll}
          favorites={favorites}
        />
      ) : null}
      {view === 'المتاجر' ? <StoreListScreen catalog={catalog} onShowAll={onShowAll} /> : null}
      {view === 'التقييمات' ? <ReviewsScreen /> : null}
      {view === 'إرسال تقييم' ? <ReviewsScreen rateMode onSubmitReview={onSubmitReview} /> : null}
    </View>
  );
}
