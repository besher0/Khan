import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import splashLogoImage from '../../assets/icon.png';
import { KHAN_COLORS, KHAN_EMBLEM_PATH } from '../components/KhanLogo';
import { useCairoFonts } from './useCairoFonts';

const MarketplaceExperience = lazy(() => import('../features/marketplace/MarketplaceExperience'));
const DashboardWorkspace = lazy(() => import('../features/dashboards/DashboardWorkspace'));

const APP_FONT_FAMILY = Platform.select({
  web: 'Cairo',
  default: 'Cairo_400Regular',
});
const SPLASH_SHOWN_STORAGE_KEY = 'khan:splash-shown';

let defaultFontApplied = false;

function applyDefaultFont() {
  if (defaultFontApplied) return;
  defaultFontApplied = true;
  [Text, TextInput].forEach((Component) => {
    Component.defaultProps = Component.defaultProps || {};
    Component.defaultProps.style = [styles.defaultFont, Component.defaultProps.style];
  });
}

function LoadingExperience() {
  return (
    <View style={styles.loading}>
      <Text style={styles.loadingText}>جاري تحميل الواجهة...</Text>
    </View>
  );
}

function SplashScreen({ onDone }) {
  const fade = useRef(new Animated.Value(1)).current;
  const markOpacity = useRef(new Animated.Value(0)).current;
  const markScale = useRef(new Animated.Value(0.82)).current;
  const markY = useRef(new Animated.Value(26)).current;
  const markRotate = useRef(new Animated.Value(0)).current;
  const greenDotOpacity = useRef(new Animated.Value(0)).current;
  const greenDotY = useRef(new Animated.Value(-78)).current;
  const goldDotOpacity = useRef(new Animated.Value(0)).current;
  const goldDotScale = useRef(new Animated.Value(0.35)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.84)).current;
  const logoY = useRef(new Animated.Value(20)).current;
  const finished = useRef(false);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    Animated.timing(fade, {
      toValue: 0,
      duration: 220,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start(() => onDone?.());
  };

  useEffect(() => {
    Animated.sequence([
      Animated.delay(240),
      Animated.parallel([
        Animated.timing(markOpacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(markScale, {
          toValue: 1,
          duration: 560,
          easing: Easing.out(Easing.back(1.3)),
          useNativeDriver: true,
        }),
        Animated.timing(markY, {
          toValue: 0,
          duration: 560,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(120),
      Animated.parallel([
        Animated.timing(greenDotOpacity, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(greenDotY, {
          toValue: 0,
          duration: 430,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(140),
      Animated.parallel([
        Animated.timing(markRotate, {
          toValue: 1,
          duration: 520,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(goldDotOpacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(goldDotScale, {
          toValue: 1,
          duration: 340,
          easing: Easing.out(Easing.back(1.7)),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(280),
      Animated.parallel([
        Animated.timing(markOpacity, {
          toValue: 0,
          duration: 260,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(markScale, {
          toValue: 0.78,
          duration: 320,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(markY, {
          toValue: -10,
          duration: 320,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 340,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 380,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoY, {
          toValue: 0,
          duration: 380,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(780),
    ]).start(finish);
  }, [goldDotOpacity, goldDotScale, greenDotOpacity, greenDotY, logoOpacity, logoScale, logoY, markOpacity, markRotate, markScale, markY]);

  const markRotation = markRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-22deg'],
  });

  return (
    <Animated.View pointerEvents="auto" style={[styles.splash, { opacity: fade }]}>
      <Pressable style={StyleSheet.absoluteFill} onPress={finish} />
      <Animated.View
        style={[
          styles.splashMark,
          {
            opacity: markOpacity,
            transform: [{ translateX: -34 }, { translateY: markY }, { rotate: markRotation }, { scale: markScale }],
          },
        ]}
      >
        <Svg width="100%" height="100%" viewBox="0 0 180 230">
          <Path d={KHAN_EMBLEM_PATH} fill={KHAN_COLORS.green} />
        </Svg>
        <Animated.View
          style={[
            styles.splashDot,
            styles.splashDotGreen,
            {
              opacity: greenDotOpacity,
              transform: [{ translateY: greenDotY }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.splashDot,
            styles.splashDotGold,
            {
              opacity: goldDotOpacity,
              transform: [{ scale: goldDotScale }],
            },
          ]}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.splashLogo,
          {
            opacity: logoOpacity,
            transform: [{ translateY: logoY }, { scale: logoScale }],
          },
        ]}
      >
        <Image source={splashLogoImage} style={styles.splashLogoImage} resizeMode="contain" />
      </Animated.View>
    </Animated.View>
  );
}

function getWorkspaceFromPath() {
  if (typeof window === 'undefined' || !window.location?.pathname) return 'marketplace';
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/dashboard' || path.startsWith('/dashboard/')) return 'dashboard';
  return 'marketplace';
}

function shouldShowSplash(workspace) {
  if (workspace !== 'marketplace') return false;
  if (Platform.OS !== 'web' || typeof window === 'undefined') return true;

  try {
    const { sessionStorage } = window;
    if (!sessionStorage) return true;
    if (sessionStorage.getItem(SPLASH_SHOWN_STORAGE_KEY) === 'true') return false;
    sessionStorage.setItem(SPLASH_SHOWN_STORAGE_KEY, 'true');
  } catch {
    return true;
  }

  return true;
}

export default function AppRoot() {
  const workspace = useMemo(getWorkspaceFromPath, []);
  const [showSplash, setShowSplash] = useState(() => shouldShowSplash(workspace));
  const fontsLoaded = useCairoFonts();

  if (fontsLoaded || Platform.OS === 'web') {
    applyDefaultFont();
  }

  if (!fontsLoaded && Platform.OS !== 'web') {
    return <LoadingExperience />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar hidden={showSplash} barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.root}>
        <Suspense fallback={<LoadingExperience />}>
          {workspace === 'dashboard' ? <DashboardWorkspace /> : <MarketplaceExperience />}
        </Suspense>
        {showSplash ? <SplashScreen onDone={() => setShowSplash(false)} /> : null}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  defaultFont: {
    fontFamily: APP_FONT_FAMILY,
  },
  root: {
    flex: 1,
    minHeight: 0,
    backgroundColor: '#F7F8F6',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F8F6',
  },
  loadingText: {
    color: '#179B7D',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  splash: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    elevation: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  splashMark: {
    width: 300,
    height: 383,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashDot: {
    position: 'absolute',
    borderRadius: 999,
  },
  splashDotGreen: {
    top: 17,
    left: 117,
    width: 40,
    height: 40,
    backgroundColor: KHAN_COLORS.green,
  },
  splashDotGold: {
    top: 115,
    left: 242,
    width: 30,
    height: 30,
    backgroundColor: KHAN_COLORS.amber,
  },
  splashLogo: {
    position: 'absolute',
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogoImage: {
    width: '100%',
    height: '100%',
  },
});
