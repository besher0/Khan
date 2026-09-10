import { useState } from 'react';
import { View } from 'react-native';
import { styles } from '../theme/styles';
import { CategoryStrip, HeaderSearch, ProductCard, RText } from '../shared/marketplaceShared';
import { listOrEmpty, ScreenScroll, useMarketplaceLayout } from './screenShared.jsx';

export function SearchScreen({
  catalog,
  searchResults,
  onSearch,
  onOpenProduct,
  onAddToCart,
  onToggleFavorite,
  favorites,
}) {
  const [query, setQuery] = useState('');
  const productList = searchResults ? listOrEmpty(searchResults.products) : listOrEmpty(catalog?.products);
  const categories = listOrEmpty(catalog?.categories);
  const { productCardStyle } = useMarketplaceLayout();

  return (
    <ScreenScroll>
      <HeaderSearch
        compact
        value={query}
        onChangeText={setQuery}
        onSubmit={() => onSearch?.(query)}
      />
      <CategoryStrip double items={categories} />
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
      {!productList.length ? <RText style={styles.collectionEmpty}>لا توجد منتجات مطابقة.</RText> : null}
    </ScreenScroll>
  );
}
