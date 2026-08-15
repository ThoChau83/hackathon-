import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

export default function PriceTable() {
  const { isAdmin } = useAuth();
  // Default rates for demo
  const defaultRates = [
    { id: 'PET', waste_type: 'PET (Chai nhựa trong)', price_per_kg: 5000, icon: '🧴' },
    { id: 'PP', waste_type: 'PP (Nhựa cứng)', price_per_kg: 4000, icon: '🪣' },
    { id: 'HDPE', waste_type: 'HDPE (Can nhựa)', price_per_kg: 3500, icon: '🛢️' },
    { id: 'LDPE', waste_type: 'LDPE (Túi nilon)', price_per_kg: 2000, icon: '🛍️' },
    { id: 'PS', waste_type: 'PS (Hộp xốp)', price_per_kg: 1500, icon: '📦' },
  ];

  const [rates, setRates] = useState(defaultRates);
  const [editing, setEditing] = useState(false);
  const [editRates, setEditRates] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRates();
  }, []);

  async function loadRates() {
    try {
      const snapshot = await getDocs(collection(db, 'price_rates'));
      if (snapshot.empty) {
        setRates(defaultRates);
      } else {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setRates(data);
      }
    } catch {
      setRates(defaultRates);
    }
  }

  function startEditing() {
    setEditRates(rates.map(r => ({ ...r })));
    setEditing(true);
  }

  function handlePriceChange(index, value) {
    const updated = [...editRates];
    updated[index].price_per_kg = parseInt(value) || 0;
    setEditRates(updated);
  }

  async function saveRates() {
    setSaving(true);
    try {
      for (const rate of editRates) {
        await updateDoc(doc(db, 'price_rates', rate.id), {
          price_per_kg: rate.price_per_kg
        });
      }
      setRates(editRates);
      setEditing(false);
    } catch (err) {
      console.error('Error saving rates:', err);
    }
    setSaving(false);
  }

  function formatVND(num) {
    return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-emerald-100 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💰</span>
          <h3 className="text-lg font-bold text-white">Bảng giá thu mua</h3>
        </div>
        {isAdmin() && !editing && (
          <button
            onClick={startEditing}
            className="px-4 py-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg backdrop-blur-sm transition-all"
          >
            ✏️ Chỉnh sửa
          </button>
        )}
        {isAdmin() && editing && (
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-all"
            >
              ✕ Hủy
            </button>
            <button
              onClick={saveRates}
              disabled={saving}
              className="px-4 py-1.5 bg-white text-emerald-700 text-sm font-bold rounded-lg hover:bg-emerald-50 transition-all disabled:opacity-50"
            >
              {saving ? '⏳ Đang lưu...' : '✅ Lưu'}
            </button>
          </div>
        )}
      </div>

      <div className="divide-y divide-emerald-50">
        {(editing ? editRates : rates).map((rate, index) => (
          <div
            key={rate.id}
            className="flex items-center justify-between px-6 py-3.5 hover:bg-emerald-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{rate.icon || '♻️'}</span>
              <span className="font-medium text-gray-800">{rate.waste_type}</span>
            </div>
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={editRates[index].price_per_kg}
                  onChange={e => handlePriceChange(index, e.target.value)}
                  className="w-24 px-3 py-1.5 border-2 border-emerald-300 rounded-lg text-right font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <span className="text-sm text-gray-500">đ/kg</span>
              </div>
            ) : (
              <span className="font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
                {formatVND(rate.price_per_kg)}/kg
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
