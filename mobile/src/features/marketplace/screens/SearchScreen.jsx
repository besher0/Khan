import { useState } from 'react';
import { View } from 'react-native';
import { styles } from '../theme/styles';
import { CategoryStrip, HeaderSearch, ProductCard, RText, StoreCard } from '../shared/marketplaceShared';
import { listOrEmpty, ScreenScroll, useMarketplaceLayout } from './screenShared.jsx';

export function SearchScreen({
  catalog,
  searchResults,
  onSearch,
  onOpenProduct,
  onAddToCart,
  onToggleFavorite,
  favorites,
  onOpenStore,
}) {
  const [query, setQuery] = useState('');
  const productList = searchResults ? listOrEmpty(searchResults.products) : listOrEmpty(catalog?.products);
  const storeList = searchResults ? listOrEmpty(searchResults.stores) : [];
  const categories = listOrEmpty(catalog?.categories);
  const { productCardStyle, collectionCardStyle } = useMarketplaceLayout();

  return (
    <ScreenScroll>
      <HeaderSearch
        compact
        value={query}
        onChangeText={setQuery}
        onSubmit={() => onSearch?.(query)}
      />
      <CategoryStrip double items={categories} />

      {storeList.length ? (
        <>
          <View style={styles.sectionTitle}>
            <RText style={styles.sectionHeading}>المتاجر</RText>
          </View>
          <View style={styles.storeCardGrid}>
            {storeList.map((store) => (
              <StoreCard
                key={`search-store-${store.id}`}
                store={{
                  id: store.id,
                  name: store.name,
                  description: store.description || '',
                  banner: store.bannerUrl ? { uri: store.bannerUrl } : null,
                  logo: store.logoUrl ? { uri: store.logoUrl } : null,
                  rating: Number(store.ratingAvg || 0),
                  ratingCount: Number(store.ratingCount || 0),
                  productCount: 0,
                }}
                style={collectionCardStyle || productCardStyle}
                onPress={onOpenStore}
              />
            ))}
          </View>
        </>
      ) : null}

      <View style={styles.productGrid}>
        {productList.map((product) => (
          <ProductCard
            key={`search-${product.id || product.title}`}
            product={product}
            style={productCardStyle}
            onOpen={onOpenProduct}
            onAddToCart={onAddToCart}
            onToggleFavorite={onToggleFavorite}
            isFavorite={favorites.includes(product.id || product.title)}
          />
        ))}
      </View>
      {!productList.length && !storeList.length ? <RText style={styles.collectionEmpty}>لا توجد نتائج مطابقة.</RText> : null}
    </ScreenScroll>
  );
}
