export function getCartStoreMismatch(currentStoreId: string | null, incomingStoreId: string) {
  if (!currentStoreId || currentStoreId === incomingStoreId) {
    return null;
  }

  return {
    code: 'CART_STORE_MISMATCH',
    message: 'Cart can contain products from one store only',
    currentStoreId,
    incomingStoreId,
  };
}
