// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import GlobalLoginModal from './components/GlobalLoginModal';
import GlobalRegisterModal from './components/GlobalRegisterModal';
import PermissionGuard from './components/PermissionGuard';
import { ROUTE_PERMISSIONS } from './config/permissions';

// User / Driver pages
import UserDashboard     from './pages/user/UserDashboard';
import UserParkingInfo   from './pages/user/UserParkingInfo';
import UserBooking       from './pages/user/UserBooking';
import UserTracking      from './pages/user/UserTracking';
import UserPayment       from './pages/user/UserPayment';
import UserSupport       from './pages/user/UserSupport';

// Staff pages
import StaffDashboard    from './pages/staff/staffDashboard';
import Checkin           from './pages/staff/Checkin';
import Checkout          from './pages/staff/Checkout';
import Exceptions        from './pages/staff/Exceptions';

// Manager pages
import ManagerDashboard  from './pages/manager/ManagerDashboard';
import ManagerFloors     from './pages/manager/ManagerFloors';
import ManagerTariff     from './pages/manager/ManagerTariff';
import ManagerReports    from './pages/manager/ManagerReports';

// Admin pages
import AdminDashboard    from './pages/admin/AdminDashboard';
import AdminPermissions  from './pages/admin/AdminPermissions';

function App() {
    const protectedPage = (path, element) => {
        const config = ROUTE_PERMISSIONS[path];
        if (!config) return element;
        return (
            <PermissionGuard roleId={config.roleId} permissionKey={config.permissionKey}>
                {element}
            </PermissionGuard>
        );
    };

    return (
        <AuthProvider>
            <BrowserRouter>
                {/* Modal đăng ký & đăng nhập global — hiển thị trên tất cả trang */}
                <GlobalLoginModal />
                <GlobalRegisterModal />

                <Routes>
                    {/* ── USER / DRIVER ── */}
                    <Route path="/"                element={<UserDashboard />}   />
                    <Route path="/user/info"        element={<UserParkingInfo />} />
                    <Route path="/user/booking"     element={<UserBooking />}    />
                    <Route path="/user/tracking"    element={<UserTracking />}   />
                    <Route path="/user/payment"     element={<UserPayment />}    />
                    <Route path="/user/support"     element={<UserSupport />}    />
                    <Route path="/payment/success"  element={<UserPayment />}    />
                    <Route path="/payment/cancel"   element={<UserPayment />}    />

                    {/* ── STAFF ── */}
                    <Route path="/staff/dashboard"  element={<StaffDashboard />} />
                    <Route path="/staff/checkin"    element={protectedPage('/staff/checkin', <Checkin />)}        />
                    <Route path="/staff/checkout"   element={protectedPage('/staff/checkout', <Checkout />)}       />
                    <Route path="/staff/exceptions" element={protectedPage('/staff/exceptions', <Exceptions />)}     />

                    {/* ── MANAGER ── */}
                    <Route path="/manager/dashboard" element={<ManagerDashboard />} />
                    <Route path="/manager/floors"    element={protectedPage('/manager/floors', <ManagerFloors />)}    />
                    <Route path="/manager/tariff"    element={protectedPage('/manager/tariff', <ManagerTariff />)}    />
                    <Route path="/manager/reports"   element={protectedPage('/manager/reports', <ManagerReports />)}   />

                    {/* ── ADMIN ── */}
                    <Route path="/admin/dashboard"   element={protectedPage('/admin/dashboard', <AdminDashboard />)}   />
                    <Route path="/admin/permissions" element={protectedPage('/admin/permissions', <AdminPermissions />)} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
