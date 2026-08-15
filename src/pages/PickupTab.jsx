import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PriceTable from '../components/PriceTable';
import PickupForm from '../components/PickupForm';
import PickupHistory from '../components/PickupHistory';
import AdminPickupDashboard from '../components/AdminPickupDashboard';

export default function PickupTab() {
  const { currentUser, isAdmin } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full text-sm font-medium text-emerald-700 mb-4">
          <span>♻️</span>
          <span>Thu gom & Tái chế</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          Thu Gom Rác Thải <span className="text-emerald-600">Nhựa</span>
        </h2>
        <p className="text-gray-500 max-w-lg mx-auto">
          Bán rác nhựa tái chế, nhận tiền ngay. Chúng tôi thu mua tận nơi cho quán cà phê & SMEs.
        </p>
      </div>

      {/* Price Table (visible to all) */}
      <PriceTable />

      {/* User Section */}
      {currentUser && !isAdmin() && (
        <div className="space-y-6">
          <PickupForm onSubmitted={() => setRefreshKey(k => k + 1)} />
          <PickupHistory key={refreshKey} />
        </div>
      )}

      {/* Prompt to login */}
      {!currentUser && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 text-center border border-emerald-100">
          <div className="text-5xl mb-4">🔐</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Đăng nhập để đặt lịch thu gom</h3>
          <p className="text-gray-500 mb-4">Tạo tài khoản quán nước để bắt đầu bán rác nhựa và nhận tiền</p>
        </div>
      )}

      {/* Admin Section */}
      {currentUser && isAdmin() && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">👑</span>
            <div>
              <p className="font-bold text-amber-800">Chế độ Admin</p>
              <p className="text-sm text-amber-600">Bạn đang xem dashboard quản trị thu gom</p>
            </div>
          </div>
          <AdminPickupDashboard />
        </div>
      )}
    </div>
  );
}
