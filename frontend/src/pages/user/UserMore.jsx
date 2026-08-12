// src/pages/user/UserMore.jsx
import { useNavigate } from 'react-router-dom';
import UserHeader from '../../components/UserHeader';
import UserBottomNav from '../../components/UserBottomNav';
import '../../assets/css/userStyle.css';

function UserMore() {
    const navigate = useNavigate();

    const items = [
        { icon: 'fa-circle-info', color: '#2563eb', label: 'Thông Tin Bãi Xe', sub: 'Giờ mở cửa, bảng giá, quy định', to: '/user/info' },
        { icon: 'fa-headset',     color: '#fd7e14', label: 'Hỗ Trợ & Phản Ánh', sub: 'Mất thẻ, sai phí, báo cáo sự cố', to: '/user/support' },
    ];

    return (
        <div className="user-theme-page" style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', paddingBottom: '100px' }}>
            <UserHeader />
            <div className="container-fluid px-4 pt-4">
                {items.map(item => (
                    <div
                        key={item.to}
                        className="card border-0 p-4 bg-white shadow-sm rounded-3 mb-3 d-flex flex-row align-items-center gap-3"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(item.to)}
                    >
                        <div style={{ width: 48, height: 48, borderRadius: 10, background: item.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className={`fa-solid ${item.icon}`} style={{ color: item.color, fontSize: '1.3rem' }}></i>
                        </div>
                        <div>
                            <div className="fw-bold text-dark fs-5">{item.label}</div>
                            <div className="text-muted mt-1" style={{ fontSize: '0.85rem' }}>{item.sub}</div>
                        </div>
                    </div>
                ))}
            </div>
            <UserBottomNav />
        </div>
    );
}

export default UserMore;
