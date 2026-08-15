export default function ProductModal({ product, isOpen, onClose }) {
  if (!isOpen || !product) return null;

  function formatVND(num) {
    return new Intl.NumberFormat('vi-VN').format(num || 0) + 'đ';
  }

  const zaloLink = `https://zalo.me/01234567`;
  const hotline = '01234567';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-modal-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative h-64 overflow-hidden rounded-t-2xl bg-emerald-50">
          {product.image_url ? (
            <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl">🌿</div>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-black/30 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/50 transition-all text-lg"
          >
            ✕
          </button>
          <div className="absolute bottom-4 left-4 bg-emerald-600/90 backdrop-blur-sm text-white text-sm font-bold px-3 py-1.5 rounded-full">
            ♻️ Sản phẩm xanh
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{product.title}</h2>

          {product.material_origin && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4">
              <p className="text-sm text-emerald-700 flex items-center gap-2">
                <span className="text-lg">🌱</span>
                <span className="font-medium">Nguồn gốc: {product.material_origin}</span>
              </p>
            </div>
          )}

          <p className="text-gray-600 leading-relaxed mb-4">{product.description}</p>

          <div className="flex items-center gap-2 mb-6">
            <span className="text-3xl font-bold text-emerald-700">{formatVND(product.price)}</span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <a
              href={zaloLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              💬 Chat Zalo
            </a>
            <a
              href={`tel:${hotline}`}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
            >
              📞 Gọi Hotline: {hotline}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
