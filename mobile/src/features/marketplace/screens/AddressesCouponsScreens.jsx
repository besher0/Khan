import React, { useEffect, useMemo, useState } from 'react';
import { Image, Switch, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import * as Icons from '../../../../icons';
import { addressesApi } from '../../../services/api';
import { styles } from '../theme/styles';
import { AppIcon, RText, palette } from '../shared/marketplaceShared';
import { detectCurrentAddress, SYRIAN_GOVERNORATES } from '../shared/location';
import { ScreenScroll } from './screenShared.jsx';
import couponEmptyImage from '../../../../assets/empty-basket.jpg';

/* ============================== Addresses =============================== */

function addressSummaryLine(address) {
  return [
    address.governorate || address.city,
    address.area,
  ]
    .map((part) => (part || '').trim())
    .filter(Boolean)
    .join(' - ');
}

function addressDetailsLine(address) {
  return [
    address.street,
    address.building,
    address.floor ? `الطابق ${address.floor}` : '',
    address.additionalInfo,
  ]
    .map((part) => (part || '').trim())
    .filter(Boolean)
    .join('، ');
}

export function AddressCard({ address, isDefault, wide = false, onEdit, onSetDefault, onDelete }) {
  const defaultColor = isDefault ? palette.green : palette.border;

  return (
    <View style={[styles.addressCard, wide && styles.addressListWideCard, isDefault && styles.addressCardDefault, { borderColor: defaultColor }]}>
      <View style={styles.addressCardTop}>
        <TouchableOpacity
          style={styles.addressCardLabelRow}
          onPress={() => onSetDefault?.(address)}
          disabled={isDefault}
          activeOpacity={0.7}
        >
          <View style={[styles.addressDefaultDot, isDefault && styles.addressDefaultDotActive]} />
          <RText style={[styles.addressCardLabel, isDefault && styles.addressCardLabelDefault]}>
            {address.label || 'عنوان'}
          </RText>
          {isDefault ? (
            <View style={styles.addressDefaultBadge}>
              <RText style={styles.addressDefaultBadgeText}>الافتراضي</RText>
            </View>
          ) : null}
        </TouchableOpacity>
        <View style={styles.addressCardActions}>
          {!isDefault && onDelete ? (
            <TouchableOpacity style={styles.addressIconButton} onPress={() => onDelete?.(address)} hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}>
              <AppIcon icon={Icons.Trash2} size={16} color={palette.danger} strokeWidth={1.9} />
            </TouchableOpacity>
          ) : null}
          {onEdit ? (
            <TouchableOpacity style={styles.addressIconButton} onPress={() => onEdit?.(address)} hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}>
              <AppIcon icon={Icons.Pencil} size={16} color={palette.green} strokeWidth={1.9} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={styles.addressCardLines}>
        <View style={styles.addressCardLine}>
          <AppIcon icon={Icons.MapPin} size={14} color={palette.green} />
          <RText style={styles.addressCardText}>{addressSummaryLine(address) || '—'}</RText>
        </View>
        {addressDetailsLine(address) ? (
          <View style={styles.addressCardLine}>
            <AppIcon icon={Icons.Home || Icons.MapPin} size={14} color={palette.muted} />
            <RText style={[styles.addressCardText, styles.addressCardTextMuted]}>{addressDetailsLine(address)}</RText>
          </View>
        ) : null}
        <View style={styles.addressCardLine}>
          <AppIcon icon={Icons.Phone} size={14} color={palette.muted} />
          <RText style={[styles.addressCardText, styles.addressCardTextMuted]}>{address.phone}</RText>
        </View>
      </View>

      {!isDefault ? (
        <TouchableOpacity style={styles.addressSetDefaultButton} onPress={() => onSetDefault?.(address)} activeOpacity={0.8}>
          <RText style={styles.addressSetDefaultText}>تعيين كافتراضي</RText>
          <AppIcon icon={Icons.ChevronLeft} size={13} color={palette.green} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function AddressesScreen({
  addresses = [],
  loading = false,
  error = '',
  onRetry,
  onBack,
  onAdd,
  onEdit,
  onSetDefault,
  onDelete,
}) {
  const { width } = useWindowDimensions();
  const isWide = width >= 660;

  return (
    <ScreenScroll>
      <View style={styles.couponHeader}>
        <View style={styles.detailsTopButton} />
        <RText style={styles.detailsHeaderTitle}>عناويني</RText>
        <TouchableOpacity style={styles.addressBackOutline} onPress={onBack}>
          <AppIcon icon={Icons.ChevronRight} size={19} color={palette.green} strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      {loading && !addresses.length ? (
        <RText style={styles.collectionEmpty}>جارٍ تحميل العناوين...</RText>
      ) : error && !addresses.length ? (
        <>
          <RText style={styles.collectionEmpty}>تعذر تحميل العناوين</RText>
          <TouchableOpacity style={styles.addressRetryButton} onPress={onRetry}>
            <RText style={styles.addressRetryText}>إعادة المحاولة</RText>
          </TouchableOpacity>
        </>
      ) : addresses.length ? (
        <View style={[styles.addressList, isWide && styles.addressListWide]}>
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              isDefault={address.isDefault}
              wide={isWide}
              onEdit={onEdit}
              onSetDefault={onSetDefault}
              onDelete={onDelete}
            />
          ))}
        </View>
      ) : (
        <RText style={styles.collectionEmpty}>لم تضف عنوانًا بعد</RText>
      )}

      <TouchableOpacity style={styles.addressAddButton} onPress={onAdd} activeOpacity={0.85}>
        <AppIcon icon={Icons.Plus} size={20} color={palette.green} strokeWidth={2.4} />
        <RText style={styles.addressAddText}>إضافة عنوان جديد</RText>
      </TouchableOpacity>
    </ScreenScroll>
  );
}

const EMPTY_FORM = {
  label: '',
  governorate: '',
  phone: '',
  area: '',
  street: '',
  building: '',
  floor: '',
  additionalInfo: '',
  latitude: null,
  longitude: null,
};

export function AddressFormScreen({ editingAddress = null, saving = false, error = '', onSave, onBack }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  const [showGovernorateOptions, setShowGovernorateOptions] = useState(false);

  useEffect(() => {
    if (editingAddress) {
      setForm({
        label: editingAddress.label || '',
        governorate: editingAddress.governorate || editingAddress.city || '',
        phone: editingAddress.phone || '',
        area: editingAddress.area || '',
        street: editingAddress.street || '',
        building: editingAddress.building || '',
        floor: editingAddress.floor || '',
        additionalInfo: editingAddress.additionalInfo || '',
        latitude: editingAddress.latitude ?? null,
        longitude: editingAddress.longitude ?? null,
      });
      setGpsEnabled(Boolean(editingAddress.latitude != null && editingAddress.longitude != null));
    }
  }, [editingAddress]);

  const update = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));

  const canSave = Boolean(
    form.governorate.trim() &&
      form.phone.trim() &&
      form.area.trim() &&
      form.street.trim() &&
      !saving &&
      !locating,
  );

  const handleToggleGps = async (enabled) => {
    setGpsEnabled(enabled);
    if (!enabled) {
      setLocationMessage('');
      // Dropping the toggle also drops the captured coordinates.
      setForm((current) => ({ ...current, latitude: null, longitude: null }));
      return;
    }
    if (locating) return;

    setLocating(true);
    setLocationMessage('جارٍ تحديد موقعك...');
    try {
      const detected = await detectCurrentAddress();
      setForm((current) => ({
        ...current,
        governorate: detected.governorate || current.governorate,
        area: detected.area || current.area,
        street: detected.street || current.street,
        latitude: detected.latitude ?? current.latitude,
        longitude: detected.longitude ?? current.longitude,
      }));
      setLocationMessage(
        detected.geocodeFailed
          ? 'تم تحديد موقعك، لكن تعذر تعبئة تفاصيل العنوان تلقائيًا. يمكنك إدخالها يدويًا.'
          : 'تم تحديد موقعك بنجاح',
      );
    } catch (locationError) {
      setGpsEnabled(false);
      setLocationMessage(locationError?.message || 'تعذر تحديد الموقع، حاول مرة أخرى');
    } finally {
      setLocating(false);
    }
  };

  const submit = () => {
    if (!canSave) return;
    onSave?.({
      label: form.label,
      governorate: form.governorate,
      phone: form.phone,
      area: form.area,
      street: form.street,
      building: form.building,
      floor: form.floor,
      additionalInfo: form.additionalInfo,
      latitude: form.latitude ?? undefined,
      longitude: form.longitude ?? undefined,
    });
  };

  return (
    <ScreenScroll>
      <View style={styles.couponHeader}>
        <View style={styles.detailsTopButton} />
        <RText style={styles.detailsHeaderTitle}>
          {editingAddress ? 'تعديل العنوان' : 'إضافة عنوان جديد'}
        </RText>
        <TouchableOpacity style={styles.addressBackOutline} onPress={onBack}>
          <AppIcon icon={Icons.ChevronRight} size={19} color={palette.green} strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      <View style={styles.addressForm}>
        <View style={styles.addressGpsRow}>
          <Switch
            value={gpsEnabled}
            onValueChange={handleToggleGps}
            trackColor={{ false: '#DFE5E8', true: palette.green }}
            thumbColor={palette.white}
            disabled={locating}
          />
          <RText style={styles.addressGpsLabel}>
            {locating ? 'جارٍ تحديد موقعك...' : 'تعيين الموقع الحالي'}
          </RText>
        </View>
        {locationMessage ? <RText style={styles.addressLocationMessage}>{locationMessage}</RText> : null}

        <View style={styles.addressFieldBlock}>
          <RText style={styles.authLabel}>المحافظة *</RText>
          <TouchableOpacity
            style={styles.addressInputShell}
            onPress={() => setShowGovernorateOptions((current) => !current)}
            activeOpacity={0.8}
          >
            <AppIcon icon={Icons.ChevronDown} size={18} color={palette.amber} />
            <RText style={[styles.addressInputValue, !form.governorate && styles.addressInputPlaceholder]}>
              {form.governorate || 'اختر المحافظة'}
            </RText>
            <AppIcon icon={Icons.MapPin} size={19} color={palette.green} />
          </TouchableOpacity>
          {showGovernorateOptions ? (
            <View style={styles.addressSelectOptions}>
              {SYRIAN_GOVERNORATES.map((governorate) => (
                <TouchableOpacity
                  key={governorate}
                  style={[styles.addressSelectOption, form.governorate === governorate && styles.addressSelectOptionActive]}
                  onPress={() => {
                    update('governorate')(governorate);
                    setShowGovernorateOptions(false);
                  }}
                >
                  <RText
                    style={[
                      styles.addressSelectOptionText,
                      form.governorate === governorate && styles.addressSelectOptionTextActive,
                    ]}
                  >
                    {governorate}
                  </RText>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.addressFieldBlock}>
          <RText style={styles.authLabel}>رقم الهاتف *</RText>
          <View style={styles.addressInputShell}>
            <TextInput
              style={styles.addressInput}
              value={form.phone}
              onChangeText={update('phone')}
              placeholder="09XXXXXXXX"
              placeholderTextColor="#A2ABB4"
              keyboardType="phone-pad"
              textAlign="right"
            />
            <AppIcon icon={Icons.Phone} size={19} color={palette.green} />
          </View>
        </View>

        <View style={styles.addressFieldBlock}>
          <RText style={styles.authLabel}>المنطقة *</RText>
          <View style={styles.addressInputShell}>
            <TextInput
              style={styles.addressInput}
              value={form.area}
              onChangeText={update('area')}
              placeholder="مثال: المزة"
              placeholderTextColor="#A2ABB4"
              textAlign="right"
            />
            <AppIcon icon={Icons.MapPin} size={19} color={palette.green} />
          </View>
        </View>

        <View style={styles.addressFieldBlock}>
          <RText style={styles.authLabel}>الشارع *</RText>
          <View style={styles.addressInputShell}>
            <TextInput
              style={styles.addressInput}
              value={form.street}
              onChangeText={update('street')}
              placeholder="اسم الشارع"
              placeholderTextColor="#A2ABB4"
              textAlign="right"
            />
            <AppIcon icon={Icons.Signpost || Icons.MapPin} size={19} color={palette.green} />
          </View>
        </View>

        <View style={styles.addressFieldRow}>
          <View style={[styles.addressFieldBlock, styles.addressFieldHalf]}>
            <RText style={styles.authLabel}>البناء</RText>
            <View style={styles.addressInputShell}>
              <TextInput
                style={styles.addressInput}
                value={form.building}
                onChangeText={update('building')}
                placeholder="رقم البناء"
                placeholderTextColor="#A2ABB4"
                textAlign="right"
              />
            </View>
          </View>
          <View style={[styles.addressFieldBlock, styles.addressFieldHalf]}>
            <RText style={styles.authLabel}>الطابق</RText>
            <View style={styles.addressInputShell}>
              <TextInput
                style={styles.addressInput}
                value={form.floor}
                onChangeText={update('floor')}
                placeholder="الطابق"
                placeholderTextColor="#A2ABB4"
                textAlign="right"
              />
            </View>
          </View>
        </View>

        <View style={styles.addressFieldBlock}>
          <RText style={styles.authLabel}>معلومات إضافية</RText>
          <View style={[styles.addressInputShell, styles.addressTextareaShell]}>
            <TextInput
              style={[styles.addressInput, styles.addressTextarea]}
              value={form.additionalInfo}
              onChangeText={update('additionalInfo')}
              placeholder="أي تفاصيل تساعد المندوب (اختياري)"
              placeholderTextColor="#A2ABB4"
              multiline
              textAlign="right"
              textAlignVertical="top"
            />
          </View>
        </View>

        {error ? <RText style={styles.addressFormError}>{error}</RText> : null}

        <TouchableOpacity
          style={[styles.addressSaveButton, !canSave && styles.addressSaveButtonDisabled]}
          onPress={submit}
          disabled={!canSave}
          activeOpacity={0.85}
        >
          <RText style={styles.addressSaveText}>{saving ? 'جارٍ الحفظ...' : 'حفظ'}</RText>
        </TouchableOpacity>
      </View>
    </ScreenScroll>
  );
}

/* =============================== Coupons ================================ */

const COUPON_TABS = [
  { key: 'all', label: 'الكل' },
  { key: 'app', label: 'كوبونات التطبيق' },
  { key: 'stores', label: 'كوبونات المتاجر' },
];

function couponStateOf(coupon, now = new Date()) {
  if (coupon.raw?.status === 'DISABLED') return 'disabled';
  if (coupon.raw?.startsAt && new Date(coupon.raw.startsAt).getTime() > now.getTime()) return 'upcoming';
  if (coupon.raw?.endsAt && new Date(coupon.raw.endsAt).getTime() < now.getTime()) return 'expired';
  const usageLimit = Number(coupon.raw?.usageLimit ?? NaN);
  const usedCount = Number(coupon.raw?.usedCount ?? 0);
  if (Number.isFinite(usageLimit) && usedCount >= usageLimit) return 'used';
  if (coupon.raw?.status === 'EXPIRED') return 'expired';
  return 'active';
}

export function CouponsTicketCard({ coupon, state = 'active', onCopy }) {
  const disabled = state !== 'active';
  const colors = [palette.green, palette.amber];
  const background = disabled ? '#EDEFF1' : colors[(coupon.colorIndex || 0) % colors.length];

  return (
    <View style={[styles.couponTicket, disabled && styles.couponTicketDisabled, { backgroundColor: background }]}>
      <View style={styles.couponTicketCutTop} />
      <View style={styles.couponTicketCutBottom} />
      <RText style={[styles.couponTicketValue, disabled && styles.couponTicketValueDisabled]}>
        {coupon.label || '-'}
      </RText>
      <RText style={[styles.couponTicketCode, disabled && styles.couponTicketCodeDisabled]}>
        كود: {coupon.code}
      </RText>
      <View style={[styles.couponTicketDivider, disabled && styles.couponTicketDividerDisabled]} />
      {disabled ? (
        <View style={[styles.couponTicketAction, styles.couponTicketActionDisabled]}>
          <RText style={[styles.couponTicketActionText, styles.couponTicketActionTextDisabled]}>
            {state === 'used' ? 'مستعمل' : 'منتهي'}
          </RText>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.couponTicketAction}
          onPress={() => onCopy?.(coupon)}
          activeOpacity={0.8}
        >
          <RText style={styles.couponTicketActionText}>نسخ</RText>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function CouponsScreen({
  coupons = [],
  loading = false,
  error = '',
  onRetry,
  onBack,
  onCopyCoupon,
  onGetCoupon,
  onUseInCart,
}) {
  const [activeTab, setActiveTab] = useState('all');

  const visibleCoupons = useMemo(() => {
    const now = new Date();
    return coupons
      .map((coupon, index) => ({ ...coupon, state: couponStateOf(coupon, now), colorIndex: index }))
      .filter((coupon) => {
        if (coupon.state === 'upcoming') return false;
        if (activeTab === 'all') return true;
        if (activeTab === 'app') return coupon.scope === 'platform';
        return coupon.scope === 'store';
      });
  }, [coupons, activeTab]);

  const activeCoupons = visibleCoupons.filter((coupon) => coupon.state === 'active');
  const pastCoupons = visibleCoupons.filter((coupon) => coupon.state !== 'active');

  return (
    <ScreenScroll>
      <View style={styles.couponHeader}>
        <View style={styles.detailsTopButton} />
        <RText style={styles.detailsHeaderTitle}>كوبوناتي</RText>
        <TouchableOpacity style={styles.addressBackOutline} onPress={onBack}>
          <AppIcon icon={Icons.ChevronRight} size={19} color={palette.green} strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      <View style={styles.couponTabs}>
        {COUPON_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.couponTab}
            onPress={() => setActiveTab(tab.key)}
          >
            <RText style={[styles.couponTabText, activeTab === tab.key && styles.couponTabTextActive]}>
              {tab.label}
            </RText>
            {activeTab === tab.key ? <View style={styles.couponTabUnderline} /> : null}
          </TouchableOpacity>
        ))}
      </View>

      {loading && !coupons.length ? (
        <RText style={styles.collectionEmpty}>جارٍ تحميل الكوبونات...</RText>
      ) : error && !coupons.length ? (
        <>
          <RText style={styles.collectionEmpty}>تعذر تحميل الكوبونات</RText>
          <TouchableOpacity style={styles.addressRetryButton} onPress={onRetry}>
            <RText style={styles.addressRetryText}>إعادة المحاولة</RText>
          </TouchableOpacity>
        </>
      ) : visibleCoupons.length ? (
        <>
          <View style={styles.couponGrid}>
            {activeCoupons.map((coupon) => (
              <View key={`coupon-${coupon.id}`} style={styles.couponTicketWrap}>
                <CouponsTicketCard coupon={coupon} state={coupon.state} onCopy={onCopyCoupon} />
                {onUseInCart ? (
                  <TouchableOpacity
                    style={styles.couponUseInCartButton}
                    onPress={() => onUseInCart(coupon)}
                    activeOpacity={0.85}
                  >
                    <RText style={styles.couponUseInCartText}>استخدام في السلة</RText>
                  </TouchableOpacity>
                ) : null}
              </View>
            ))}
          </View>
          {pastCoupons.length ? (
            <>
              <RText style={styles.couponSectionMuted}>غير متاحة</RText>
              <View style={styles.couponGrid}>
                {pastCoupons.map((coupon) => (
                  <CouponsTicketCard key={`coupon-used-${coupon.id}`} coupon={coupon} state={coupon.state} />
                ))}
              </View>
            </>
          ) : null}
        </>
      ) : (
        <View style={styles.couponEmpty}>
          <Image source={couponEmptyImage} style={styles.couponEmptyImage} resizeMode="contain" />
          <RText style={styles.couponEmptyText}>لايوجد لديك كوبون</RText>
          <TouchableOpacity style={styles.couponEmptyButton} onPress={onGetCoupon} activeOpacity={0.85}>
            <RText style={styles.couponEmptyButtonText}>احصل على كوبون</RText>
          </TouchableOpacity>
        </View>
      )}
    </ScreenScroll>
  );
}
