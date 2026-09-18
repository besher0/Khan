/**
 * Current-location helpers for the address form.
 *
 * - Native (Expo Go / dev client): expo-location foreground permission + one-shot position.
 * - Web: browser geolocation API.
 * - Reverse geocoding: expo-location's built-in reverse geocode on native,
 *   browser-friendly Nominatim (OpenStreetMap) lookup on web.
 *
 * No secret API keys are used anywhere here, so nothing can leak to the client.
 */

const SYRIAN_GOVERNORATES = [
  'دمشق',
  'ريف دمشق',
  'حلب',
  'حمص',
  'حماة',
  'اللاذقية',
  'طرطوس',
  'دير الزور',
  'الحسكة',
  'الرقة',
  'إدلب',
  'درعا',
  'السويداء',
  'قنيطرا',
  'الرستن',
];

const GOVERNORATE_ALIASES = {
  damascus: 'دمشق',
  'damascus governorate': 'دمشق',
  'damascus city': 'دمشق',
  'rif dimashq': 'ريف دمشق',
  'rural damascus': 'ريف دمشق',
  'markaz rif dimashq': 'ريف دمشق',
  aleppo: 'حلب',
  homs: 'حمص',
  hums: 'حمص',
  hama: 'حماة',
  latakia: 'اللاذقية',
  'lattakia': 'اللاذقية',
  tartus: 'طرطوس',
  tartous: 'طرطوس',
  'deir ez-zor': 'دير الزور',
  'deir ez zor': 'دير الزور',
  'al-hasakah': 'الحسكة',
  'al hasakah': 'الحسكة',
  hassakeh: 'الحسكة',
  'ar-raqqa': 'الرقة',
  raqqa: 'الرقة',
  idlib: 'إدلب',
  daraa: 'درعا',
  'as-suwayda': 'السويداء',
  suwayda: 'السويداء',
  'al-qunaytirah': 'قنيطرا',
  quneitra: 'قنيطرا',
};

function cleanValue(value) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function pickCityName(place = {}) {
  return (
    cleanValue(place.city) ||
    cleanValue(place.district) ||
    cleanValue(place.subregion) ||
    cleanValue(place.region) ||
    ''
  );
}

function normalizeArabicGovernorate(rawName) {
  const name = cleanValue(rawName);
  if (!name) return '';

  if (SYRIAN_GOVERNORATES.some((candidate) => name.includes(candidate))) {
    return SYRIAN_GOVERNORATES.find((candidate) => name.includes(candidate));
  }

  const latin = name.toLowerCase();
  if (GOVERNORATE_ALIASES[latin]) return GOVERNORATE_ALIASES[latin];

  return name;
}

async function fetchJson(url, timeoutMs = 8000) {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller?.signal,
    });
    if (!response.ok) throw new Error(`geocode failed: ${response.status}`);
    return await response.json();
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function reverseGeocodeWeb(latitude, longitude) {
  try {
    const data = await fetchJson(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=ar&zoom=16`,
    );
    const address = data?.address || {};
    const area =
      cleanValue(address.suburb) ||
      cleanValue(address.neighbourhood) ||
      cleanValue(address.quarter) ||
      cleanValue(address.village) ||
      cleanValue(address.town) ||
      cleanValue(address.city_district) ||
      '';
    const governorate =
      normalizeArabicGovernorate(address.state) ||
      normalizeArabicGovernorate(address.province) ||
      pickCityName(address);
    const street =
      cleanValue(address.road) ||
      cleanValue(address.pedestrian) ||
      cleanValue(address.footway) ||
      '';

    return { governorate, area, street };
  } catch {
    return { governorate: '', area: '', street: '' };
  }
}

function reverseGeocodeNative(latitude, longitude) {
  return import('expo-location')
    .then(async ({ reverseGeocodeAsync }) => {
      const places = await reverseGeocodeAsync({ latitude, longitude });
      const place = places?.[0];
      if (!place) return { governorate: '', area: '', street: '' };

      return {
        governorate: normalizeArabicGovernorate(pickCityName(place) || place.city),
        area: cleanValue(place.district) || cleanValue(place.subregion) || cleanValue(place.city) || '',
        street: cleanValue(place.street) || cleanValue(place.name) || '',
      };
    })
    .catch(() => ({ governorate: '', area: '', street: '' }));
}

export async function reverseGeocode(latitude, longitude) {
  const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';
  const details = isWeb
    ? await reverseGeocodeWeb(latitude, longitude)
    : await reverseGeocodeNative(latitude, longitude);

  return {
    governorate: cleanValue(details.governorate),
    area: cleanValue(details.area),
    street: cleanValue(details.street),
    latitude,
    longitude,
  };
}

async function getCurrentPositionWeb() {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    const error = new Error('المتصفح لا يدعم تحديد الموقع');
    error.code = 'UNSUPPORTED';
    throw error;
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      (geoError) => {
        const error = new Error('تم رفض إذن الموقع، يمكنك إدخال العنوان يدويًا');
        error.code = geoError?.code === 1 ? 'PERMISSION_DENIED' : 'LOCATION_ERROR';
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  });
}

async function getCurrentPositionNative() {
  const { requestForegroundPermissionsAsync, getCurrentPositionAsync, Accuracy } =
    await import('expo-location');

  const permission = await requestForegroundPermissionsAsync();
  if (!permission.granted) {
    const error = new Error('تم رفض إذن الموقع، يمكنك إدخال العنوان يدويًا');
    error.code = 'PERMISSION_DENIED';
    throw error;
  }

  const position = await getCurrentPositionAsync({
    accuracy: Accuracy.Balanced,
  });

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}

/**
 * One-shot current location, only after an explicit user action.
 * Throws an Error with a `.code` of PERMISSION_DENIED / UNSUPPORTED / LOCATION_ERROR.
 */
export async function getCurrentLocation() {
  const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';
  return isWeb ? getCurrentPositionWeb() : getCurrentPositionNative();
}

/**
 * Full flow used by the address form toggle: get coordinates, then reverse geocode.
 * Coordinates are always preserved even when geocoding fails.
 */
export async function detectCurrentAddress() {
  const position = await getCurrentLocation();

  try {
    const details = await reverseGeocode(position.latitude, position.longitude);
    return {
      ...details,
      geocodeFailed: !details.governorate && !details.area && !details.street,
    };
  } catch {
    return {
      governorate: '',
      area: '',
      street: '',
      latitude: position.latitude,
      longitude: position.longitude,
      geocodeFailed: true,
    };
  }
}

export { SYRIAN_GOVERNORATES };
