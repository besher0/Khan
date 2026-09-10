import { Image, Text, TouchableOpacity, View } from 'react-native';
import * as Icons from '../../../../icons';
import { EmptyState, FilterRow, HeaderTabs, Icon } from '../components/DashboardComponents';
import { remoteImage, statusLabel } from '../dashboardUtils';
import { palette, styles } from '../dashboardStyles';

export default function ReelsView({ data, canManage, onAdd }) {
  const reels = data.reels;
  return (
    <>
      <HeaderTabs active="all" onChange={() => {}} tabs={[{ key: 'all', label: `الكل ${reels.length}` }]} />
      <FilterRow primaryLabel={canManage ? 'رفع ريل جديد' : null} onPrimaryPress={onAdd} filterLabel="الأحدث" />
      <View style={styles.reelsGrid}>
        {reels.length ? reels.map((reel, index) => {
          const image = getProductImage(reel, index + 1);
          return (
            <View key={`${reel.id}-${index}`} style={styles.reelCard}>
              {image ? (
                <Image source={image} style={styles.reelImage} />
              ) : (
                <View style={[styles.reelImage, styles.productThumbPlaceholder]}>
                  <Icon glyph={Icons.Video} color={palette.green} size={42} />
                </View>
              )}
              <View style={styles.reelStatus}><Text style={styles.reelStatusText}>{statusLabel(reel.status)}</Text></View>
              <View style={styles.reelMeta}>
                <Text style={styles.reelTitle}>{reel.title || '-'}</Text>
                <View style={styles.reelViews}><Icon glyph={Icons.Play} color={palette.muted} size={16} /><Text style={styles.mutedSmall}>{statusLabel(reel.status)}</Text></View>
              </View>
            </View>
          );
        }) : <EmptyState />}
      </View>
    </>
  );
}
