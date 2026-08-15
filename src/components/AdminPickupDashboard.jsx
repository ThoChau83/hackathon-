import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';

export default function AdminPickupDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [actualWeight, setActualWeight] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'pickup_requests'),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (error) => {
      console.error('Error loading requests:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  function formatVND(num) {
    return new Intl.NumberFormat('vi-VN').format(num || 0) + 'đ';
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    if (dateStr.toDate) return dateStr.toDate().toLocaleDateString('vi-VN');
    return new Date(dateStr).toLocaleDateString('vi-VN');
  }

  async function handleConfirmPayment(req) {
    if (!actualWeight || parseFloat(actualWeight) <= 0) return;
    setSaving(true);

    const weight = parseFloat(actualWeight);
    const totalPayout = weight * (req.unit_price || 0);

    try {
      await updateDoc(doc(db, 'pickup_requests', req.id), {
        actual_weight: weight,
        total_payout: totalPayout,
        status: 'completed',
        payment_status: 'paid'
      });
      setEditingId(null);
      setActualWeight('');
    } catch (err) {
      console.error('Error updating request:', err);
    }
    setSaving(false);
  }

  async function handleConfirmPickup(reqId) {
    try {
      await updateDoc(doc(db, 'pickup_requests', reqId), {
        status: 'confirmed'
      });
    } catch (err) {
      console.error('Error confirming:', err);
    }
  }

  async function handleCancel(reqId) {
    try {
      await updateDoc(doc(db, 'pickup_requests', reqId), {
        status: 'cancelled'
      });
    } catch (err) {
      console.error('Error cancelling:', err);
    }
  }

  const filteredRequests = filter === 'all'
    ? requests
    : requests.filter(r => r.status === filter);

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    confirmed: requests.filter(r => r.status === 'confirmed').length,
    completed: requests.filter(r => r.status === 'completed').length,
    totalPayout: requests.filter(r => r.payment_status === 'paid').reduce((s, r) => s + (r.total_payout || 0), 0),
    totalWeight: requests.filter(r => r.actual_weight).reduce((s, r) => s + r.actual_weight, 0),
  };

  if (loading) {
    return (
      <div className="bg-white/80 rounded-2xl p-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-gray-500">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Tổng đơn', value: stats.total, icon: '📊', color: 'from-blue-500 to-indigo-500' },
          { label: 'Chờ xử lý', value: stats.pending, icon: '⏳', color: 'from-yellow-500 to-orange-500' },
          { label: 'Đã thu gom', value: `${stats.totalWeight} kg`, icon: '⚖️', color: 'from-emerald-500 to-teal-500' },
          { label: 'Đã chi trả', value: formatVND(stats.totalPayout), icon: '💰', color: 'from-purple-500 to-pink-500' },
        ].map((stat, i) => (
          <div key={i} className={`bg-gradient-to-br ${stat.color} rounded-xl p-4 text-white shadow-lg`}>
            <div className="flex items-center justify-between">
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className="text-xl font-bold mt-2">{stat.value}</p>
            <p className="text-sm opacity-80">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'Tất cả', count: stats.total },
          { key: 'pending', label: 'Chờ xử lý', count: stats.pending },
          { key: 'confirmed', label: 'Đã xác nhận', count: stats.confirmed },
          { key: 'completed', label: 'Hoàn thành', count: stats.completed },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f.key
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-emerald-50 border border-gray-200'
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Requests Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-emerald-100 shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-emerald-50">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            🔧 Quản lý đơn thu gom
          </h3>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="p-10 text-center text-gray-500">Không có đơn nào</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredRequests.map(req => (
              <div key={req.id} className="p-5 hover:bg-emerald-50/20 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="font-bold text-gray-800">🏪 {req.store_name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        req.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        req.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {req.status === 'pending' ? '⏳ Chờ' : req.status === 'confirmed' ? '✔️ Đã xác nhận' : req.status === 'completed' ? '✅ Hoàn thành' : '❌ Hủy'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm text-gray-600">
                      <p>📱 {req.phone}</p>
                      <p>📍 {req.address}</p>
                      <p>♻️ {req.waste_type_label || req.waste_type} — Ước tính: {req.estimated_weight} kg</p>
                      <p>📆 Ngày hẹn: {req.pickup_date} • Tạo: {formatDate(req.created_at)}</p>
                      {req.actual_weight && <p>⚖️ Thực tế: {req.actual_weight} kg → 💰 {formatVND(req.total_payout)}</p>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleConfirmPickup(req.id)}
                          className="flex-1 py-2 px-3 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-all"
                        >
                          ✔️ Xác nhận
                        </button>
                        <button
                          onClick={() => handleCancel(req.id)}
                          className="py-2 px-3 bg-red-100 text-red-600 text-sm font-medium rounded-lg hover:bg-red-200 transition-all"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    {(req.status === 'confirmed' || req.status === 'pending') && req.status !== 'completed' && (
                      editingId === req.id ? (
                        <div className="space-y-2 bg-emerald-50 p-3 rounded-xl">
                          <label className="text-xs font-medium text-gray-600">Khối lượng thực tế (kg):</label>
                          <input
                            type="number"
                            value={actualWeight}
                            onChange={e => setActualWeight(e.target.value)}
                            placeholder="VD: 8.5"
                            min="0.1"
                            step="0.1"
                            className="w-full px-3 py-2 border border-emerald-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                          {actualWeight && parseFloat(actualWeight) > 0 && (
                            <div className="text-sm bg-white rounded-lg p-2 border border-emerald-200">
                              <p className="text-gray-600">💰 Tổng tiền = {actualWeight} kg × {formatVND(req.unit_price)}/kg</p>
                              <p className="text-lg font-bold text-emerald-600">= {formatVND(parseFloat(actualWeight) * (req.unit_price || 0))}</p>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleConfirmPayment(req)}
                              disabled={saving || !actualWeight}
                              className="flex-1 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-all disabled:opacity-50"
                            >
                              {saving ? '⏳...' : '✅ Xác nhận thanh toán'}
                            </button>
                            <button
                              onClick={() => { setEditingId(null); setActualWeight(''); }}
                              className="py-2 px-3 text-gray-500 text-sm rounded-lg hover:bg-gray-100"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingId(req.id); setActualWeight(req.actual_weight || ''); }}
                          className="py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all"
                        >
                          💰 Cập nhật & Thanh toán
                        </button>
                      )
                    )}
                    {req.status === 'completed' && (
                      <div className="text-center py-2 px-3 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-lg">
                        ✅ Đã hoàn thành — {formatVND(req.total_payout)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
