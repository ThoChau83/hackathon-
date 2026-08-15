import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

export default function AdminProductForm({ product, isOpen, onClose, onSaved }) {
  const isEditing = !!product;
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    material_origin: '',
    image_url: ''
  });

  useEffect(() => {
    if (product) {
      setForm({
        title: product.title || '',
        description: product.description || '',
        price: product.price || '',
        material_origin: product.material_origin || '',
        image_url: product.image_url || ''
      });
      setImagePreview(product.image_url || '');
    } else {
      setForm({ title: '', description: '', price: '', material_origin: '', image_url: '' });
      setImagePreview('');
    }
    setImageFile(null);
  }, [product, isOpen]);

  if (!isOpen) return null;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = form.image_url;

      // Use base64 data URL from preview (no Firebase Storage needed)
      if (imageFile && imagePreview) {
        imageUrl = imagePreview;
      }

      const productData = {
        title: form.title,
        description: form.description,
        price: parseInt(form.price),
        material_origin: form.material_origin,
        image_url: imageUrl,
      };

      if (isEditing) {
        await updateDoc(doc(db, 'products', product.id), productData);
      } else {
        await addDoc(collection(db, 'products'), {
          ...productData,
          created_at: serverTimestamp()
        });
      }

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error('Error saving product:', err);
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-modal-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-t-2xl p-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">
            {isEditing ? '✏️ Sửa sản phẩm' : '➕ Thêm sản phẩm mới'}
          </h3>
          <button onClick={onClose} className="text-white/80 hover:text-white text-xl">✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">🖼️ Ảnh sản phẩm</label>
            <div
              className="border-2 border-dashed border-emerald-300 rounded-xl p-4 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-all"
              onClick={() => document.getElementById('productImageInput').click()}
            >
              <input
                type="file"
                id="productImageInput"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="max-h-40 mx-auto rounded-lg object-cover" />
              ) : (
                <div>
                  <div className="text-4xl mb-2">📷</div>
                  <p className="text-sm text-gray-500">Click để chọn ảnh</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, tối đa 5MB</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">📦 Tên sản phẩm</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="VD: Ly nhựa tái chế"
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">📝 Mô tả</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Mô tả chi tiết sản phẩm..."
              rows={3}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">💰 Giá (VNĐ)</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="VD: 50000"
                required
                min={0}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">🌱 Nguồn gốc</label>
              <input
                type="text"
                name="material_origin"
                value={form.material_origin}
                onChange={handleChange}
                placeholder="VD: Làm từ 50 chai nhựa"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg shadow-emerald-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Đang lưu...
              </>
            ) : (
              <>{isEditing ? '💾 Cập nhật' : '➕ Thêm sản phẩm'}</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
