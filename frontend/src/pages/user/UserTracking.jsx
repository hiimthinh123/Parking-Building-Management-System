// src/pages/user/UserTracking.jsx
// Feature 2 & 4: Theo dõi lượt gửi xe — live fee counter, exit QR code
import { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/Api';
import { AuthContext } from '../../context/AuthContext';
import { getGuestToken } from '../../utils/guestIdentity';
import UserHeader    from '../../components/UserHeader';
import UserBottomNav from '../../components/UserBottomNav';
import '../../assets/css/userStyle.css';

const API = 'http://localhost:8080/api';

function fmtMoney(n) { return Number(n).toLocaleString('vi-VN') + 'đ'; }
function fmtDuration(checkInStr) {
    const diff = Date.now() - new Date(checkInStr).getTime();
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
function fmtTime(dtStr) {
    if (!dtStr) return '—';
    return new Date(dtStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' +
        new Date(dtStr).toLocaleDateString('vi-VN');
}

const VEHICLE_NAMES = { 1: 'Xe máy', 2: 'Ô tô 4-7 chỗ', 3: 'Xe điện' };

function UserTracking() {
    const navigate     = useNavigate();
    const { user }     = useContext(AuthContext);
    const [session,    setSession]    = useState(null);
    const [loading,    setLoading]    = useState(true);
    const [elapsed,    setElapsed]    = useState('00:00:00');
    const [liveFee,    setLiveFee]    = useState(0);
    const [feeTick,    setFeeTick]    = useState(false);
    const [history,    setHistory]    = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const prevFeeRef   = useRef(0);

    // Fetch active session
    const fetchSession = useCallback(() => {
        const url = user
            ? `${API}/driver/active-session/${user.userId}`
            : `${API}/driver/guest/active-session/${getGuestToken()}`;
        api.get(url)
            .then(res => {
                if (res.status === 204 || !res.data) { setSession(null); }
                else {
                    setSession(res.data);
                    setLiveFee(res.data.estimatedFee || 0);
                    prevFeeRef.current = res.data.estimatedFee || 0;
                }
            })
            .catch(() => setSession(null))
            .finally(() => setLoading(false));
    }, [user]);

    useEffect(() => { fetchSession(); }, [fetchSession]);

    // Refresh estimated fee từ backend mỗi 60 giây
    useEffect(() => {
        if (!session) return;
        const timer = setInterval(() => {
            const url = user
                ? `${API}/driver/active-session/${user.userId}`
                : `${API}/driver/guest/active-session/${getGuestToken()}`;
            api.get(url)
                .then(res => {
                    if (res.data) {
                        const newFee = res.data.estimatedFee || 0;
                        if (newFee !== prevFeeRef.current) {
                            setLiveFee(newFee);
                            setFeeTick(true);
                            setTimeout(() => setFeeTick(false), 400);
                            prevFeeRef.current = newFee;
                        }
                    }
                }).catch(() => {});
        }, 60000);
        return () => clearInterval(timer);
    }, [session, user]);

    // Elapsed timer — tick mỗi giây
    useEffect(() => {
        if (!session?.checkInTime) return;
        const timer = setInterval(() => {
            setElapsed(fmtDuration(session.checkInTime));
            // Tăng fee ước tính cục bộ mỗi giây (dựa trên hourlyRate từ session nếu có)
            // Chỉ tăng UI, không gọi API liên tục
        }, 1000);
        return () => clearInterval(timer);
    }, [session]);

    // Load history
    const fetchHistory = () => {
        setShowHistory(true);
        const url = user
            ? `${API}/driver/sessions/${user.userId}`
            : `${API}/driver/guest/sessions/${getGuestToken()}`;
        api.get(url)
            .then(res => setHistory(res.data))
            .catch(() => {});
    };

    return (
        <div className="user-theme-page" style={{ backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
            <UserHeader />
            <div className="desktop-dashboard-wrapper p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold text-dark mb-0">
                        <i className="fa-solid fa-location-dot text-purple me-2" style={{ color: '#6f42c1' }}></i>
                        Theo Dõi Lượt Gửi Xe
                    </h5>
                    <button className="btn btn-outline-secondary btn-sm" onClick={fetchSession}>
                        <i className="fa-solid fa-arrows-rotate me-1"></i>Làm mới
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-5 text-muted">
                        <i className="fa-solid fa-spinner fa-spin fa-2x mb-3 d-block"></i>Đang tải...
                    </div>
                ) : !session ? (
                    <div className="text-center py-5 bg-white rounded-3 shadow-sm">
                        <i className="fa-regular fa-circle-xmark fa-3x mb-3 d-block text-muted opacity-40"></i>
                        <h6 className="text-muted">Không có lượt gửi xe đang hoạt động.</h6>
                        <p className="text-muted small">Xe của bạn chưa được check-in hoặc đã thanh toán xong.</p>
                        <button
                            className="btn btn-outline-primary btn-sm mt-2"
                            onClick={fetchHistory}
                        >
                            <i className="fa-solid fa-clock-rotate-left me-1"></i>Xem lịch sử
                        </button>
                    </div>
                ) : (
                    <div className="row g-4">
                        {/* Active session card */}
                        <div className="col-md-6">
                            <div className="active-session-card">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1 }}>
                                            Đang Gửi Xe
                                        </div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                                            Session #{session.sessionId}
                                        </div>
                                    </div>
                                    <span style={{ background: 'rgba(255,255,255,.25)', padding: '4px 12px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700 }}>
                                        🟢 Active
                                    </span>
                                </div>

                                <div className="session-detail-row">
                                    <span className="session-label">Biển số xe</span>
                                    <span className="session-value">{session.licensePlate || '—'}</span>
                                </div>
                                <div className="session-detail-row">
                                    <span className="session-label">Loại xe</span>
                                    <span className="session-value">{VEHICLE_NAMES[session.vehicleTypeId] || '—'}</span>
                                </div>
                                <div className="session-detail-row">
                                    <span className="session-label">Vị trí đỗ</span>
                                    <span className="session-value">{session.slotCode || `Slot #${session.slotId}`}</span>
                                </div>
                                <div className="session-detail-row">
                                    <span className="session-label">Giờ vào</span>
                                    <span className="session-value">{fmtTime(session.checkInTime)}</span>
                                </div>
                                <div className="session-detail-row">
                                    <span className="session-label">Thời gian đỗ</span>
                                    <span className="session-value" style={{ fontVariantNumeric: 'tabular-nums' }}>{elapsed}</span>
                                </div>

                                {/* Live fee counter */}
                                <div className="live-fee-box">
                                    <div className="live-fee-label">Phí Dự Kiến</div>
                                    <div className={`live-fee-amount ${feeTick ? 'live-fee-tick' : ''}`}>
                                        {fmtMoney(liveFee)}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: 4 }}>
                                        Cập nhật mỗi phút • Chưa bao gồm OT
                                    </div>
                                </div>

                                {/* Exit QR Code */}
                                <div className="qr-code-box">
                                    <i className="fa-solid fa-qrcode" style={{ fontSize: '3.5rem', color: '#1a1a2e' }}></i>
                                    <div className="qr-code-label">Mã QR ra cổng</div>
                                    <div style={{ fontSize: '0.7rem', color: '#999', marginTop: 2 }}>
                                        ID: {session.sessionId}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Thao tác */}
                        <div className="col-md-6 d-flex flex-column gap-3">
                            <div className="card border-0 shadow-sm p-4 rounded-3">
                                <h6 className="fw-bold text-dark mb-3">
                                    <i className="fa-solid fa-circle-dollar-to-slot text-success me-2"></i>
                                    Thanh Toán Ngay
                                </h6>
                                <p className="text-muted small mb-3">
                                    Thanh toán trước để ra cổng nhanh hơn. Phí sẽ được tính chính xác tại thời điểm checkout.
                                </p>
                                <div className="p-3 rounded-3 mb-3" style={{ background: '#fff3cd', border: '1px solid #ffc107' }}>
                                    <div className="d-flex justify-content-between">
                                        <span className="text-muted small">Phí hiện tại (ước tính):</span>
                                        <strong className="text-danger">{fmtMoney(liveFee)}</strong>
                                    </div>
                                </div>
                                <button
                                    className="btn btn-success w-100 fw-bold py-2"
                                    onClick={() => navigate('/user/payment', { state: { sessionId: session.sessionId, estimatedFee: liveFee, guestToken: !user ? getGuestToken() : null } })}
                                >
                                    <i className="fa-solid fa-credit-card me-2"></i>
                                    TIẾN HÀNH THANH TOÁN
                                </button>
                            </div>

                            <div className="card border-0 shadow-sm p-4 rounded-3">
                                <h6 className="fw-bold text-dark mb-3">
                                    <i className="fa-solid fa-clock-rotate-left text-primary me-2"></i>
                                    Lịch Sử Gửi Xe
                                </h6>
                                <button
                                    className="btn btn-outline-primary w-100 btn-sm"
                                    onClick={fetchHistory}
                                >
                                    Xem lịch sử gần đây
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Session history */}
                {showHistory && history.length > 0 && (
                    <div className="mt-4">
                        <h6 className="fw-bold text-dark mb-3">Lịch Sử Gửi Xe Gần Đây</h6>
                        {history.slice(0, 8).map(s => (
                            <div key={s.sessionId} className="bg-white rounded-3 shadow-sm p-3 mb-2 d-flex justify-content-between align-items-center">
                                <div>
                                    <span className="fw-semibold text-dark small">Session #{s.sessionId}</span>
                                    <span className="text-muted small ms-2">· {s.licensePlate}</span>
                                    <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                                        Vào: {fmtTime(s.checkInTime)}
                                        {s.checkOutTime && ` · Ra: ${fmtTime(s.checkOutTime)}`}
                                    </div>
                                </div>
                                <span className={`badge ${s.sessionStatus === 'Active' ? 'bg-success' : s.sessionStatus === 'Completed' ? 'bg-secondary' : 'bg-warning text-dark'}`}>
                                    {s.sessionStatus}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <UserBottomNav />
        </div>
    );
}

export default UserTracking;
