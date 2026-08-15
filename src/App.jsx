import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthModal from './components/AuthModal';
import PickupTab from './pages/PickupTab';
import ShopTab from './pages/ShopTab';

function AppContent() {
  const { currentUser, userProfile, logout, loading } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 animate-ping opacity-20"></div>
            <div className="absolute inset-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 animate-pulse flex items-center justify-center">
              <span className="text-3xl">♻️</span>
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-700">ReCity</h2>
          <p className="text-gray-400 text-sm mt-1">Đang tải...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { label: 'Thu Gom Rác Nhựa', icon: '♻️', component: <PickupTab /> },
    { label: 'Cửa Hàng Xanh', icon: '🌿', component: <ShopTab /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/50">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-emerald-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5 cursor-pointer select-none">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <span className="text-xl">♻️</span>
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-gray-800 leading-tight">
                  Re<span className="text-emerald-600">City</span>
                </h1>
                <p className="text-[10px] text-gray-400 -mt-0.5 font-medium tracking-wider">ECO PLATFORM</p>
              </div>
            </div>

            {/* Desktop Tab Navigation */}
            <nav className="hidden md:flex items-center bg-emerald-50/80 rounded-xl p-1">
              {tabs.map((tab, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    activeTab === i
                      ? 'bg-white text-emerald-700 shadow-md'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* Auth / User */}
            <div className="flex items-center gap-3">
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-semibold text-gray-700 leading-tight">
                      {userProfile?.store_name || currentUser.displayName || 'User'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {userProfile?.role === 'admin' ? '👑 Admin' : '🏪 Quán nước'}
                    </p>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
                    >
                      {(userProfile?.store_name || currentUser.displayName || 'U').charAt(0).toUpperCase()}
                    </button>
                    {/* Dropdown */}
                    {mobileMenuOpen && (
                      <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-fade-in">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-700">{userProfile?.store_name || currentUser.displayName}</p>
                          <p className="text-xs text-gray-400">{currentUser.email}</p>
                        </div>
                        <button
                          onClick={() => { logout(); setMobileMenuOpen(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                        >
                          🚪 Đăng xuất
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/25"
                >
                  Đăng nhập
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="md:hidden border-t border-emerald-100">
          <div className="flex">
            {tabs.map((tab, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all duration-300 ${
                  activeTab === i
                    ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50/50'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{i === 0 ? 'Thu Gom' : 'Cửa Hàng'}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Close dropdown on outside click */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setMobileMenuOpen(false)}></div>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {tabs[activeTab].component}
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-900 text-gray-400 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">♻️</span>
                <span className="text-lg font-bold text-white">Re<span className="text-emerald-400">City</span></span>
              </div>
              <p className="text-sm leading-relaxed">
                Nền tảng thu gom rác nhựa tái chế và phân phối sản phẩm xanh cho quán cà phê & SMEs tại Việt Nam.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Liên hệ</h4>
              <div className="space-y-2 text-sm">
                <p>📱 Hotline: 01234567</p>
                <p>💬 Zalo: 01234567</p>
                <p>✉️ contact@recity.vn</p>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Về chúng tôi</h4>
              <p className="text-sm leading-relaxed">
                ReCity cam kết xây dựng nền kinh tế tuần hoàn, biến rác thải nhựa thành tài nguyên quý giá.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
            <p>© 2026 ReCity. Made with 💚 for a greener planet.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
