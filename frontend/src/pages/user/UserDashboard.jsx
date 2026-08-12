import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/Api';
import { AuthContext } from '../../context/AuthContext';
import UserHeader from '../../components/UserHeader';
import UserBottomNav from '../../components/UserBottomNav';
import '../../assets/css/userStyle.css';

function UserDashboard() {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [slotInfo, setSlotInfo] = useState({ totalAvailable: '...', totalBooked: '...' });

    useEffect(() => {
        api.get('/driver/parking-info')
            .then(res => {
                setSlotInfo({
                    totalAvailable: res.data.totalAvailable ?? 0,
                    totalBooked: res.data.totalBooked ?? 0,
                });
            })
            .catch(() => setSlotInfo({ totalAvailable: '--', totalBooked: '--' }));
    }, []);

    return (
        <div className="user-theme-page" style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', paddingBottom: '100px' }}>
            <UserHeader />

            <div className="container-fluid px-5 pt-4">
                <div className="row g-4 mb-4">
                    <div className="col-12">
                        <div className="card shadow-sm border-0 p-4 bg-white rounded-3">
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                                <div>
                                    <h3 className="fw-bold text-dark m-0 fs-3">
                                        <i className="fas fa-parking text-primary me-2"></i> Hệ Thống Đặt Chỗ & Tra Cứu Bãi Xe
                                    </h3>
                                    <p className="text-muted fs-5 mt-2 mb-0">
                                        <i className="fas fa-map-marker-alt text-primary me-1"></i> Vị trí: Bãi đỗ xe nội khu — Giờ hoạt động: 06:00–22:00
                                    </p>
                                </div>
                                <div className="d-flex gap-3">
                                    <div className="card shadow-sm border-0 p-3 bg-light text-center" style={{ minWidth: '180px' }}>
                                        <span className="text-secondary fw-bold d-block mb-1 fs-6">SLOT TRỐNG</span>
                                        <span className="fs-3 fw-bold text-success">{slotInfo.totalAvailable}</span>
                                    </div>
                                    <div className="card shadow-sm border-0 p-3 bg-light text-center" style={{ minWidth: '180px' }}>
                                        <span className="text-secondary fw-bold d-block mb-1 fs-6">ĐÃ ĐẶT CHỖ</span>
                                        <span className="fs-3 fw-bold text-warning">{slotInfo.totalBooked}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {user && user.roleId === 4 && (
                    <div className="row g-4">
                        <div className="col-12">
                            <div className="alert alert-primary d-flex justify-content-between align-items-center p-4 mb-0" style={{ borderRadius: 10 }}>
                                <span className="fs-5">
                                    <i className="fa-solid fa-circle-dot text-primary me-2"></i>
                                    <strong>Xin chào, {user.fullName}!</strong> Bạn đang có lượt gửi xe hoạt động trong bãi.
                                </span>
                                <button className="btn btn-primary fw-bold px-4 py-2 fs-5" onClick={() => navigate('/user/tracking')}>
                                    Xem Chi Tiết Lượt Gửi →
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* CTA chính — hành động được ưu tiên nhất trên trang */}
                <div className="row g-4 mb-4">
                    <div className="col-12">
                        <div
                            className="d-flex justify-content-between align-items-center p-4 rounded-3 shadow-sm"
                            style={{
                                cursor: 'pointer',
                                background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                                transition: 'transform .2s',
                            }}
                            onClick={() => navigate('/user/booking')}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <div>
                                <div className="fw-bold text-white fs-4 mb-1">
                                    <i className="fa-solid fa-calendar-check me-2"></i>Đặt Chỗ Ngay
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem' }}>
                                    Giữ chỗ trước, không lo hết slot khi tới nơi
                                </div>
                            </div>
                            <div
                                className="d-flex align-items-center justify-content-center rounded-circle"
                                style={{ width: 48, height: 48, backgroundColor: 'rgba(255,255,255,0.2)' }}
                            >
                                <i className="fa-solid fa-arrow-right text-white fs-5"></i>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lưới 4 card chính: 2 cột đều nhau, không còn hàng lẻ */}
                <div className="row g-4 mb-3">
                    {[
                        { icon: 'fa-circle-info',    color: '#2563eb', label: 'Thông Tin Bãi Xe',   sub: 'Giờ mở cửa, bảng giá, quy định',  to: '/user/info'     },
                        { icon: 'fa-calendar-check', color: '#198754', label: 'Đặt Chỗ Trước',      sub: 'Chọn loại xe & giờ đến',           to: '/user/booking'  },
                        { icon: 'fa-location-dot',   color: '#6f42c1', label: 'Theo Dõi Lượt Gửi', sub: 'Xem xe đang đỗ & phí dự kiến',     to: '/user/tracking' },
                        { icon: 'fa-credit-card',    color: '#2563eb', label: 'Thanh Toán Online',  sub: 'Thanh toán phí gửi xe trực tuyến',  to: '/user/payment'  },
                    ].map(card => (
                        <div className="col-md-6 col-12" key={card.to}>
                            <div
                                className="card border-0 p-4 bg-white shadow-sm rounded-3 h-100"
                                style={{ cursor: 'pointer', transition: 'all .2s' }}
                                onClick={() => navigate(card.to)}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 .5rem 1rem rgba(0,0,0,.15)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';     e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                <div className="d-flex align-items-center gap-3">
                                    <div style={{ width: 54, height: 54, borderRadius: 12, background: card.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className={`fa-solid ${card.icon}`} style={{ color: card.color, fontSize: '1.5rem' }}></i>
                                    </div>
                                    <div>
                                        <div className="fw-bold text-dark fs-5">{card.label}</div>
                                        <div className="text-muted mt-1" style={{ fontSize: '0.85rem' }}>{card.sub}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Card thứ 5: dải ngang riêng biệt, có chủ đích, không phải "rớt lại" */}
                <div className="row g-4 mb-4">
                    <div className="col-12">
                        <div
                            className="card border-0 p-4 shadow-sm rounded-3"
                            style={{ cursor: 'pointer', transition: 'all .2s', backgroundColor: '#fd7e1412', border: '1px solid #fd7e1425' }}
                            onClick={() => navigate('/user/support')}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center gap-3">
                                    <div style={{ width: 54, height: 54, borderRadius: 12, background: '#fd7e1425', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className="fa-solid fa-headset" style={{ color: '#fd7e14', fontSize: '1.5rem' }}></i>
                                    </div>
                                    <div>
                                        <div className="fw-bold text-dark fs-5">Hỗ Trợ & Phản Ánh</div>
                                        <div className="text-muted mt-1" style={{ fontSize: '0.85rem' }}>Mất thẻ, sai phí, báo cáo sự cố — đội ngũ hỗ trợ sẵn sàng 24/7</div>
                                    </div>
                                </div>
                                <i className="fa-solid fa-chevron-right text-muted d-none d-sm-block"></i>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <UserBottomNav />
        </div>
    );
}

export default UserDashboard;
