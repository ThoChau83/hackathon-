import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, onSnapshot, orderBy, query, deleteDoc, doc } from 'firebase/firestore';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import AdminProductForm from '../components/AdminProductForm';

export default function ShopTab() {
  const { currentUser, isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    // Safety timeout in case Firebase isn't configured
    const timeout = setTimeout(() => setLoading(false), 3000);

    try {
      const q = query(collection(db, 'products'), orderBy('created_at', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setProducts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
        clearTimeout(timeout);
      }, (error) => {
        console.error('Error loading products:', error);
        setLoading(false);
        clearTimeout(timeout);
      });
      return () => { unsubscribe(); clearTimeout(timeout); };
    } catch {
      setLoading(false);
      clearTimeout(timeout);
    }
  }, []);

  function handleCardClick(product) {
    setSelectedProduct(product);
    setShowProductModal(true);
  }

  function handleEdit(product) {
    setEditingProduct(product);
    setShowAdminForm(true);
  }

  async function handleDelete(product) {
    if (!window.confirm(`Xóa sản phẩm "${product.title}"?`)) return;
    try {
      await deleteDoc(doc(db, 'products', product.id));
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  }

  function handleAddNew() {
    setEditingProduct(null);
    setShowAdminForm(true);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full text-sm font-medium text-emerald-700 mb-4">
          <span>🌿</span>
          <span>Sản phẩm bền vững</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          Cửa Hàng Sản Phẩm <span className="text-emerald-600">Xanh</span>
        </h2>
        <p className="text-gray-500 max-w-lg mx-auto">
          Sản phẩm chất lượng làm từ nhựa tái chế. Mỗi sản phẩm là một bước tiến cho môi trường.
        </p>
      </div>

      {/* Admin: Add Product Button */}
      {currentUser && isAdmin() && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👑</span>
            <div>
              <p className="font-bold text-amber-800">Quản lý sản phẩm</p>
              <p className="text-sm text-amber-600">{products.length} sản phẩm trong kho</p>
            </div>
          </div>
          <button
            onClick={handleAddNew}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2"
          >
            ➕ Thêm sản phẩm mới
          </button>
        </div>
      )}

      {/* Product Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white/80 rounded-2xl border border-emerald-100">
          <div className="text-6xl mb-4">🌱</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Chưa có sản phẩm nào</h3>
          <p className="text-gray-500">
            {isAdmin() ? 'Bấm "Thêm sản phẩm mới" để bắt đầu' : 'Sản phẩm sẽ sớm được cập nhật'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              isAdmin={isAdmin()}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onClick={() => handleCardClick(product)}
            />
          ))}
        </div>
      )}

      {/* Product Detail Modal (User) */}
      <ProductModal
        product={selectedProduct}
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
      />

      {/* Admin Product Form Modal */}
      <AdminProductForm
        product={editingProduct}
        isOpen={showAdminForm}
        onClose={() => { setShowAdminForm(false); setEditingProduct(null); }}
        onSaved={() => {}}
      />
    </div>
  );
}
