import { useEffect, useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import * as Icons from '../../../../icons';
import { formatSyp } from '../dashboardUtils';
import { palette, styles } from '../dashboardStyles';

const createTitles = {
  store: 'إضافة متجر جديد',
  subscription: 'تغيير باقة المتجر',
  product: 'إضافة منتج جديد',
  reel: 'رفع ريل جديد',
  coupon: 'إضافة كوبون',
  category: 'إضافة قسم',
  banner: 'إضافة بنر للرئيسية',
  package: 'إضافة باقة جديدة',
};

function initialCreateForm(type) {
  if (type === 'store') return { ownerFirstName: '', ownerLastName: '', ownerPhone: '', ownerPassword: '', storeName: '', description: '', logoUrl: '', bannerUrl: '', openingTime: '', closingTime: '', packageId: '' };
  if (type === 'subscription') return { packageId: '' };
  if (type === 'product') return { name: '', description: '', price: '', stock: '', imageUrl: '', categoryId: '', status: 'DRAFT' };
  if (type === 'reel') return { title: '', videoUrl: '', thumbnailUrl: '', productId: '', status: 'DRAFT' };
  if (type === 'coupon') return { code: '', type: 'PERCENT', value: '', minOrderAmount: '', maxDiscountAmount: '', endsAt: '', usageLimit: '' };
  if (type === 'category') return { name: '', imageUrl: '' };
  if (type === 'banner') return { title: '', subtitle: '', imageUrl: '', ctaLabel: '', targetUrl: '', productId: '', position: '0', status: 'ACTIVE' };
  if (type === 'package') return { name: '', price: '', durationDays: '30', maxProducts: '', maxReels: '', maxCoupons: '', isActive: true };
  return {};
}

function CreateEntityModal({ type, data, saving, onClose, onSubmit, initialData, FormField, ChoiceField, UploadField, ProductThumb, SwitchControl, Icon }) {
  const [form, setForm] = useState(() => initialData || initialCreateForm(type));
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setForm(initialData || initialCreateForm(type));
    setFormError('');
  }, [type, initialData]);

  if (!type) return null;

  const setValue = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));
  const title = initialData && type === 'category' ? 'تعديل القسم' : createTitles[type];

  const submit = async () => {
    setFormError('');
    try {
      if (type === 'store') {
        if (!form.storeName.trim() || !form.ownerFirstName.trim() || !form.ownerLastName.trim() || !form.ownerPhone.trim() || !form.ownerPassword) {
          throw new Error('اسم المتجر واسم صاحب المتجر ورقم الهاتف وكلمة المرور حقول مطلوبة.');
        }
        if (!form.packageId) throw new Error('اختر باقة للمتجر.');
        if (form.ownerPassword.length < 8) throw new Error('كلمة المرور يجب أن تكون 8 أحرف على الأقل.');
        await onSubmit({
          storeName: form.storeName.trim(),
          ownerFirstName: form.ownerFirstName.trim(),
          ownerLastName: form.ownerLastName.trim(),
          ownerPhone: form.ownerPhone.trim(),
          ownerPassword: form.ownerPassword,
          description: form.description.trim() || undefined,
          logoUrl: form.logoUrl.trim() || undefined,
          bannerUrl: form.bannerUrl.trim() || undefined,
          openingTime: form.openingTime.trim() || undefined,
          closingTime: form.closingTime.trim() || undefined,
          packageId: form.packageId,
        });
      } else if (type === 'subscription') {
        if (!form.packageId) throw new Error('اختر الباقة الجديدة.');
        await onSubmit({ packageId: form.packageId });
      } else if (type === 'product') {
        if (!form.name.trim() || form.price === '' || form.stock === '') throw new Error('اسم المنتج والسعر والمخزون حقول مطلوبة.');
        await onSubmit({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          price: Number(form.price),
          stock: Number(form.stock),
          categoryId: form.categoryId || undefined,
          status: form.status,
          imageUrls: form.imageUrl.trim() ? [form.imageUrl.trim()] : [],
        });
      } else if (type === 'reel') {
        if (!form.title.trim() || !form.videoUrl.trim()) throw new Error('عنوان الريل وملف الفيديو مطلوبان.');
        await onSubmit({
          title: form.title.trim(),
          videoUrl: form.videoUrl.trim(),
          thumbnailUrl: form.thumbnailUrl.trim() || undefined,
          productId: form.productId || undefined,
          status: form.status,
        });
      } else if (type === 'coupon') {
        if (!form.code.trim() || form.value === '') throw new Error('رمز الكوبون وقيمة الخصم مطلوبان.');
        if (form.endsAt && Number.isNaN(new Date(`${form.endsAt}T23:59:59`).getTime())) throw new Error('تاريخ الانتهاء غير صالح. استخدم YYYY-MM-DD.');
        await onSubmit({
          code: form.code.trim(),
          type: form.type,
          value: Number(form.value),
          minOrderAmount: form.minOrderAmount === '' ? undefined : Number(form.minOrderAmount),
          maxDiscountAmount: form.maxDiscountAmount === '' ? undefined : Number(form.maxDiscountAmount),
          endsAt: form.endsAt ? new Date(`${form.endsAt}T23:59:59`).toISOString() : undefined,
          usageLimit: form.usageLimit === '' ? undefined : Number(form.usageLimit),
        });
      } else if (type === 'category') {
        if (!form.name.trim()) throw new Error('اسم القسم مطلوب.');
        await onSubmit({
          name: form.name.trim(),
          imageUrl: form.imageUrl.trim() || undefined,
        });
      } else if (type === 'banner') {
        if (!form.title.trim() || !form.imageUrl.trim()) throw new Error('عنوان البنر والصورة مطلوبان.');
        await onSubmit({
          title: form.title.trim(),
          subtitle: form.subtitle.trim() || undefined,
          imageUrl: form.imageUrl.trim(),
          ctaLabel: form.ctaLabel.trim() || undefined,
          targetUrl: form.targetUrl.trim() || undefined,
          productId: form.productId || undefined,
          position: Number(form.position || 0),
          status: form.status,
        });
      } else if (type === 'package') {
        if (!form.name.trim() || form.price === '' || form.durationDays === '' || form.maxProducts === '' || form.maxReels === '' || form.maxCoupons === '') {
          throw new Error('جميع بيانات الباقة مطلوبة.');
        }
        await onSubmit({
          name: form.name.trim(),
          price: Number(form.price),
          durationDays: Number(form.durationDays),
          maxProducts: Number(form.maxProducts),
          maxReels: Number(form.maxReels),
          maxCoupons: Number(form.maxCoupons),
          isActive: form.isActive,
        });
      }
    } catch (submitError) {
      setFormError(submitError.message || 'تعذر حفظ البيانات.');
    }
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.modalClose} onPress={onClose} disabled={saving}>
              <Icon glyph={Icons.X} color={palette.ink} size={22} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{title}</Text>
          </View>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
            {type === 'store' ? (
              <>
                <Text style={styles.formSectionTitle}>بيانات المتجر</Text>
                <FormField label="اسم المتجر *" value={form.storeName} onChangeText={setValue('storeName')} placeholder="اسم المتجر" />
                <FormField label="وصف المتجر" value={form.description} onChangeText={setValue('description')} placeholder="نبذة عن المتجر" multiline />
                <View style={styles.formColumns}>
                  <UploadField label="شعار المتجر" value={form.logoUrl} onChange={setValue('logoUrl')} onError={setFormError} area="admin" />
                  <UploadField label="غلاف المتجر" value={form.bannerUrl} onChange={setValue('bannerUrl')} onError={setFormError} area="admin" />
                </View>
                <View style={styles.formColumns}>
                  <FormField label="وقت الفتح" value={form.openingTime} onChangeText={setValue('openingTime')} placeholder="09:00" />
                  <FormField label="وقت الإغلاق" value={form.closingTime} onChangeText={setValue('closingTime')} placeholder="23:00" />
                </View>
                <Text style={styles.formSectionTitle}>حساب صاحب المتجر</Text>
                <View style={styles.formColumns}>
                  <FormField label="الاسم الأول *" value={form.ownerFirstName} onChangeText={setValue('ownerFirstName')} placeholder="الاسم الأول" />
                  <FormField label="اسم العائلة *" value={form.ownerLastName} onChangeText={setValue('ownerLastName')} placeholder="اسم العائلة" />
                </View>
                <View style={styles.formColumns}>
                  <FormField label="رقم الهاتف *" value={form.ownerPhone} onChangeText={setValue('ownerPhone')} placeholder="09xxxxxxxx" keyboardType="phone-pad" />
                </View>
                <FormField label="كلمة المرور المؤقتة *" value={form.ownerPassword} onChangeText={setValue('ownerPassword')} placeholder="8 أحرف على الأقل" />
                <ChoiceField
                  label="باقة المتجر *"
                  value={form.packageId}
                  onChange={setValue('packageId')}
                  options={data.packages.filter((item) => item.isActive).map((item) => ({ value: item.id, label: `${item.name} · ${item.maxProducts} منتج · ${item.maxReels} ريل` }))}
                />
              </>
            ) : null}

            {type === 'subscription' ? (
              <ChoiceField
                label="اختر الباقة الجديدة"
                value={form.packageId}
                onChange={setValue('packageId')}
                options={data.packages.filter((item) => item.isActive).map((item) => ({ value: item.id, label: `${item.name} · ${formatSyp(item.price)} · ${item.durationDays} يوم` }))}
              />
            ) : null}

            {type === 'product' ? (
              <>
                <FormField label="اسم المنتج *" value={form.name} onChangeText={setValue('name')} placeholder="مثال: سماعات لاسلكية" />
                <View style={styles.formColumns}>
                  <FormField label="السعر بالليرة *" value={form.price} onChangeText={setValue('price')} placeholder="0" keyboardType="numeric" />
                  <FormField label="المخزون *" value={form.stock} onChangeText={setValue('stock')} placeholder="0" keyboardType="numeric" />
                </View>
                <FormField label="الوصف" value={form.description} onChangeText={setValue('description')} placeholder="وصف واضح للمنتج" multiline />
                <UploadField label="صورة المنتج" value={form.imageUrl} onChange={setValue('imageUrl')} onError={setFormError} area="merchant" />
                <ChoiceField label="القسم" value={form.categoryId} onChange={setValue('categoryId')} options={[{ value: '', label: 'بدون قسم' }, ...data.categories.map((item) => ({ value: item.id, label: item.name }))]} />
                <ChoiceField label="حالة المنتج" value={form.status} onChange={setValue('status')} options={[{ value: 'DRAFT', label: 'مسودة' }, { value: 'ACTIVE', label: 'منشور' }]} />
              </>
            ) : null}

            {type === 'reel' ? (
              <>
                <FormField label="عنوان الريل *" value={form.title} onChangeText={setValue('title')} placeholder="عنوان قصير" />
                <UploadField label="ملف الفيديو *" value={form.videoUrl} onChange={setValue('videoUrl')} onError={setFormError} accept="video/*" area="merchant" />
                <UploadField label="صورة الغلاف" value={form.thumbnailUrl} onChange={setValue('thumbnailUrl')} onError={setFormError} area="merchant" />
                <ChoiceField label="المنتج المرتبط" value={form.productId} onChange={setValue('productId')} options={[{ value: '', label: 'بدون منتج' }, ...data.products.map((item) => ({ value: item.id, label: item.name }))]} />
                <ChoiceField label="حالة الريل" value={form.status} onChange={setValue('status')} options={[{ value: 'DRAFT', label: 'مسودة' }, { value: 'ACTIVE', label: 'منشور' }]} />
              </>
            ) : null}

            {type === 'coupon' ? (
              <>
                <FormField label="رمز الكوبون *" value={form.code} onChangeText={setValue('code')} placeholder="KHAN20" />
                <ChoiceField label="نوع الخصم" value={form.type} onChange={setValue('type')} options={[{ value: 'PERCENT', label: 'نسبة مئوية' }, { value: 'FIXED', label: 'مبلغ ثابت' }]} />
                <View style={styles.formColumns}>
                  <FormField label="قيمة الخصم *" value={form.value} onChangeText={setValue('value')} placeholder="0" keyboardType="numeric" />
                  <FormField label="الحد الأدنى للطلب" value={form.minOrderAmount} onChangeText={setValue('minOrderAmount')} placeholder="اختياري" keyboardType="numeric" />
                </View>
                <View style={styles.formColumns}>
                  <FormField label="أقصى خصم" value={form.maxDiscountAmount} onChangeText={setValue('maxDiscountAmount')} placeholder="اختياري" keyboardType="numeric" />
                  <FormField label="عدد مرات الاستخدام" value={form.usageLimit} onChangeText={setValue('usageLimit')} placeholder="اختياري" keyboardType="numeric" />
                </View>
                <FormField label="تاريخ الانتهاء" value={form.endsAt} onChangeText={setValue('endsAt')} placeholder="YYYY-MM-DD" />
              </>
            ) : null}

            {type === 'category' ? (
              <>
                <FormField label="اسم القسم *" value={form.name} onChangeText={setValue('name')} placeholder="مثال: إلكترونيات" />
                <UploadField label="صورة القسم" value={form.imageUrl} onChange={setValue('imageUrl')} onError={setFormError} area="admin" />
              </>
            ) : null}

            {type === 'banner' ? (
              <>
                <FormField label="عنوان البنر *" value={form.title} onChangeText={setValue('title')} placeholder="مثال: عروض نهاية الأسبوع" />
                <FormField label="وصف البنر" value={form.subtitle} onChangeText={setValue('subtitle')} placeholder="نص قصير يظهر داخل البنر" multiline />
                <UploadField label="صورة البنر *" value={form.imageUrl} onChange={setValue('imageUrl')} onError={setFormError} area="admin" />
                <View style={styles.formColumns}>
                  <FormField label="نص الزر" value={form.ctaLabel} onChangeText={setValue('ctaLabel')} placeholder="اكتشف الآن" />
                  <FormField label="الترتيب" value={form.position} onChangeText={setValue('position')} placeholder="0" keyboardType="numeric" />
                </View>
                <FormField label="رابط اختياري" value={form.targetUrl} onChangeText={setValue('targetUrl')} placeholder="https://..." />
                <ChoiceField label="منتج مرتبط" value={form.productId} onChange={setValue('productId')} options={[{ value: '', label: 'بدون منتج' }, ...data.products.map((item) => ({ value: item.id, label: item.name }))]} />
                <ChoiceField label="حالة البنر" value={form.status} onChange={setValue('status')} options={[{ value: 'ACTIVE', label: 'فعال' }, { value: 'INACTIVE', label: 'متوقف' }]} />
              </>
            ) : null}

            {type === 'package' ? (
              <>
                <FormField label="اسم الباقة *" value={form.name} onChangeText={setValue('name')} placeholder="مثال: الباقة الاحترافية" />
                <View style={styles.formColumns}>
                  <FormField label="السعر بالليرة *" value={form.price} onChangeText={setValue('price')} placeholder="0" keyboardType="numeric" />
                  <FormField label="مدة الاشتراك بالأيام *" value={form.durationDays} onChangeText={setValue('durationDays')} placeholder="30" keyboardType="numeric" />
                </View>
                <Text style={styles.formSectionTitle}>حدود استخدام الباقة</Text>
                <View style={styles.formColumns}>
                  <FormField label="عدد المنتجات *" value={form.maxProducts} onChangeText={setValue('maxProducts')} placeholder="0" keyboardType="numeric" />
                  <FormField label="عدد الريلز *" value={form.maxReels} onChangeText={setValue('maxReels')} placeholder="0" keyboardType="numeric" />
                </View>
                <FormField label="عدد الكوبونات *" value={form.maxCoupons} onChangeText={setValue('maxCoupons')} placeholder="0" keyboardType="numeric" />
                <View style={styles.packageActiveRow}>
                  <SwitchControl active={form.isActive} onPress={() => setValue('isActive')(!form.isActive)} />
                  <View>
                    <Text style={styles.formLabel}>الباقة متاحة للاشتراك</Text>
                    <Text style={styles.mutedSmall}>عند تعطيلها تبقى الاشتراكات الحالية كما هي، ولا يمكن تعيينها لمتجر جديد.</Text>
                  </View>
                </View>
              </>
            ) : null}

            {formError ? <Text style={styles.formError}>{formError}</Text> : null}
          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={saving}>
              <Text style={styles.cancelButtonText}>إلغاء</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveButton, saving && styles.buttonDisabled]} onPress={submit} disabled={saving}>
              <Icon glyph={Icons.Check} color="#FFFFFF" size={20} />
              <Text style={styles.saveButtonText}>{saving ? 'جارٍ الحفظ...' : 'حفظ'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default CreateEntityModal;
