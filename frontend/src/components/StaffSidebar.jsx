// src/components/StaffSidebar.jsx
import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function StaffSidebar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const username = user ? user.fullName : "STAFF";

    // 🌟 KHUNG GẦM CYBER NAVY: Đồng bộ 100% với ManagerSidebar
    const sidebarStyles = {
        backgroundColor: '#0B0F19',
        width: '240px',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        borderRight: '1px solid #1E293B',
        zIndex: 1000,
        fontSize: '14px',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.25)'
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navLinkClass = ({ isActive }) =>
        `nav-link menu-item py-2.5 px-3 rounded-3 text-decoration-none mb-1 d-flex align-items-center w-100 transition-all ${
            isActive ? 'active fw-bold text-gradient-active shadow-sm' : 'text-slate-muted fw-medium item-link-hover'
        }`;

    const iconClass = (isActive, baseIcon) =>
        `${baseIcon} me-2.5 fs-5 transition-all ${isActive ? 'text-cyan-accent' : 'text-slate-muted opacity-60'}`;

    return (
        <>
            <style>{`
                .text-slate-muted { color: #94A3B8 !important; }
                .text-cyan-accent { color: #0EA5E9 !important; }

                .item-link-hover:hover {
                    background-color: rgba(30, 41, 59, 0.4) !important;
                    color: #F8FAFC !important;
                }
                .item-link-hover:hover i {
                    color: #3B82F6 !important;
                    opacity: 1 !important;
                }

                .nav-link.active {
                    background: linear-gradient(90deg, rgba(59, 130, 246, 0.15) 0%, rgba(14, 165, 233, 0.03) 100%) !important;
                    color: #3B82F6 !important;
                    position: relative;
                }

                .nav-link.active::before {
                    content: "";
                    position: absolute;
                    left: 0;
                    top: 15%;
                    height: 70%;
                    width: 4px;
                    background: linear-gradient(180deg, #3B82F6 0%, #0EA5E9 100%);
                    box-shadow: 0 0 8px #3B82F6;
                    border-radius: 0 4px 4px 0;
                }
            `}</style>

            <div className="sidebar d-flex flex-column justify-content-between p-3" style={sidebarStyles}>
                <div className="w-100">

                    <div className="text-center mb-4 mt-2 px-2">
                        <h4 className="mb-0 m-0" style={{ fontSize: '1.2rem', letterSpacing: '1px', fontWeight: '800', color: '#3B82F6' }}>
                            PARKING BUILDING
                        </h4>
                        <h4 className="mt-1 mb-0 m-0" style={{ fontSize: '1.2rem', letterSpacing: '1px', fontWeight: '800', color: '#F8FAFC' }}>
                            MANAGEMENT
                        </h4>
                    </div>

                    <hr style={{ borderColor: '#1E293B', opacity: 0.5 }} className="my-3" />

                    <div className="text-center mb-4 px-2 py-3 rounded-3" style={{ background: 'linear-gradient(180deg, #111827 0%, rgba(17,24,39,0) 100%)' }}>
                        <div style={{ fontSize: '11px', letterSpacing: '0.8px', color: '#64748B' }} className="fw-bold text-uppercase">
                            <i className="fa-regular fa-id-badge me-1.5 text-cyan-accent"></i> Xin Chào, Nhân Viên
                        </div>
                        <div className="fw-extrabold mt-1.5 fs-5" style={{ color: '#F8FAFC', letterSpacing: '0.5px' }}>
                            {username}
                        </div>
                    </div>

                    <nav className="nav flex-column mt-2 w-100" style={{ whiteSpace: 'nowrap' }}>

                        <div className="fw-bold text-uppercase mb-2 px-3" style={{ fontSize: '10.5px', letterSpacing: '1px', color: '#475569' }}>
                            TỔNG QUAN
                        </div>

                        <NavLink to="/staff/dashboard" className={navLinkClass}>
                            {({ isActive }) => (<><i className={iconClass(isActive, 'fa-solid fa-desktop')}></i> Giám Sát Bãi Xe</>)}
                        </NavLink>

                        <div className="fw-bold text-uppercase mt-4 mb-2 px-3" style={{ fontSize: '10.5px', letterSpacing: '1px', color: '#475569' }}>
                            CẤU HÌNH CHI TIẾT
                        </div>

                        <NavLink to="/staff/checkin" className={navLinkClass}>
                            {({ isActive }) => (<><i className={iconClass(isActive, 'fa-solid fa-arrow-right-to-bracket')}></i> Xe Vào (Check-in)</>)}
                        </NavLink>

                        <NavLink to="/staff/checkout" className={navLinkClass}>
                            {({ isActive }) => (<><i className={iconClass(isActive, 'fa-solid fa-arrow-right-from-bracket')}></i> Xe Ra (Check-out)</>)}
                        </NavLink>

                        <NavLink to="/staff/exceptions" className={navLinkClass}>
                            {({ isActive }) => (<><i className={iconClass(isActive, 'fa-solid fa-triangle-exclamation')}></i> Lỗi Ngoại Lệ</>)}
                        </NavLink>
                    </nav>
                </div>

                <div className="mt-auto mb-2 px-1 w-100">
                    <button
                        onClick={handleLogout}
                        className="btn w-100 fw-bold py-2 rounded-3"
                        style={{
                            fontSize: '13.5px',
                            color: '#F9A8D4',
                            border: '1px solid #9D174D',
                            backgroundColor: 'transparent',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#9D174D';
                            e.currentTarget.style.color = '#FFFFFF';
                            e.currentTarget.style.boxShadow = '0 0 12px rgba(157, 23, 77, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#F9A8D4';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <i className="fa-solid fa-arrow-right-from-bracket me-2"></i> Đăng xuất
                    </button>
                </div>
            </div>
        </>
    );
}

export default StaffSidebar;