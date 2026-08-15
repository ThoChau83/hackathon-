import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';

export default function PickupForm({ onSubmitted }) {
  const { currentUser, userProfile } = useAuth();
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    store_name: '',
    phone: '',
    address: '',
    waste_type: '',
    estimated_weight: '',
    pickup_date: ''
  });

  useEffect(() => {
    // Pre-fill from user profile
    if (userProfile) {
      setForm(prev => ({
        ...prev,
        store_name: userProfile.store_name || '',
        phone: userProfile.phone || '',
        address: userProfile.address || ''
      }));
    }
    loadRates();
  }, [userProfile]);

  async function loadRates() {
    try {
      const snapshot = await getDocs(collection(db, 'price_rates'));
      if (!snapshot.empty) {
        setRates(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      } else {
        setRates([
          { id: 'PET', waste_type: 'PET (Chai nhựa trong)', price_per_kg: 5000 },
          { id: 'PP', waste_type: 'PP (Nhựa cứng)', price_per_kg: 4000 },
          { id: 'HDPE', waste_type: 'HDPE (Can nhựa)', price_per_kg: 3500 },
          { id: 'LDPE', waste_type: 'LDPE (Túi nilon)', price_per_kg: 2000 },
          { id: 'PS', waste_type: 'PS (Hộp xốp)', price_per_kg: 1500 },
        ]);
      }
    } catch {
      setRates([
        { id: 'PET', waste_type: 'PET (Chai nhựa trong)', price_per_kg: 5000 },
        { id: 'PP', waste_type: 'PP (Nhựa cứng)', price_per_kg: 4000 },
      ]);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    try {
      const selectedRate = rates.find(r => r.id === form.waste_type);
      await addDoc(collection(db, 'pickup_requests'), {
        user_id: currentUser.uid,
        store_name: form.store_name,
        phone: form.phone,
        address: form.address,
        waste_type: form.waste_type,
        waste_type_label: selectedRate?.waste_type || form.waste_type,
        estimated_weight: parseFloat(form.estimated_weight),
        actual_weight: null,
        unit_price: selectedRate?.price_per_kg || 0,
        total_payout: 0,
        payment_status: 'unpaid',
        status: 'pending',
        pickup_date: form.pickup_date,
        created_at: serverTimestamp()
      });

      setSuccess(true);
      setForm(prev => ({ ...prev, waste_type: '', estimated_weight: '', pickup_date: '' }));
      if (onSubmitted) onSubmitted();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error creating pickup request:', err);
    }
    setLoading(false);
  }

  // Get tomorrow as min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-emerald-100 shadow-lg p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-xl">📅</div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Đặt lịch thu gom</h3>
          <p className="text-sm text-gray-500">Điền thông tin để đặt lịch</p>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-4 mb-4 flex items-center gap-2 animate-fade-in">
          <span className="text-xl">✅</span>
          <span className="font-medium">Đặt lịch thành công! Chúng tôi sẽ liên hệ xác nhận.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">🏪 Tên quán</label>
            <input
              type="text"
              name="store_name"
              value={form.store_name}
              onChange={handleChange}
              placeholder="VD: Cà phê Xanh"
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">📱 Số điện thoại</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="0912 345 678"
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">📍 Địa chỉ thu gom</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="123 Nguyễn Huệ, Q1, TP.HCM"
            required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">♻️ Loại rác</label>
            <select
              name="waste_type"
              value={form.waste_type}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
            >
              <option value="">-- Chọn loại --</option>
              {rates.map(r => (
                <option key={r.id} value={r.id}>{r.waste_type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">⚖️ Khối lượng ước tính (kg)</label>
            <input
              type="number"
              name="estimated_weight"
              value={form.estimated_weight}
              onChange={handleChange}
              placeholder="VD: 10"
              min="0.5"
              step="0.5"
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">📆 Ngày hẹn</label>
            <input
              type="date"
              name="pickup_date"
              value={form.pickup_date}
              onChange={handleChange}
              min={minDate}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
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
              Đang gửi...
            </>
          ) : (
            <>🚛 Đặt lịch thu gom</>
          )}
        </button>
      </form>
    </div>
  );
}
