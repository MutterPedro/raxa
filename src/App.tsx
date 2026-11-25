import { Route, Routes, useLocation } from 'react-router';
import Header from './components/header/Header';
import MainContainer from './components/MainContainer';
import BillDetail from './components/expense/BillDetail';
import LoginForm from './components/login/LoginForm';
import OfflineBanner from './components/common/OfflineBanner';
import { useOnlineStatus } from './components/common/useOnlineStatus';

function App() {
  const online = useOnlineStatus();
  // Keying the mounted tree by path remounts it on every navigation, so the
  // fade-in entrance plays on each route change (bill detail opening, back to
  // home). Fade only — a transformed ancestor would turn the wrapper into the
  // containing block of fixed children (the FAB jumps mid-animation).
  // Reduced-motion users get the instant swap via the global floor.
  const location = useLocation();
  return (
    <>
      <Header />
      {!online && <OfflineBanner />}
      <main className="flex justify-center min-h-svh py-10 px-6">
        {/* flex + justify-center: pages center themselves against this box exactly
            as they did against main, so the wrapper is layout-invisible. */}
        <div key={location.pathname} className="flex w-full justify-center animate-fade-in">
          <Routes location={location}>
            <Route index element={<MainContainer />} />
            <Route path="bill/:billId" element={<BillDetail />} />
            <Route path="/login" element={<LoginForm />} />
          </Routes>
        </div>
      </main>
    </>
  );
}

export default App;
