import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { EmptyState, FilterRow, HeaderTabs, ProductThumb } from '../components/DashboardComponents';
import { formatDate, remoteImage } from '../dashboardUtils';
import { styles } from '../dashboardStyles';
import { uploadsApi } from '../../../services/api';

export default function CategoriesView({ data, canManage, onAdd, onEdit, onUpdateImage, actionBusy }) {
  return (
    <>
      <HeaderTabs active="all" onChange={() => {}} tabs={[{ key: 'all', label: `كل الأقسام ${data.categories.length}` }]} />
      <FilterRow primaryLabel={canManage ? 'إضافة قسم جديد' : null} onPrimaryPress={onAdd} filterLabel="الأحدث" />
      <View style={styles.tableCard}>
        <View style={styles.tableHeader}>
          {['القسم', 'تاريخ الإضافة'].map((item) => <Text key={item} style={styles.tableHeaderText}>{item}</Text>)}
        </View>
        {data.categories.length ? data.categories.map((category) => (
          <View key={category.id} style={styles.categoryRow}>
            <View style={styles.productEntity}>
              <ProductThumb source={remoteImage(category.imageUrl)} size={48} />
              <Text style={styles.entityName}>{category.name}</Text>
            </View>
            <Text style={styles.tableCell}>{formatDate(category.createdAt)}</Text>
            {canManage ? (
              <View style={styles.rowActionsWide}>
                <TouchableOpacity style={styles.smallActionButton} onPress={() => onEdit(category)}>
                  <Text style={styles.smallActionText}>تعديل</Text>
                </TouchableOpacity>
                <CategoryImageButton
                  category={category}
                  onUpdateImage={onUpdateImage}
                  disabled={actionBusy === `category-${category.id}`}
                />
              </View>
            ) : null}
          </View>
        )) : <EmptyState label="لا توجد أقسام بعد" />}
      </View>
    </>
  );
}

function CategoryImageButton({ category, onUpdateImage, disabled }) {
  const [uploading, setUploading] = useState(false);

  const chooseFile = () => {
    if (typeof document === 'undefined') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const uploaded = await uploadsApi.file(file, 'admin');
        await onUpdateImage(category.id, uploaded.url);
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  return (
    <TouchableOpacity
      style={[styles.smallActionButton, (uploading || disabled) && styles.buttonDisabled]}
      onPress={chooseFile}
      disabled={uploading || disabled}
    >
      <Text style={styles.smallActionText}>{uploading ? 'جاري الرفع...' : 'تغيير الصورة'}</Text>
    </TouchableOpacity>
  );
}
