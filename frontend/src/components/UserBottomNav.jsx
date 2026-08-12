// src/components/UserBottomNav.jsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function UserBottomNav() {
    const navigate  = useNavigate();
    const location  = useLocation();
    const path      = location.pathname;
    const [showMoreSheet, setShowMoreSheet] = useState(false);

    const items = [
        { to: '/',               icon: 'fa-house',          label: 'Trang Chủ'  },
        { to: '/user/booking',   icon: 'fa-calendar-check', label: 'Đặt Chỗ'   },
        { to: '/user/tracking',  icon: 'fa-location-dot',   label: 'Theo Dõi'  },
        { to: '/user/payment',   icon: 'fa-qrcode',         label: 'Thanh Toán' },
        { to: '#more',           icon: 'fa-ellipsis',       label: 'Thêm'      },
    ];

    const moreItems = [
        { icon: 'fa-circle-info', color: '#2563eb', label: 'Thông Tin Bãi Xe', sub: 'Giờ mở cửa, bảng giá, quy định', to: '/user/info' },
        { icon: 'fa-headset',     color: '#fd7e14', label: 'Hỗ Trợ & Phản Ánh', sub: 'Mất thẻ, sai phí, báo cáo sự cố', to: '/user/support' },
    ];

    const isActive = (item) => {
        if (item.to === '#more') {
            return path === '/user/info' || path === '/user/support';
        }
        return path === item.to;
    };

    const handleClick = (item) => {
        if (item.to === '#more') {
            setShowMoreSheet(true);
        } else {
            navigate(item.to);
        }
    };

    return (
        <>
            <div className="bottom-nav">
                {items.map(item => (
                    <button
                        key={item.to}
                        className={`bottom-nav-item ${isActive(item) ? 'active' : ''}`}
                        onClick={() => handleClick(item)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                        <i className={`fa-solid ${item.icon}`}></i>
                        <span>{item.label}</span>
                    </button>
                ))}
            </div>

            {/* ── Bottom Sheet "Thêm" — popup nhỏ, không phải trang riêng ── */}
            {showMoreSheet && (
                <div className="more-sheet-overlay" onClick={() => setShowMoreSheet(false)}>
                    <div className="more-sheet" onClick={(e) => e.stopPropagation()}>
                        <div className="more-sheet-handle"></div>
                        {moreItems.map(item => (
                            <div
                                key={item.to}
                                className="more-sheet-item"
                                onClick={() => { setShowMoreSheet(false); navigate(item.to); }}
                            >
                                <div className="more-sheet-icon" style={{ background: item.color + '18' }}>
                                    <i className={`fa-solid ${item.icon}`} style={{ color: item.color }}></i>
                                </div>
                                <div className="flex-grow-1">
                                    <div className="more-sheet-label">{item.label}</div>
                                    <div className="more-sheet-sub">{item.sub}</div>
                                </div>
                                <i className="fa-solid fa-chevron-right text-muted" style={{ fontSize: '12px' }}></i>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}

export default UserBottomNav;
