// src/pages/user/UserSupport.jsx
// Feature 6: Feedback & Support System — gửi ticket + xem lịch sử
import { useState, useEffect, useContext, useCallback } from 'react';
import api from '../../config/Api';
import { AuthContext } from '../../context/AuthContext';
import { getGuestProfile, getGuestToken, saveGuestProfile } from '../../utils/guestIdentity';
import UserHeader    from '../../components/UserHeader';
import UserBottomNav from '../../components/UserBottomNav';
import '../../assets/css/userStyle.css';

const API = 'http://localhost:8080/api';

const CATEGORIES = [
    { id: 'LostCard',      label: 'Mất Thẻ',         icon: 'fa-id-card',           color: '#dc3545' },
    { id: 'IncorrectFee',  label: 'Sai Phí',          icon: 'fa-money-bill-wave',   color: '#fd7e14' },
    { id: 'MissingVehicle',label: 'Khó Tìm Xe',       icon: 'fa-magnifying-glass',  color: '#6f42c1' },
    { id: 'OccupiedSlot',  label: 'Chỗ Bị Chiếm',    icon: 'fa-car-burst',         color: '#0dcaf0' },
    { id: 'Others',        label: 'Khác',             icon: 'fa-ellipsis',          color: '#6c757d' },
];

const CATEGORY_DESC = {
    LostCard:       'Mô tả: Bạn mất thẻ/QR tại tầng/khu vực nào? Thời gian xảy ra?',
    IncorrectFee:   'Mô tả: Số tiền bị thu sai là bao nhiêu? Session ID?',
    MissingVehicle: 'Mô tả: Biển số xe, vị trí đã đỗ, thời gian gửi?',
    OccupiedSlot:   'Mô tả: Mã slot đã đặt, ai đang chiếm chỗ?',
    Others:         'Mô tả chi tiết vấn đề của bạn.',
};

const STAFF_CATEGORIES = ['LostCard', 'IncorrectFee', 'OccupiedSlot'];
// MissingVehicle xử lý riêng — tra cứu DB, không gửi feedback
const LOOKUP_CATEGORY  = 'MissingVehicle';

function fmtTime(dtStr) {
    if (!dtStr) return '—';
    return new Date(dtStr).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function UserSupport() {
    const { user } = useContext(AuthContext);

    // ── Form state ──
    const [category,    setCategory]    = useState('');
    const [licensePlate, setLicensePlate] = useState('');
    const [description, setDescription] = useState('');
    const [guestName,   setGuestName]   = useState(() => getGuestProfile().guestName || '');
    const [guestPhone,  setGuestPhone]  = useState(() => getGuestProfile().guestPhone || '');
    const [charCount,   setCharCount]   = useState(0);
    const [submitting,  setSubmitting]  = useState(false);
    const [formError,   setFormError]   = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    // ── Vehicle lookup state (chỉ dùng cho MissingVehicle) ──
    const [lookupPlate,   setLookupPlate]   = useState('');
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupResult,  setLookupResult]  = useState(null);  // { slotCode, floorId, checkInTime }
    const [lookupError,   setLookupError]   = useState('');

    // ── History state ──
    const [feedbacks,    setFeedbacks]   = useState([]);
    const [loadingHist,  setLoadingHist] = useState(true);
    const [activeTab,    setActiveTab]   = useState('form'); // 'form' | 'history'

    // Fetch feedback history
    const fetchHistory = useCallback(() => {
        setLoadingHist(true);
        const url = user
            ? `${API}/feedback/user/${user.userId}`
            : `${API}/feedback/guest/${getGuestToken()}`;
        api.get(url)
            .then(res => setFeedbacks(res.data))
            .catch(() => setFeedbacks([]))
            .finally(() => setLoadingHist(false));
    }, [user]);

    useEffect(() => { fetchHistory(); }, [fetchHistory]);

    // Handle textarea change với char counter
    const handleDescChange = (e) => {
        const val = e.target.value;
        if (val.length <= 500) {
            setDescription(val);
            setCharCount(val.length);
        }
    };

    // Reset lookup khi đổi category
    const handleCategoryChange = (catId) => {
        setCategory(catId);
        setLookupPlate('');
        setLookupResult(null);
        setLookupError('');
    };

    // Tra cứu vị trí xe theo biển số — chỉ dùng cho MissingVehicle
    const handleLookup = async (e) => {
        e.preventDefault();
        if (!lookupPlate.trim()) return;
        setLookupLoading(true);
        setLookupResult(null);
        setLookupError('');
        try {
            const res = await api.get(`${API}/feedback/find-vehicle?licensePlate=${encodeURIComponent(lookupPlate.trim().toUpperCase())}`);
            setLookupResult(res.data);
        } catch (err) {
            const msg = err.response?.data?.error || 'Sai biển số xe/ Xe không tồn tại trong bãi. Vui lòng nhập lại !!!';
            setLookupError(msg);
        } finally {
            setLookupLoading(false);
        }
    };

    // Submit ticket
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        if (!category) {
            setFormError('Vui lòng chọn loại vấn đề.');
            return;
        }
        if (!user && !guestPhone.trim()) {
            setFormError('Vui lòng nhập số điện thoại để đội hỗ trợ liên hệ.');
            return;
        }
        if (STAFF_CATEGORIES.includes(category) && !licensePlate.trim()) {
            setFormError('Vui long nhap bien so xe de nhan vien tra cuu va xu ly.');
            return;
        }
        if (description.trim().length < 10) {
            setFormError('Mô tả phải có ít nhất 10 ký tự.');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                category,
                licensePlate: STAFF_CATEGORIES.includes(category) ? licensePlate.trim().toUpperCase() : null,
                description: description.trim(),
            };
            if (user) {
                await api.post(`${API}/feedback/submit`, {
                    ...payload,
                    userId: user.userId,
                });
            } else {
                saveGuestProfile({ guestName: guestName.trim(), guestPhone: guestPhone.trim() });
                await api.post(`${API}/feedback/guest/submit`, {
                    ...payload,
                    guestToken: getGuestToken(),
                    guestName: guestName.trim(),
                    guestPhone: guestPhone.trim(),
                });
            }
            setFormSuccess('Gửi phản ánh thành công! Chúng tôi sẽ xử lý trong vòng 24 giờ.');
            setCategory('');
            setLicensePlate('');
            setDescription('');
            setCharCount(0);
            fetchHistory(); // refresh list
            // Tự chuyển sang tab history sau 1.5s
            setTimeout(() => setActiveTab('history'), 1500);
        } catch (err) {
            const msg = err.response?.data?.error || 'Gửi phản ánh thất bại. Vui lòng thử lại.';
            setFormError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    // Status counts
    const pendingCount    = feedbacks.filter(f => f.status === 'Pending').length;
    const processingCount = feedbacks.filter(f => f.status === 'Processing').length;
    const resolvedCount   = feedbacks.filter(f => f.status === 'Resolved').length;

    return (
        <div className="user-theme-page" style={{ backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
            <UserHeader />
            {/* Tăng chiều rộng container tối đa lên 1400px để giao diện rộng mở dãn đều hai bên */}
            <div className="desktop-dashboard-wrapper p-4 container-fluid" style={{ maxWidth: '1400px', margin: '0 auto' }}>

                {/* Header */}
                <div className="mb-4">
                    <h5 className="fw-bold text-dark mb-1 fs-4">
                        <i className="fa-solid fa-headset me-2" style={{ color: '#fd7e14' }}></i>
                        Hỗ Trợ & Phản Ánh
                    </h5>
                    <p className="text-muted small mb-0 fs-6">
                        Gửi ticket hỗ trợ và theo dõi trạng thái xử lý từ đội ngũ quản lý.
                    </p>
                </div>

                {/* Stats row - Tối ưu hóa kích thước hộp thống kê rộng hơn */}
                {feedbacks.length > 0 && (
                    <div className="row g-4 mb-4">
                        <div className="col-4">
                            <div className="text-center p-3 bg-white rounded-3 shadow-sm border-bottom border-warning border-3">
                                <div className="fw-black text-warning" style={{ fontSize: '2rem' }}>{pendingCount}</div>
                                <div className="text-muted fw-bold" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Chờ Xử Lý</div>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="text-center p-3 bg-white rounded-3 shadow-sm border-bottom border-primary border-3">
                                <div className="fw-black text-primary" style={{ fontSize: '2rem' }}>{processingCount}</div>
                                <div className="text-muted fw-bold" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Đang Xử Lý</div>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="text-center p-3 bg-white rounded-3 shadow-sm border-bottom border-success border-3">
                                <div className="fw-black text-success" style={{ fontSize: '2rem' }}>{resolvedCount}</div>
                                <div className="text-muted fw-bold" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Đã Giải Quyết</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab bar */}
                <div className="d-flex gap-2 mb-4">
                    <button
                        className={`btn btn-md fw-bold px-4 py-2 shadow-sm ${activeTab === 'form' ? 'btn-dark' : 'btn-outline-secondary'}`}
                        onClick={() => setActiveTab('form')}
                    >
                        <i className="fa-solid fa-pen-to-square me-2"></i>Gửi Phản Ánh
                    </button>
                    <button
                        className={`btn btn-md fw-bold px-4 py-2 shadow-sm ${activeTab === 'history' ? 'btn-dark' : 'btn-outline-secondary'}`}
                        onClick={() => { setActiveTab('history'); fetchHistory(); }}
                    >
                        <i className="fa-solid fa-clock-rotate-left me-2"></i>
                        Lịch Sử Hoạt Động
                        {pendingCount > 0 && (
                            <span className="badge bg-warning text-dark ms-2 px-2" style={{ fontSize: '0.75rem' }}>
                                {pendingCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* ── TAB: FORM ── */}
                {activeTab === 'form' && (
                    <div className="row g-4">
                        {/* Mở rộng cột Form lên col-lg-7 dãn theo chiều ngang */}
                        <div className="col-12 col-md-7 col-lg-7">
                            <div className="card border-0 shadow-sm p-4 rounded-3 bg-white h-100">
                                <h6 className="fw-bold text-dark mb-4 fs-5">Mô Tả Vấn Đề</h6>

                                {!user && (
                                    <div className="success-banner mb-3">
                                        <i className="fa-solid fa-user-clock me-1"></i>
                                        Khách vãng lai có thể gửi phản ánh và xem trạng thái trên thiết bị này.
                                    </div>
                                )}
                                {formError   && <div className="error-banner mb-3">{formError}</div>}
                                {formSuccess  && <div className="success-banner mb-3">
                                    <i className="fa-solid fa-circle-check me-2"></i>{formSuccess}
                                </div>}

                                <form onSubmit={handleSubmit}>
                                    {!user && (
                                        <div className="row g-3 mb-4">
                                            <div className="col-6">
                                                <label className="small fw-bold text-muted mb-1 d-block">Họ Tên</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-lg"
                                                    placeholder="Tên khách"
                                                    value={guestName}
                                                    onChange={e => setGuestName(e.target.value)}
                                                    style={{ fontSize: '0.95rem' }}
                                                />
                                            </div>
                                            <div className="col-6">
                                                <label className="small fw-bold text-muted mb-1 d-block">
                                                    Số Điện Thoại <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    className="form-control form-control-lg"
                                                    placeholder="09xxxxxxxx"
                                                    value={guestPhone}
                                                    onChange={e => setGuestPhone(e.target.value)}
                                                    required
                                                    style={{ fontSize: '0.95rem' }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Chọn loại vấn đề - Grid nút bấm co dãn rộng rãi */}
                                    <div className="mb-4">
                                        <label className="small fw-bold text-muted mb-2 d-block">
                                            Loại Vấn Đề <span className="text-danger">*</span>
                                        </label>
                                        <div className="feedback-category-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                                            {CATEGORIES.map(cat => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    className={`feedback-cat-btn py-3 d-flex flex-column align-items-center justify-content-center gap-2 rounded-3 ${category === cat.id ? 'selected border-2' : 'border'}`}
                                                    onClick={() => handleCategoryChange(cat.id)}
                                                    style={{ minHeight: '90px', transition: 'all 0.2s' }}
                                                >
                                                    <i
                                                        className={`fa-solid ${cat.icon} fa-lg`}
                                                        style={{ color: category === cat.id ? cat.color : '#adb5bd' }}
                                                    ></i>
                                                    <span className="fw-semibold" style={{ fontSize: '0.85rem' }}>{cat.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* ── MissingVehicle: tra cứu vị trí xe ── */}
                                    {category === LOOKUP_CATEGORY && (
                                        <div className="mb-4 animate-fade-in">
                                            <label className="small fw-bold text-muted mb-2 d-block">
                                                Biển Số Xe Cần Tìm <span className="text-danger">*</span>
                                            </label>
                                            <div className="d-flex gap-2">
                                                <input
                                                    type="text"
                                                    className="form-control form-control-lg text-uppercase fw-bold"
                                                    placeholder="VD: 51H-123.45"
                                                    value={lookupPlate}
                                                    onChange={e => {
                                                        setLookupPlate(e.target.value.toUpperCase());
                                                        setLookupResult(null);
                                                        setLookupError('');
                                                    }}
                                                    style={{ fontSize: '1rem', letterSpacing: '0.5px' }}
                                                    maxLength={12}
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-primary fw-bold px-4"
                                                    onClick={handleLookup}
                                                    disabled={lookupLoading || !lookupPlate.trim()}
                                                >
                                                    {lookupLoading
                                                        ? <i className="fa-solid fa-spinner fa-spin"></i>
                                                        : <><i className="fa-solid fa-magnifying-glass me-1"></i>Tìm</>
                                                    }
                                                </button>
                                            </div>

                                            {/* Kết quả tìm thấy - Đảm bảo màu sắc hiển thị như nhau giữa lightmode và darkmode */}
                                            {lookupResult && (
                                                <div className="mt-3 p-4 rounded-3 border" style={{ backgroundColor: '#d1e7dd', borderColor: '#badbcc', color: '#0f5132' }}>
                                                    <div className="fw-bold mb-2 fs-6" style={{ color: '#0f5132' }}>
                                                        <i className="fa-solid fa-circle-check me-2"></i>
                                                        Đã tìm thấy xe của bạn!
                                                    </div>
                                                    <div className="d-flex flex-column gap-2">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <i className="fa-solid fa-car" style={{ color: '#0f5132' }}></i>
                                                            <span className="fw-semibold" style={{ color: '#0f5132' }}>Biển số:</span>
                                                            <span className="badge fs-6 fw-bold px-3 py-1" style={{ backgroundColor: '#212529', color: '#ffffff' }}>{lookupResult.licensePlate}</span>
                                                        </div>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <i className="fa-solid fa-square-parking" style={{ color: '#0d6efd' }}></i>
                                                            <span className="fw-semibold" style={{ color: '#0f5132' }}>Vị trí ô đỗ:</span>
                                                            <span className="badge fs-5 px-3 py-2 fw-bold" style={{ backgroundColor: '#0d6efd', color: '#ffffff' }}>
                                                                {lookupResult.slotCode || `Slot #${lookupResult.slotId}`}
                                                            </span>
                                                        </div>
                                                        {lookupResult.checkInTime && (
                                                            <div className="d-flex align-items-center gap-2">
                                                                <i className="fa-solid fa-clock" style={{ color: '#495057' }}></i>
                                                                <span className="fw-semibold" style={{ color: '#0f5132' }}>Vào bãi lúc:</span>
                                                                <span style={{ color: '#495057', fontWeight: 600 }}>
                                                                    {new Date(lookupResult.checkInTime).toLocaleString('vi-VN', {
                                                                        day: '2-digit', month: '2-digit', year: 'numeric',
                                                                        hour: '2-digit', minute: '2-digit'
                                                                    })}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="mt-3 small" style={{ color: '#0f5132' }}>
                                                        <i className="fa-solid fa-info-circle me-1"></i>
                                                        Vui lòng đến đúng ô đỗ xe trên. Nếu cần hỗ trợ thêm, hãy liên hệ nhân viên bãi.
                                                    </div>
                                                </div>
                                            )}

                                            {/* Không tìm thấy */}
                                            {lookupError && (
                                                <div className="mt-3 p-3 rounded-3 border border-danger bg-danger-subtle animate-fade-in">
                                                    <i className="fa-solid fa-circle-exclamation text-danger me-2"></i>
                                                    <span className="text-danger fw-semibold">{lookupError}</span>
                                                </div>
                                            )}

                                            {/* Hướng dẫn khi chưa tra cứu */}
                                            {!lookupResult && !lookupError && !lookupLoading && (
                                                <div className="text-muted mt-2 small">
                                                    <i className="fa-solid fa-info-circle me-1"></i>
                                                    Nhập đúng biển số xe đã đăng ký khi gửi xe và nhấn <strong>Tìm</strong>.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* ── Biển số xe cho các category gửi Staff ── */}
                                    {STAFF_CATEGORIES.includes(category) && (
                                        <div className="mb-4 animate-fade-in">
                                            <label className="small fw-bold text-muted mb-2 d-block">
                                                Biển Số Xe <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control form-control-lg text-uppercase fw-bold"
                                                placeholder="VD: 30K-12345"
                                                value={licensePlate}
                                                onChange={e => setLicensePlate(e.target.value.toUpperCase())}
                                                required
                                                style={{ fontSize: '1rem', letterSpacing: '0.5px' }}
                                            />
                                            <div className="text-muted mt-2 small">
                                                <i className="fa-solid fa-info-circle me-1"></i> Bắt buộc để Staff liên kết phản ánh với phiên gửi xe.
                                            </div>
                                        </div>
                                    )}

                                    {/* Mô tả — ẩn khi đang ở MissingVehicle */}
                                    {category !== LOOKUP_CATEGORY && (
                                        <div className="mb-4">
                                            <label className="small fw-bold text-muted mb-2 d-block">
                                                Mô Tả Chi Tiết <span className="text-danger">*</span>
                                            </label>
                                            <textarea
                                                className="form-control p-3"
                                                rows={6}
                                                placeholder={category ? CATEGORY_DESC[category] : 'Chọn loại vấn đề ở trên, sau đó mô tả chi tiết...'}
                                                value={description}
                                                onChange={handleDescChange}
                                                required
                                                style={{ resize: 'vertical', fontSize: '0.95rem' }}
                                            />
                                            <div className="d-flex justify-content-between mt-2">
                                                <span className="text-muted small">Tối thiểu 10 ký tự</span>
                                                <span className="fw-bold small" style={{ color: charCount > 450 ? '#dc3545' : '#adb5bd' }}>
                                                    {charCount}/500
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Submit — ẩn khi đang ở MissingVehicle */}
                                    {category !== LOOKUP_CATEGORY && (
                                        <button
                                            type="submit"
                                            className="btn btn-dark w-100 fw-bold py-3 fs-6 shadow-sm mt-2"
                                            disabled={submitting}
                                        >
                                            {submitting ? (
                                                <><i className="fa-solid fa-spinner fa-spin me-2"></i>Đang gửi phản ánh...</>
                                            ) : (
                                                <><i className="fa-solid fa-paper-plane me-2"></i>GỬI HỒ SƠ PHẢN ÁNH</>
                                            )}
                                        </button>
                                    )}
                                </form>
                            </div>
                        </div>

                        {/* Panel hướng dẫn bên phải - col-lg-5 */}
                        <div className="col-12 col-md-5 col-lg-5">
                            <div className="card border-0 shadow-sm p-4 rounded-3 h-100 bg-white d-flex flex-column justify-content-between">
                                <div>
                                    <h6 className="fw-bold text-dark mb-4 fs-5">
                                        <i className="fa-solid fa-circle-question text-primary me-2"></i>
                                        Hướng Dẫn Xử Lý
                                    </h6>
                                    <ul className="list-unstyled mb-4">
                                        {[
                                            { icon: 'fa-id-card', color: '#dc3545', title: 'Mất Thẻ', desc: 'Đến quầy bảo vệ trực tiếp hoặc gửi ticket, nêu rõ biển số xe và giờ vào bãi.' },
                                            { icon: 'fa-money-bill-wave', color: '#fd7e14', title: 'Sai Phí Hệ Thống', desc: 'Ghi lại Session ID và số tiền bị thu sai. Lệnh hoàn phí xử lý từ 3-5 ngày.' },
                                            { icon: 'fa-magnifying-glass', color: '#6f42c1', title: 'Khó Tìm Vị Trí Xe', desc: 'Nhân viên bãi xe sẽ hỗ trợ dò vị trí và dẫn đường sau khi nhận thông tin.' },
                                            { icon: 'fa-car-burst', color: '#0dcaf0', title: 'Chỗ Đặt Bị Chiếm', desc: 'Chụp ảnh xe chiếm chỗ và ghi mã số slot. Đội kỹ thuật sẽ điều phối lại ngay.' },
                                        ].map((item, i) => (
                                            <li key={i} className="d-flex gap-3 mb-3 pb-3" style={{ borderBottom: '1px solid #f1f3f5' }}>
                                                <div style={{
                                                    width: 42, height: 42, borderRadius: '50%',
                                                    background: item.color + '18', flexShrink: 0,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    <i className={`fa-solid ${item.icon}`} style={{ color: item.color, fontSize: '1rem' }}></i>
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark mb-1 fs-6">{item.title}</div>
                                                    <div className="text-muted" style={{ fontSize: '0.82rem', lineHeight: '1.4' }}>{item.desc}</div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="p-4 rounded-3" style={{ background: '#e8f0fe', border: '1px solid #c2d3fb' }}>
                                    <div className="fw-bold text-primary mb-1 fs-6">
                                        <i className="fa-solid fa-phone-volume me-2"></i>Đường Dây Nóng Khẩn Cấp
                                    </div>
                                    <div className="fw-black my-1" style={{ fontSize: '1.5rem', color: '#1a1a2e', letterSpacing: '1px' }}>
                                        1900 xxxx
                                    </div>
                                    <div className="text-muted small">
                                        Ưu tiên gọi điện trực tiếp cho các sự cố xảy ra tại cửa barrier kiểm soát.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB: HISTORY ── */}
                {activeTab === 'history' && (
                    <div className="bg-white rounded-3 shadow-sm p-4 animate-fade-in" style={{ minHeight: '400px' }}>
                        {loadingHist ? (
                            <div className="text-center py-5 text-muted d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '300px' }}>
                                <i className="fa-solid fa-spinner fa-spin fa-2x mb-3 text-dark"></i>
                                <span>Đang tải danh sách lịch sử...</span>
                            </div>
                        ) : feedbacks.length === 0 ? (
                            <div className="text-center py-5 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '300px' }}>
                                <i className="fa-regular fa-message fa-4x mb-3 text-muted opacity-30"></i>
                                <h5 className="text-dark fw-bold">Chưa có lịch sử phản ánh</h5>
                                <p className="text-muted small mb-3">Mọi ticket yêu cầu hỗ trợ của bạn sẽ hiển thị đầy đủ tại đây.</p>
                                <button
                                    className="btn btn-dark btn-md fw-bold px-4"
                                    onClick={() => setActiveTab('form')}
                                >
                                    <i className="fa-solid fa-pen-to-square me-2"></i>Tạo Yêu Cầu Ngay
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                                    <span className="text-muted fw-semibold">Tổng số: <strong className="text-dark">{feedbacks.length}</strong> ticket yêu cầu</span>
                                    <button className="btn btn-outline-dark btn-sm px-3" onClick={fetchHistory}>
                                        <i className="fa-solid fa-arrows-rotate me-2"></i>Cập nhật dữ liệu
                                    </button>
                                </div>

                                <div className="d-flex flex-column gap-3">
                                    {feedbacks.map(fb => {
                                        const cat = CATEGORIES.find(c => c.id === fb.category) || { label: fb.category, icon: 'fa-ellipsis', color: '#6c757d' };
                                        return (
                                            <div key={fb.feedbackId} className="feedback-history-item p-4 border rounded-3 bg-light-subtle shadow-xs" style={{ transition: 'all 0.2s' }}>
                                                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div style={{
                                                            width: 40, height: 40, borderRadius: '50%',
                                                            background: cat.color + '18',
                                                            display: 'flex', alignItems: 'center', justifycontent: 'center', flexShrink: 0
                                                        }}>
                                                            <i className={`fa-solid ${cat.icon}`} style={{ color: cat.color, fontSize: '1rem', margin: 'auto' }}></i>
                                                        </div>
                                                        <div>
                                                            <div className="fw-bold text-dark fs-6">{cat.label}</div>
                                                            <div className="text-muted small mt-0.5">
                                                                Mã số: <strong>#{fb.feedbackId}</strong>  •  Thời gian gửi: {fmtTime(fb.createdAt)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className={`feedback-status-${fb.status} px-3 py-2 rounded-pill fw-bold small`}>
                                                        {fb.status === 'Pending'    && '⏳ Chờ phản hồi'}
                                                        {fb.status === 'Processing' && '🔧 Đang xử lý'}
                                                        {fb.status === 'Resolved'   && '✅ Đã giải quyết'}
                                                    </span>
                                                </div>
                                                <div className="text-dark fs-6 bg-white p-3 rounded-2 border" style={{ paddingLeft: '15px', marginLeft: '52px' }}>
                                                    {fb.licensePlate && (
                                                        <span className="fw-bold text-primary d-block mb-2">
                                                            <i className="fa-solid fa-car me-2"></i>Biển kiểm soát liên kết: {fb.licensePlate}
                                                        </span>
                                                    )}
                                                    <div style={{ whiteSpace: 'pre-line', lineHeight: '1.5', color: '#333' }}>
                                                        {fb.description}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
            <UserBottomNav />
        </div>
    );
}

export default UserSupport;