// src/pages/user/UserParkingInfo.jsx
// Feature 1: Xem thông tin bãi đỗ xe — giờ hoạt động, bảng giá, slot trống real-time
import { useState, useEffect } from 'react';
import api from '../../config/Api';
import UserHeader    from '../../components/UserHeader';
import UserBottomNav from '../../components/UserBottomNav';
import '../../assets/css/userStyle.css';

const API = 'http://localhost:8080/api';

const VEHICLE_ICONS = { 1: 'fa-motorcycle', 2: 'fa-car', 3: 'fa-bolt' };
const VEHICLE_COLORS = { 1: '#f39c12', 2: '#2980b9', 3: '#27ae60' };

function fmt(n) {
    return Number(n).toLocaleString('vi-VN') + 'đ';
}

function UserParkingInfo() {
    const [info,    setInfo]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState('');

    const fetchInfo = () => {
        setLoading(true);
        api.get(`${API}/driver/parking-info`)
            .then(res => { setInfo(res.data); setError(''); })
            .catch(() => setError('Không thể tải thông tin bãi xe. Vui lòng thử lại.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchInfo();
        // Auto-refresh slot counts mỗi 30 giây
        const timer = setInterval(fetchInfo, 30000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="user-theme-page" style={{ backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
            <UserHeader />
            <div className="desktop-dashboard-wrapper p-4">

                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h5 className="fw-bold text-dark mb-1">
                            <i className="fa-solid fa-circle-info text-primary me-2"></i>
                            Thông Tin Bãi Đỗ Xe
                        </h5>
                        <p className="text-muted small mb-0">Cập nhật real-time mỗi 30 giây</p>
                    </div>
                    <button className="btn btn-outline-primary btn-sm fw-bold" onClick={fetchInfo} disabled={loading}>
                        <i className="fa-solid fa-arrows-rotate me-1"></i> Làm mới
                    </button>
                </div>

                {error && <div className="error-banner">{error}</div>}

                {loading && !info ? (
                    <div className="text-center py-5 text-muted">
                        <i className="fa-solid fa-spinner fa-spin fa-2x mb-3 d-block"></i>Đang tải thông tin...
                    </div>
                ) : info && (
                    <>
                        {/* Slot counts real-time */}
                        <div className="info-card-row mb-4">
                            <div className="info-stat-card available">
                                <div className="info-stat-number text-success">{info.totalAvailable}</div>
                                <div className="info-stat-label">Slot Trống</div>
                            </div>
                            <div className="info-stat-card occupied">
                                <div className="info-stat-number text-danger">{info.totalOccupied}</div>
                                <div className="info-stat-label">Đang Có Xe</div>
                            </div>
                            <div className="info-stat-card booked">
                                <div className="info-stat-number text-warning">{info.totalBooked}</div>
                                <div className="info-stat-label">Đã Đặt Chỗ</div>
                            </div>
                            <div className="info-stat-card maint">
                                <div className="info-stat-number text-secondary">{info.totalMaintenance}</div>
                                <div className="info-stat-label">Bảo Trì</div>
                            </div>
                        </div>

                        <div className="row g-3">
                            {/* Thông tin cơ bản */}
                            <div className="col-md-6">
                                <div className="card border-0 shadow-sm p-4 rounded-3 h-100">
                                    <h6 className="fw-bold text-dark mb-3">
                                        <i className="fa-solid fa-building text-primary me-2"></i>
                                        Thông Tin Chung
                                    </h6>
                                    <table className="w-100" style={{ fontSize: '0.88rem' }}>
                                        <tbody>
                                        <tr>
                                            <td className="text-muted pb-2" style={{ width: '40%' }}>
                                                <i className="fa-solid fa-clock me-2 text-primary"></i>Giờ hoạt động
                                            </td>
                                            <td className="fw-semibold pb-2">{info.operatingHours}</td>
                                        </tr>
                                        <tr>
                                            <td className="text-muted pb-2">
                                                <i className="fa-solid fa-location-dot me-2 text-danger"></i>Địa chỉ
                                            </td>
                                            <td className="fw-semibold pb-2">{info.address}</td>
                                        </tr>
                                        <tr>
                                            <td className="text-muted pb-2">
                                                <i className="fa-solid fa-phone me-2 text-success"></i>Hotline
                                            </td>
                                            <td className="fw-semibold pb-2">{info.hotline}</td>
                                        </tr>
                                        <tr>
                                            <td className="text-muted">
                                                <i className="fa-solid fa-car me-2 text-warning"></i>Loại xe
                                            </td>
                                            <td className="fw-semibold">
                                                {(info.allowedVehicles || [])
                                                .filter(vehicle => !vehicle.toLowerCase().includes('xe điện') && !vehicle.toLowerCase().includes('xe di'))
                                                .join(' • ')}
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Quy định */}
                            <div className="col-md-6">
                                <div className="card border-0 shadow-sm p-4 rounded-3 h-100">
                                    <h6 className="fw-bold text-dark mb-3">
                                        <i className="fa-solid fa-triangle-exclamation text-warning me-2"></i>
                                        Quy Định Bãi Xe
                                    </h6>
                                    <ul className="regulations-list ps-0" style={{ listStyle: 'none' }}>
                                        {(info.regulations || []).map((reg, i) => (
                                            <li key={i} className="d-flex gap-2">
                                                <i className="fa-solid fa-circle-check text-success mt-1 flex-shrink-0" style={{ fontSize: '0.8rem' }}></i>
                                                <span>{reg}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Bảng giá */}
                            <div className="col-12">
                                <div className="card border-0 shadow-sm p-4 rounded-3">
                                    <h6 className="fw-bold text-dark mb-3">
                                        <i className="fa-solid fa-tags text-success me-2"></i>
                                        Bảng Giá Gửi Xe
                                    </h6>
                                    <div className="table-responsive">
                                        <table className="pricing-table">
                                            <thead>
                                            <tr>
                                                <th>Loại Phương Tiện</th>
                                                <th>Phí Block Đầu (60 phút)</th>
                                                <th>Phí Theo Giờ</th>
                                                <th>Phí Phạt OT (&gt;8h)</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {(info.pricingPolicies || []).map(p => (
                                                <tr key={p.vehicleTypeId}>
                                                    <td>
                                                            <span
                                                                className="vehicle-icon me-2"
                                                                style={{ background: (VEHICLE_COLORS[p.vehicleTypeId] || '#666') + '22', color: VEHICLE_COLORS[p.vehicleTypeId] || '#666' }}
                                                            >
                                                                <i className={`fa-solid ${VEHICLE_ICONS[p.vehicleTypeId] || 'fa-car'}`}></i>
                                                            </span>
                                                        <strong>{p.vehicleTypeName}</strong>
                                                    </td>
                                                    <td className="fw-semibold text-primary">{fmt(p.basePrice)}</td>
                                                    <td className="fw-semibold text-success">{fmt(p.hourlyRate)}/giờ</td>
                                                    <td className="fw-semibold text-danger">{fmt(p.overtimeRate)}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="mt-3 p-3 bg-light rounded" style={{ fontSize: '0.82rem', color: '#666' }}>
                                        <i className="fa-solid fa-circle-info text-primary me-1"></i>
                                        <strong>Ví dụ tính phí:</strong> Xe máy gửi 2 giờ 30 phút = 5.000đ (block đầu) + 2 × 2.000đ (giờ tiếp theo) = <strong>9.000đ</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
            <UserBottomNav />
        </div>
    );
}

export default UserParkingInfo;
