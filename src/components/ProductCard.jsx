export default function ProductCard({ product, isAdmin, onEdit, onDelete, onClick }) {
  function formatVND(num) {
    return new Intl.NumberFormat('vi-VN').format(num || 0) + 'đ';
  }

  return (
    <div
      className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-emerald-100 shadow-lg overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-emerald-50">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">🌿</div>
        )}
        {/* Eco Badge */}
        <div className="absolute top-3 left-3 bg-emerald-600/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
          ♻️ Tái chế
        </div>
        {/* Admin Buttons */}
        {isAdmin && (
          <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(product); }}
              className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-blue-50 shadow-md transition-all"
              title="Sửa"
            >
              ✏️
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(product); }}
              className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-50 shadow-md transition-all"
              title="Xóa"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-lg mb-1 truncate group-hover:text-emerald-700 transition-colors">
          {product.title}
        </h3>
        {product.material_origin && (
          <p className="text-xs text-emerald-600 bg-emerald-50 inline-block px-2 py-0.5 rounded-full mb-2">
            🌱 {product.material_origin}
          </p>
        )}
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-emerald-700">{formatVND(product.price)}</span>
          <span className="text-xs text-gray-400">Xem chi tiết →</span>
        </div>
      </div>
    </div>
  );
}
