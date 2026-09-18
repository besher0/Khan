export const ReviewSort = {
  LATEST: 'latest',
  OLDEST: 'oldest',
  HIGHEST: 'highest',
  LOWEST: 'lowest',
} as const;

export type ReviewSort = (typeof ReviewSort)[keyof typeof ReviewSort];
