import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

export default function PickupHistory() {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'pickup_requests'),
      where('user_id', '==', currentUser.uid),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (error) => {
      console.error('Error loading history:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  function formatVND(num) {
    return new Intl.NumberFormat('vi-VN').format(num || 0) + 'đ';
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    if (dateStr.toDate) return dateStr.toDate().toLocaleDateString('vi-VN');
    return new Date(dateStr).toLocaleDateString('vi-VN');
  }

  function getStatusBadge(status) {
    const map = {
      pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800', icon: '✔️' },
      completed: { label: 'Hoàn thành', color: 'bg-emerald-100 text-emerald-800', icon: '✅' },
      cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800', icon: '❌' },
    };
    const s = map[status] || map.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${s.color}`}>
        {s.icon} {s.label}
      </span>
    );
  }

  function getPaymentBadge(paymentStatus) {
    if (paymentStatus === 'paid') {
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">💰 Đã thanh toán</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">Chưa thanh toán</span>;
  }

  // Calculate total accumulated payout
  const totalPayout = requests
    .filter(r => r.status === 'completed' && r.payment_status === 'paid')
    .reduce((sum, r) => sum + (r.total_payout || 0), 0);

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-emerald-100 shadow-lg p-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-gray-500">Đang tải lịch sử...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Total Payout Summary */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-sm">Tổng tiền đã nhận</p>
            <p className="text-3xl font-bold mt-1">{formatVND(totalPayout)}</p>
          </div>
          <div className="text-5xl opacity-50">💵</div>
        </div>
        <div className="mt-3 text-sm text-emerald-100">
          📊 {requests.length} lần bán rác • {requests.filter(r => r.status === 'completed').length} đã hoàn thành
        </div>
      </div>

      {/* Request List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-emerald-100 shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-emerald-50 flex items-center gap-3">
          <span className="text-xl">📋</span>
          <h3 className="text-lg font-bold text-gray-800">Lịch sử thu gom</h3>
        </div>

        {requests.length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-gray-500">Chưa có lần bán rác nào</p>
            <p className="text-sm text-gray-400 mt-1">Hãy đặt lịch thu gom để bắt đầu!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {requests.map(req => (
              <div key={req.id} className="p-5 hover:bg-emerald-50/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-800">♻️ {req.waste_type_label || req.waste_type}</span>
                      {getStatusBadge(req.status)}
                      {getPaymentBadge(req.payment_status)}
                    </div>
                    <div className="mt-2 text-sm text-gray-500 space-y-0.5">
                      <p>⚖️ Ước tính: {req.estimated_weight} kg {req.actual_weight ? `→ Thực tế: ${req.actual_weight} kg` : ''}</p>
                      <p>📆 Ngày hẹn: {req.pickup_date || '—'} • Tạo: {formatDate(req.created_at)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Thu về</p>
                    <p className={`text-xl font-bold ${req.total_payout > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {formatVND(req.total_payout)}
                    </p>
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
