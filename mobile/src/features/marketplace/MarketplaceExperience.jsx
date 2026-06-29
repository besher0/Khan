import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import PhoneExperience from './PhoneExperience';
import { styles } from './theme/styles';

export default function MarketplaceExperience() {
  const { width } = useWindowDimensions();
  return <View style={styles.appRoot}><View style={styles.workspace}><View style={[styles.phoneStage, width < 520 && styles.phoneStageSmall]}><PhoneExperience /></View></View></View>;
}
