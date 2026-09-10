import { Image, Text, TouchableOpacity, View } from 'react-native';
import * as Icons from '../../../../icons';
import { palette, styles, toneStyles } from '../dashboardStyles';
import { remoteImage, statusLabel, statusTone } from '../dashboardUtils';

export function Icon({ glyph: Glyph, color = palette.green, size = 22 }) {
  const Fallback = Icons.Circle || Icons.Dot;
  const Component = Glyph || Fallback;
  return <Component size={size} color={color} strokeWidth={2} />;
}

export function StatCard({ label, value, hint, delta, icon, tone = 'green' }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, toneStyles[tone]?.soft]}>
        <Icon glyph={icon} color={toneStyles[tone]?.text.color || palette.green} size={28} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <View style={styles.statFooter}>
        <Text style={[styles.statDelta, toneStyles[tone]?.text]}>{delta}</Text>
        <Text style={styles.statHint}>{hint}</Text>
      </View>
    </View>
  );
}

export function StatusPill({ status, label }) {
  const tone = statusTone(status);
  return (
    <View style={[styles.statusPill, toneStyles[tone]?.soft]}>
      <Text style={[styles.statusText, toneStyles[tone]?.text]}>{label || statusLabel(status)}</Text>
    </View>
  );
}

export function SwitchControl({ active = true, onPress, disabled = false }) {
  return (
    <TouchableOpacity
      style={[styles.switchTrack, active && styles.switchTrackActive, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled || !onPress}
      accessibilityRole="switch"
      accessibilityState={{ checked: active, disabled }}
    >
      <View style={[styles.switchDot, active && styles.switchDotActive]} />
    </TouchableOpacity>
  );
}

export function EmptyState({ label = 'لا توجد بيانات' }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>{label}</Text>
    </View>
  );
}

export function HeaderTabs({ tabs, active, onChange }) {
  return (
    <View style={styles.tabsBar}>
      {tabs.map((tab) => (
        <TouchableOpacity key={tab.key} style={[styles.tabButton, active === tab.key && styles.tabButtonActive]} onPress={() => onChange(tab.key)}>
          <Text style={[styles.tabButtonText, active === tab.key && styles.tabButtonTextActive]}>{tab.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function FilterRow({ primaryLabel, filterLabel = 'الأحدث', onPrimaryPress, children }) {
  return (
    <View style={styles.filterRow}>
      {primaryLabel ? (
        <TouchableOpacity style={styles.primaryButton} onPress={onPrimaryPress}>
          <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
        </TouchableOpacity>
      ) : <View />}
      <TouchableOpacity style={styles.filterButton}>
        <Icon glyph={Icons.ChevronDown} color={palette.greenMid} size={18} />
        <Text style={styles.filterText}>{filterLabel}</Text>
      </TouchableOpacity>
      {children}
    </View>
  );
}

export function ProductThumb({ source, size = 58 }) {
  const thumbStyle = [styles.productThumb, { width: size, height: size, borderRadius: Math.min(16, size / 4) }];
  if (!source) {
    return (
      <View style={[thumbStyle, styles.productThumbPlaceholder]}>
        <Icon glyph={Icons.Package} color={palette.green} size={Math.max(16, size / 2.5)} />
      </View>
    );
  }
  return <Image source={source} style={thumbStyle} />;
}