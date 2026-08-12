// src/pages/user/UserPayment.jsx
import { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../config/Api';
import { AuthContext } from '../../context/AuthContext';
import { getGuestToken } from '../../utils/guestIdentity';
import { QRCodeSVG } from 'qrcode.react';
import UserHeader    from '../../components/UserHeader';
import UserBottomNav from '../../components/UserBottomNav';
import '../../assets/css/userStyle.css';

const API = 'http://localhost:8080/api';

function fmtMoney(n) { return Number(n || 0).toLocaleString('vi-VN') + 'đ'; }
function fmtTime(dtStr) {
    if (!dtStr) return '—';
    const d = new Date(dtStr);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' · ' +
        d.toLocaleDateString('vi-VN');
}

function UserPayment() {
    const { user }    = useContext(AuthContext);
    const navigate    = useNavigate();
    const location    = useLocation();

    const stateSessionId = location.state?.sessionId   ?? '';
    const stateEstFee    = location.state?.estimatedFee ?? 0;

    const [sessionId,      setSessionId]      = useState(stateSessionId);
    const [sessionInfo,    setSessionInfo]    = useState(null);
    const [loadingSession, setLoadingSession] = useState(false);
    const [sessionError,   setSessionError]   = useState('');

    // Chỉ còn 2 phương thức: Cash (chỉ xem) và QR PayOS (thanh toán)
    const [selectedMethod, setSelectedMethod] = useState('QR_PAYOS');
    const [paying,         setPaying]         = useState(false);
    const [payError,       setPayError]       = useState('');
    const [receipt,        setReceipt]        = useState(null);

    // PayOS QR state
    const [qrData,    setQrData]    = useState(null);
    const [qrPolling, setQrPolling] = useState(false);
    const pollingRef = useRef(null);

    const loadActiveSession = useCallback(() => {
        setLoadingSession(true);
        setSessionError('');
        const url = user
            ? `${API}/driver/active-session/${user.userId}`
            : `${API}/driver/guest/active-session/${getGuestToken()}`;
        api.get(url)
            .then(res => {
                if (res.status === 204 || !res.data) {
                    setSessionError('Bạn không có lượt gửi xe đang hoạt động.');
                    setSessionInfo(null);
                } else {
                    setSessionInfo(res.data);
                    setSessionId(res.data.sessionId);
                }
            })
            .catch(() => setSessionError('Không thể tải thông tin lượt gửi xe.'))
            .finally(() => setLoadingSession(false));
    }, [user]);

    useEffect(() => {
        if (stateSessionId) {
            setSessionInfo({ sessionId: stateSessionId, estimatedFee: stateEstFee });
        } else {
            loadActiveSession();
        }
    }, [stateSessionId, stateEstFee, loadActiveSession]);

// Tạo QR PayOS + polling
    const handlePayOS = async () => {
        if (!sessionId) { setPayError('Không xác định được lượt gửi xe.'); return; }
        setPaying(true);
        setPayError('');
        try {
            //  ĐỔI TỪ axios.post THÀNH api.post
            const res = await api.post(`${API}/payments/create-qr`, { sessionId: Number(sessionId) });
            setQrData(res.data);
            setQrPolling(true);
            let attempts = 0;

            pollingRef.current = setInterval(async () => {
                attempts++;
                try {
                    //  ĐỔI TỪ axios.get THÀNH api.get
                    const statusRes = await api.get(`${API}/payments/status/${res.data.orderId}`);
                    if (statusRes.data.status === 'SUCCESS') {
                        clearInterval(pollingRef.current);
                        setQrPolling(false);
                        setQrData(null);
                        setReceipt({
                            success: true,
                            message: 'Thanh toán QR thành công!',
                            amount: res.data.amount,
                            paymentMethod: 'QR PayOS',
                            checkOutTime: new Date().toISOString()
                        });
                    }
                } catch { /* ignore */ }

                if (attempts >= 200) {
                    clearInterval(pollingRef.current);
                    setQrPolling(false);
                    setPayError('QR đã hết hiệu lực. Vui lòng thử lại.');
                    setQrData(null);
                }
            }, 3000);
        } catch (err) {
            // Giờ đây err.response sẽ hoạt động chính xác theo cấu hình của api instance
            setPayError(err.response?.data?.error || 'Không thể tạo mã QR. Vui lòng thử lại.');
        } finally {
            setPaying(false);
        }
    };

    useEffect(() => () => clearInterval(pollingRef.current), []);

    // Receipt
    if (receipt) {
        return (
            <div className="user-theme-page" style={{ backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
                <UserHeader />
                <div className="desktop-dashboard-wrapper p-4">
                    <div className="text-center py-3 mb-4">
                        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#d1fae5', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fa-solid fa-circle-check fa-2x text-success"></i>
                        </div>
                        <h5 className="fw-bold text-success mb-1">Thanh Toán Thành Công!</h5>
                        <p className="text-muted small">{receipt.message}</p>
                    </div>
                    <div className="card border-0 shadow-sm p-4 rounded-3 mx-auto" style={{ maxWidth: 440 }}>
                        <div className="text-center mb-4">
                            <div className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: 1 }}>Hóa Đơn Gửi Xe</div>
                            <div className="fw-black mt-1" style={{ fontSize: '2.4rem', color: '#198754' }}>{fmtMoney(receipt.amount)}</div>
                        </div>
                        <div style={{ borderTop: '1px dashed #dee2e6', borderBottom: '1px dashed #dee2e6', padding: '16px 0', margin: '0 0 16px' }}>
                            <div className="d-flex justify-content-between small mb-2"><span className="text-muted">Session ID</span><strong>#{sessionId}</strong></div>
                            <div className="d-flex justify-content-between small mb-2"><span className="text-muted">Phương thức</span><strong>{receipt.paymentMethod}</strong></div>
                            <div className="d-flex justify-content-between small mb-2"><span className="text-muted">Thời gian ra</span><strong>{fmtTime(receipt.checkOutTime)}</strong></div>
                            <div className="d-flex justify-content-between small"><span className="text-muted">Trạng thái</span><span className="badge bg-success">Đã Thanh Toán</span></div>
                        </div>
                        <p className="text-muted text-center small mb-4">
                            <i className="fa-solid fa-circle-info me-1 text-primary"></i>
                            Slot đỗ xe đã được giải phóng. Cảm ơn bạn đã sử dụng dịch vụ!
                        </p>
                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-secondary flex-fill btn-sm fw-bold" onClick={() => navigate('/user/support')}>
                                <i className="fa-solid fa-headset me-1"></i> Báo Lỗi
                            </button>
                            <button className="btn btn-primary flex-fill btn-sm fw-bold" onClick={() => { setReceipt(null); navigate('/'); }}>
                                <i className="fa-solid fa-house me-1"></i> Về Trang Chủ
                            </button>
                        </div>
                    </div>
                </div>
                <UserBottomNav />
            </div>
        );
    }

    const estimatedFee = sessionInfo?.estimatedFee ?? stateEstFee;

    return (
        <div className="user-theme-page" style={{ backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
            <UserHeader />
            <div className="desktop-dashboard-wrapper p-4">
                <h5 className="fw-bold text-dark mb-4">
                    <i className="fa-solid fa-credit-card text-success me-2"></i>
                    Thanh Toán Phí Gửi Xe
                </h5>

                {loadingSession ? (
                    <div className="text-center py-5 text-muted">
                        <i className="fa-solid fa-spinner fa-spin fa-2x mb-3 d-block"></i>Đang tải...
                    </div>
                ) : sessionError ? (
                    <div className="text-center py-5">
                        <i className="fa-regular fa-circle-xmark fa-3x mb-3 d-block text-muted opacity-40"></i>
                        <p className="text-muted">{sessionError}</p>
                        <button className="btn btn-outline-primary btn-sm" onClick={() => navigate('/user/booking')}>
                            <i className="fa-solid fa-calendar-check me-1"></i> Đặt chỗ mới
                        </button>
                    </div>
                ) : (
                    <div className="row g-4 justify-content-center">
                        <div className="col-md-6">

                            {/* Thông tin lượt gửi */}
                            <div className="card border-0 shadow-sm p-4 rounded-3 mb-3">
                                <h6 className="fw-bold text-dark mb-3">
                                    <i className="fa-solid fa-receipt text-primary me-2"></i>Chi Tiết Lượt Gửi Xe
                                </h6>
                                {sessionInfo?.slotCode && (
                                    <div className="d-flex justify-content-between small py-2 border-bottom">
                                        <span className="text-muted">Vị trí đỗ</span><strong>{sessionInfo.slotCode}</strong>
                                    </div>
                                )}
                                {sessionInfo?.licensePlate && (
                                    <div className="d-flex justify-content-between small py-2 border-bottom">
                                        <span className="text-muted">Biển số xe</span><strong>{sessionInfo.licensePlate}</strong>
                                    </div>
                                )}
                                {sessionInfo?.checkInTime && (
                                    <div className="d-flex justify-content-between small py-2 border-bottom">
                                        <span className="text-muted">Giờ vào</span><strong>{fmtTime(sessionInfo.checkInTime)}</strong>
                                    </div>
                                )}

                                {/* Tiền mặt — chỉ hiển thị số tiền, không cho thanh toán */}
                                <div
                                    className={`d-flex justify-content-between align-items-center py-3 px-3 rounded-3 mt-3 border-2 ${selectedMethod === 'Cash' ? 'border border-success bg-success bg-opacity-10' : 'border bg-light'}`}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setSelectedMethod('Cash')}
                                >
                                    <div className="d-flex align-items-center gap-2">
                                        <i className="fa-solid fa-money-bill-wave text-success fs-5"></i>
                                        <div>
                                            <div className="fw-bold small">Tiền Mặt</div>
                                            <div className="text-muted" style={{ fontSize: '11px' }}>Thanh toán tại quầy Staff</div>
                                        </div>
                                    </div>
                                    <strong className="text-success fs-5">{fmtMoney(estimatedFee)}</strong>
                                </div>

                                {selectedMethod === 'Cash' && (
                                    <div className="alert alert-warning border-0 mt-2 py-2 small mb-0">
                                        <i className="fa-solid fa-circle-info me-1"></i>
                                        Vui lòng đến quầy Staff để hoàn tất thanh toán và mở barrier ra cổng.
                                    </div>
                                )}

                                {/* QR PayOS */}
                                <div
                                    className={`d-flex justify-content-between align-items-center py-3 px-3 rounded-3 mt-3 border-2 ${selectedMethod === 'QR_PAYOS' ? 'border border-primary bg-primary bg-opacity-10' : 'border bg-light'}`}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setSelectedMethod('QR_PAYOS')}
                                >
                                    <div className="d-flex align-items-center gap-2">
                                        <i className="fa-solid fa-qrcode text-primary fs-5"></i>
                                        <div>
                                            <div className="fw-bold small">QR PayOS</div>
                                            <div className="text-muted" style={{ fontSize: '11px' }}>Quét mã — mọi app ngân hàng</div>
                                        </div>
                                    </div>
                                    <strong className="text-primary fs-5">{fmtMoney(estimatedFee)}</strong>
                                </div>

                                {payError && <div className="error-banner mt-3">{payError}</div>}
                            </div>

                            {/* Nút hành động */}
                            {selectedMethod === 'QR_PAYOS' && (
                                <button
                                    className="btn btn-primary w-100 fw-bold py-3"
                                    style={{ fontSize: '1.05rem', borderRadius: 10 }}
                                    onClick={handlePayOS}
                                    disabled={paying || qrPolling}
                                >
                                    {paying
                                        ? <><i className="fa-solid fa-spinner fa-spin me-2"></i>Đang tạo mã QR...</>
                                        : qrPolling
                                            ? <><i className="fa-solid fa-spinner fa-spin me-2"></i>Đang chờ thanh toán...</>
                                            : <><i className="fa-solid fa-qrcode me-2"></i>Tạo Mã QR Thanh Toán</>
                                    }
                                </button>
                            )}

                            <button className="btn btn-link text-muted w-100 mt-2 small" onClick={() => navigate('/user/tracking')}>
                                ← Quay lại theo dõi lượt gửi xe
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <UserBottomNav />

            {/* Modal QR */}
            {qrData && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 2000 }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 380 }}>
                        <div className="modal-content border-0 shadow-lg rounded-4 p-4 text-center">
                            <h5 className="fw-bold mb-1">
                                <i className="fa-solid fa-qrcode text-primary me-2"></i>Quét Mã QR Để Thanh Toán
                            </h5>
                            <p className="text-muted small mb-3">
                                Dùng app <strong>ngân hàng bất kỳ</strong> — MB, VCB, TCB, Momo, ZaloPay...
                            </p>
                            {qrData.qrCode ? (
                                <div className="d-inline-block p-3 bg-white rounded-3 border shadow-sm mb-3 qr-code-container">
                                    <QRCodeSVG value={qrData.qrCode} size={220} level="M" includeMargin={false} />
                                </div>
                            ) : (
                                <div className="alert alert-warning small">Không có dữ liệu QR. Vui lòng thử lại.</div>
                            )}
                            <div className="fw-black text-success mb-1" style={{ fontSize: '1.8rem' }}>{fmtMoney(qrData.amount)}</div>
                            <p className="text-muted small mb-3">Mã QR có hiệu lực <strong>15 phút</strong>. Không cần chuyển sang trang khác.</p>
                            {qrPolling && (
                                <div className="alert alert-primary py-2 small mb-3 border-0 rounded-3">
                                    <i className="fa-solid fa-spinner fa-spin me-2"></i>Đang chờ xác nhận từ ngân hàng...
                                </div>
                            )}
                            <button className="btn btn-outline-secondary btn-sm fw-bold w-100"
                                    onClick={() => { clearInterval(pollingRef.current); setQrData(null); setQrPolling(false); }}>
                                <i className="fa-solid fa-xmark me-1"></i>Hủy / Thử Lại
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserPayment;
