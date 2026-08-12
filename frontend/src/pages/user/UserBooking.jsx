// src/pages/user/UserBooking.jsx
// Feature 3: Đặt chỗ trước + Booking Expiration Timer + Chọn Khung Giờ & Đặt Cọc 25% qua QR PayOS
import { useState, useEffect, useContext, useCallback, useRef } from 'react';
import api from '../../config/Api';
import { AuthContext } from '../../context/AuthContext';
import { getGuestProfile, getGuestToken, saveGuestProfile } from '../../utils/guestIdentity';
import { QRCodeSVG } from 'qrcode.react';
import UserHeader    from '../../components/UserHeader';
import UserBottomNav from '../../components/UserBottomNav';
import '../../assets/css/userStyle.css';

const API = 'http://localhost:8080/api';

const VEHICLE_TYPES = [
    { id: 1, name: 'Xe máy', icon: 'fa-motorcycle', color: '#f39c12' },
    { id: 2, name: 'Ô tô',   icon: 'fa-car',        color: '#2980b9' },
];

function fmtMoney(n) { return Number(n || 0).toLocaleString('vi-VN') + 'đ'; }

// Format seconds → MM:SS
function parseLocalDateTimeParts(value) {
    if (!value) return null;
    const [datePart, timePart = ''] = String(value).replace('T', ' ').split(' ');
    const [year, month, day] = datePart.split('-');
    const [hour = '00', minute = '00'] = timePart.split(':');
    if (!year || !month || !day) return null;
    return { year, month, day, hour: hour.padStart(2, '0'), minute: minute.padStart(2, '0') };
}

function formatLocalTime(value) {
    const parts = parseLocalDateTimeParts(value);
    return parts ? `${parts.hour}:${parts.minute}` : '--';
}

function formatLocalDate(value) {
    const parts = parseLocalDateTimeParts(value);
    return parts ? `${parts.day}/${parts.month}/${parts.year}` : '--';
}

function formatCountdown(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

// Tính giây còn lại đến endTime
function secondsUntil(endTimeStr) {
    const end  = new Date(endTimeStr);
    const now  = new Date();
    const diff = Math.floor((end - now) / 1000);
    return Math.max(diff, 0);
}

function UserBooking() {
    const { user }       = useContext(AuthContext);

    // ── Form state ──
    const [vehicleTypeId, setVehicleTypeId] = useState(1);
    const [licensePlate,  setLicensePlate]  = useState('');
    const [guestName,     setGuestName]     = useState(() => getGuestProfile().guestName || '');
    const [guestPhone,    setGuestPhone]    = useState(() => getGuestProfile().guestPhone || '');
    const [submitting,    setSubmitting]    = useState(false);
    const [formError,     setFormError]     = useState('');

    // Khung giờ đón: Giờ, Phút, Ngày, Tháng, Năm (với giá trị mặc định là +30 phút từ bây giờ)
    const nowInit = new Date(Date.now() + 30 * 60 * 1000);
    const [checkInHour,   setCheckInHour]   = useState(nowInit.getHours());
    const [checkInMinute, setCheckInMinute] = useState(nowInit.getMinutes());
    const [checkInDay,    setCheckInDay]    = useState(nowInit.getDate());
    const [checkInMonth,  setCheckInMonth]  = useState(nowInit.getMonth() + 1);
    const [checkInYear,   setCheckInYear]   = useState(nowInit.getFullYear());
    const outInit = new Date(nowInit.getTime() + 60 * 60 * 1000);
    const [checkOutHour,   setCheckOutHour]   = useState(outInit.getHours());
    const [checkOutMinute, setCheckOutMinute] = useState(outInit.getMinutes());
    const [checkOutDay,    setCheckOutDay]    = useState(outInit.getDate());
    const [checkOutMonth,  setCheckOutMonth]  = useState(outInit.getMonth() + 1);
    const [checkOutYear,   setCheckOutYear]   = useState(outInit.getFullYear());

    // Slots & Slot chọn thủ công
    const [, setAvailableSlots] = useState([]);
    const [selectedSlotId, setSelectedSlotId] = useState(null);

    // ── Active bookings ──
    const [bookings,   setBookings]   = useState([]);
    const [loadingList, setLoadingList] = useState(true);

    // ── PayOS Deposit QR state ──
    const [qrData,        setQrData]        = useState(null);
    const [, setPendingBooking] = useState(null);
    const [qrPolling,     setQrPolling]     = useState(false);
    const pollingRef = useRef(null);

    // ── Countdown timers: { [bookingId]: seconds } ──
    const [countdowns, setCountdowns] = useState({});

    // Fetch slot khả dụng theo loại xe
    const fetchAvailableSlots = useCallback(async (typeId) => {
        try {
            const res = await api.get(`${API}/slots/available?vehicleTypeId=${typeId}`);
            if (Array.isArray(res.data) && res.data.length > 0) {
                setAvailableSlots(res.data);
                setSelectedSlotId(res.data[0].slotId);
            } else {
                setAvailableSlots([]);
                setSelectedSlotId(null);
            }
        } catch {
            setAvailableSlots([]);
            setSelectedSlotId(null);
        }
    }, []);

    useEffect(() => {
        fetchAvailableSlots(vehicleTypeId);
    }, [vehicleTypeId, fetchAvailableSlots]);

    // ── Fetch bookings của user ──
    const fetchBookings = useCallback(() => {
        setLoadingList(true);
        const url = user
            ? `${API}/bookings/user/${user.userId}`
            : `${API}/bookings/guest/${getGuestToken()}`;
        api.get(url)
            .then(res => {
                setBookings(res.data);
                // Khởi tạo countdown chỉ cho Confirmed
                const initial = {};
                res.data.forEach(b => {
                    if (b.status === 'Confirmed') {
                        initial[b.bookingId] = secondsUntil(b.startTime);
                    }
                });
                setCountdowns(initial);
            })
            .catch(() => {})
            .finally(() => setLoadingList(false));
    }, [user]);

    useEffect(() => { 
        fetchBookings(); 
        const pollTimer = setInterval(fetchBookings, 5000);
        return () => clearInterval(pollTimer);
    }, [fetchBookings]);

    // ── Countdown tick mỗi giây ──
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdowns(prev => {
                const updated = {};
                let anyChanged = false;
                Object.entries(prev).forEach(([id, secs]) => {
                    const next = Math.max(secs - 1, 0);
                    updated[id] = next;
                    if (next !== secs) anyChanged = true;
                    if (next === 0 && secs > 0) fetchBookings();
                });
                return anyChanged ? updated : prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [fetchBookings]);

    // Cleanup polling khi unmount
    useEffect(() => () => clearInterval(pollingRef.current), []);

    // ── Submit đặt chỗ & mở QR đặt cọc ──
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!licensePlate.trim()) { setFormError('Vui lòng nhập biển số xe.'); return; }
        if (!user && !guestPhone.trim()) { setFormError('Vui lòng nhập số điện thoại để theo dõi đặt chỗ.'); return; }

        setSubmitting(true);
        setFormError('');
        try {
            const hr  = parseInt(checkInHour, 10);
            const min = parseInt(checkInMinute, 10);
            const dy  = parseInt(checkInDay, 10);
            const mo  = parseInt(checkInMonth, 10);
            const yr  = parseInt(checkInYear, 10);
            const outHr  = parseInt(checkOutHour, 10);
            const outMin = parseInt(checkOutMinute, 10);
            const outDy  = parseInt(checkOutDay, 10);
            const outMo  = parseInt(checkOutMonth, 10);
            const outYr  = parseInt(checkOutYear, 10);

            if (isNaN(hr) || hr < 0 || hr > 23) {
                setFormError('Giờ không hợp lệ. Vui lòng nhập từ 0 đến 23.');
                setSubmitting(false);
                return;
            }
            if (isNaN(min) || min < 0 || min > 59) {
                setFormError('Phút không hợp lệ. Vui lòng nhập từ 0 đến 59.');
                setSubmitting(false);
                return;
            }
            if (isNaN(dy) || dy < 1 || dy > 31 || isNaN(mo) || mo < 1 || mo > 12 || isNaN(yr) || yr < 2024) {
                setFormError('Ngày tháng năm không hợp lệ.');
                setSubmitting(false);
                return;
            }

            if (isNaN(outHr) || outHr < 0 || outHr > 23 || isNaN(outMin) || outMin < 0 || outMin > 59) {
                setFormError('Gio ra khong hop le. Vui long nhap gio 0-23 va phut 0-59.');
                setSubmitting(false);
                return;
            }
            if (isNaN(outDy) || outDy < 1 || outDy > 31 || isNaN(outMo) || outMo < 1 || outMo > 12 || isNaN(outYr) || outYr < 2024) {
                setFormError('Ngay ra khong hop le.');
                setSubmitting(false);
                return;
            }

            const targetDate = new Date(yr, mo - 1, dy, hr, min, 0);
            const targetOutDate = new Date(outYr, outMo - 1, outDy, outHr, outMin, 0);
            if (isNaN(targetDate.getTime())) {
                setFormError('Thời gian check-in không hợp lệ.');
                setSubmitting(false);
                return;
            }

            if (isNaN(targetOutDate.getTime())) {
                setFormError('Thoi gian check-out khong hop le.');
                setSubmitting(false);
                return;
            }

            if (targetDate <= new Date()) {
                setFormError('Thời gian check-in phải lớn hơn thời gian hiện tại.');
                setSubmitting(false);
                return;
            }

            // Định dạng ISO yyyy-MM-ddTHH:mm:ss
            if (targetOutDate <= targetDate) {
                setFormError('Gio ra phai sau gio vao.');
                setSubmitting(false);
                return;
            }

            const pad = (n) => String(n).padStart(2, '0');
            const checkInTarget = `${yr}-${pad(mo)}-${pad(dy)}T${pad(hr)}:${pad(min)}:00`;
            const checkOutTarget = `${outYr}-${pad(outMo)}-${pad(outDy)}T${pad(outHr)}:${pad(outMin)}:00`;

            const payload = {
                vehicleTypeId,
                licensePlate: licensePlate.trim().toUpperCase(),
                slotId: selectedSlotId || null,
                checkInTime: checkInTarget,
                checkOutTime: checkOutTarget
            };

            let resBooking;
            if (user) {
                resBooking = await api.post(`${API}/bookings/create`, {
                    ...payload,
                    userId: user.userId,
                });
            } else {
                saveGuestProfile({ guestName: guestName.trim(), guestPhone: guestPhone.trim() });
                resBooking = await api.post(`${API}/bookings/guest/create`, {
                    ...payload,
                    guestToken: getGuestToken(),
                    guestName: guestName.trim(),
                    guestPhone: guestPhone.trim(),
                });
            }

            const createdBooking = resBooking.data;
            setPendingBooking(createdBooking);

            // Tạo mã QR thanh toán tiền đặt cọc 25%
            const qrRes = await api.post(`${API}/payments/create-qr`, { bookingId: createdBooking.bookingId });
            setQrData(qrRes.data);
            setQrPolling(true);

            let attempts = 0;
            pollingRef.current = setInterval(async () => {
                attempts++;
                try {
                    const statusRes = await api.get(`${API}/payments/status/${qrRes.data.orderId}`);
                    if (statusRes.data.status === 'SUCCESS') {
                        clearInterval(pollingRef.current);
                        setQrPolling(false);
                        setQrData(null);
                        setPendingBooking(null);
                        setLicensePlate('');
                        fetchBookings();
                        fetchAvailableSlots(vehicleTypeId);
                        alert('Xác nhận thanh toán tiền đặt cọc thành công! Biển số xe của bạn đã được đặt trước, slot sẽ được phân bổ khi staff check-in.');
                    }
                } catch { /* ignore */ }

                if (attempts >= 200) {
                    clearInterval(pollingRef.current);
                    setQrPolling(false);
                    setFormError('Hết thời gian chờ thanh toán tiền đặt cọc. Vui lòng thử lại.');
                    setQrData(null);
                }
            }, 3000);

        } catch (err) {
            const msg = err.response?.data?.error || 'Đặt chỗ thất bại. Vui lòng thử lại.';
            setFormError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    // ── Hủy booking ──
    const handleCancel = async (bookingId) => {
        if (!window.confirm('Hủy đặt chỗ này?')) return;
        try {
            const url = user
                ? `${API}/bookings/cancel/${bookingId}?userId=${user.userId}`
                : `${API}/bookings/guest/cancel/${bookingId}?guestToken=${encodeURIComponent(getGuestToken())}`;
            await api.delete(url);
            fetchBookings();
            fetchAvailableSlots(vehicleTypeId);
        } catch {
            alert('Không thể hủy. Vui lòng thử lại.');
        }
    };

    const activeBookings   = bookings.filter(b => b.status === 'Confirmed' || b.status === 'CheckedIn');
    const historyBookings  = bookings.filter(b => b.status !== 'Confirmed' && b.status !== 'CheckedIn');

    const getSlotName = (slot) => slot?.slotName || slot?.slotCode || (slot?.slotId ? `#${slot.slotId}` : 'Đang chọn...');

    return (
        <div className="user-theme-page" style={{ backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
            <UserHeader />
            <div className="desktop-dashboard-wrapper p-4 container-fluid" style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <h5 className="fw-bold text-dark mb-4 fs-4">
                    <i className="fa-solid fa-calendar-check text-success me-2"></i>
                    Đặt Chỗ Trước
                </h5>

                <div className="row g-4">
                    {/* ── Form đặt chỗ ── */}
                    <div className="col-12 col-md-5 col-lg-5">
                        <div className="booking-form-card shadow-sm p-4 bg-white rounded-3">
                            <h6 className="fw-bold text-dark mb-4 fs-5">Thông Tin Đặt Chỗ</h6>

                            {!user && (
                                <div className="success-banner mb-3">
                                    <i className="fa-solid fa-user-clock me-1"></i>
                                    Khách vãng lai có thể đặt chỗ và theo dõi bằng số điện thoại trên thiết bị này.
                                </div>
                            )}
                            {formError && <div className="error-banner">{formError}</div>}

                            <form onSubmit={handleSubmit}>
                                {!user && (
                                    <div className="row g-2 mb-3">
                                        <div className="col-6">
                                            <label className="small fw-bold text-muted mb-1 d-block">Họ Tên</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                placeholder="Tên khách"
                                                value={guestName}
                                                onChange={e => setGuestName(e.target.value)}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="small fw-bold text-muted mb-1 d-block">
                                                Số Điện Thoại <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                className="form-control form-control-sm"
                                                placeholder="09xxxxxxxx"
                                                value={guestPhone}
                                                onChange={e => setGuestPhone(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Chọn loại xe */}
                                <div className="mb-4">
                                    <label className="small fw-bold text-muted mb-2 d-block">Loại Phương Tiện</label>
                                    <div className="d-flex gap-2">
                                        {VEHICLE_TYPES.map(vt => (
                                            <button
                                                key={vt.id}
                                                type="button"
                                                className={`btn btn-sm flex-fill py-2 ${vehicleTypeId === vt.id ? 'text-white' : 'btn-outline-secondary'}`}
                                                style={vehicleTypeId === vt.id ? { background: vt.color, borderColor: vt.color } : {}}
                                                onClick={() => setVehicleTypeId(vt.id)}
                                            >
                                                <i className={`fa-solid ${vt.icon} me-1`}></i>
                                                <span style={{ fontSize: '0.85rem' }}>{vt.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Biển số xe */}
                                <div className="mb-4">
                                    <label className="small fw-bold text-muted mb-1 d-block">
                                        Biển Số Xe <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg text-uppercase fw-bold"
                                        placeholder="VD: 51H-123.45"
                                        value={licensePlate}
                                        onChange={e => setLicensePlate(e.target.value)}
                                        maxLength={12}
                                        required
                                        style={{ fontSize: '1rem' }}
                                    />
                                </div>

                                {/* Điền thời gian check-in: Giờ, Phút, Ngày, Tháng, Năm */}
                                <div className="mb-4">
                                    <label className="small fw-bold text-muted mb-2 d-block">
                                        <i className="fa-regular fa-clock me-1 text-primary"></i>Khung Giờ Check-in Dự Kiến <span className="text-danger">*</span>
                                    </label>
                                    <div className="row g-2">
                                        <div className="col-4 col-sm-2">
                                            <label className="text-muted small d-block mb-1" style={{ fontSize: '0.75rem' }}>Giờ (0-23)</label>
                                            <input
                                                type="number"
                                                className="form-control form-control-sm fw-bold text-center"
                                                min={0}
                                                max={23}
                                                value={checkInHour}
                                                onChange={e => setCheckInHour(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="col-4 col-sm-2">
                                            <label className="text-muted small d-block mb-1" style={{ fontSize: '0.75rem' }}>Phút (0-59)</label>
                                            <input
                                                type="number"
                                                className="form-control form-control-sm fw-bold text-center"
                                                min={0}
                                                max={59}
                                                value={checkInMinute}
                                                onChange={e => setCheckInMinute(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="col-4 col-sm-2">
                                            <label className="text-muted small d-block mb-1" style={{ fontSize: '0.75rem' }}>Ngày</label>
                                            <input
                                                type="number"
                                                className="form-control form-control-sm fw-bold text-center"
                                                min={1}
                                                max={31}
                                                value={checkInDay}
                                                onChange={e => setCheckInDay(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="col-6 col-sm-3">
                                            <label className="text-muted small d-block mb-1" style={{ fontSize: '0.75rem' }}>Tháng</label>
                                            <input
                                                type="number"
                                                className="form-control form-control-sm fw-bold text-center"
                                                min={1}
                                                max={12}
                                                value={checkInMonth}
                                                onChange={e => setCheckInMonth(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="col-6 col-sm-3">
                                            <label className="text-muted small d-block mb-1" style={{ fontSize: '0.75rem' }}>Năm</label>
                                            <input
                                                type="number"
                                                className="form-control form-control-sm fw-bold text-center"
                                                min={2024}
                                                max={2030}
                                                value={checkInYear}
                                                onChange={e => setCheckInYear(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="text-muted small mt-2">
                                        <i className="fa-solid fa-circle-info me-1 text-primary"></i>
                                        Thời gian đặt cọc 25% sẽ được tính từ thời điểm thanh toán thành công đến mốc thời gian check-in này.
                                    </div>
                                </div>


                                {/* Thông báo đặt cọc 25% qua QR */}
                                <div className="mb-4">
                                    <label className="small fw-bold text-muted mb-2 d-block">
                                        <i className="fa-regular fa-clock me-1 text-danger"></i>Giờ ra dự kiến <span className="text-danger">*</span>
                                    </label>
                                    <div className="row g-2">
                                        <div className="col-4 col-sm-2">
                                            <label className="text-muted small d-block mb-1" style={{ fontSize: '0.75rem' }}>Giờ</label>
                                            <input type="number" className="form-control form-control-sm fw-bold text-center" min={0} max={23} value={checkOutHour} onChange={e => setCheckOutHour(e.target.value)} required />
                                        </div>
                                        <div className="col-4 col-sm-2">
                                            <label className="text-muted small d-block mb-1" style={{ fontSize: '0.75rem' }}>Phút</label>
                                            <input type="number" className="form-control form-control-sm fw-bold text-center" min={0} max={59} value={checkOutMinute} onChange={e => setCheckOutMinute(e.target.value)} required />
                                        </div>
                                        <div className="col-4 col-sm-2">
                                            <label className="text-muted small d-block mb-1" style={{ fontSize: '0.75rem' }}>Ngày</label>
                                            <input type="number" className="form-control form-control-sm fw-bold text-center" min={1} max={31} value={checkOutDay} onChange={e => setCheckOutDay(e.target.value)} required />
                                        </div>
                                        <div className="col-6 col-sm-3">
                                            <label className="text-muted small d-block mb-1" style={{ fontSize: '0.75rem' }}>Tháng</label>
                                            <input type="number" className="form-control form-control-sm fw-bold text-center" min={1} max={12} value={checkOutMonth} onChange={e => setCheckOutMonth(e.target.value)} required />
                                        </div>
                                        <div className="col-6 col-sm-3">
                                            <label className="text-muted small d-block mb-1" style={{ fontSize: '0.75rem' }}>Năm</label>
                                            <input type="number" className="form-control form-control-sm fw-bold text-center" min={2024} max={2030} value={checkOutYear} onChange={e => setCheckOutYear(e.target.value)} required />
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4 p-3 rounded-3 bg-primary-subtle border border-primary">
                                    <i className="fa-solid fa-qrcode text-primary me-2"></i>
                                    <span className="small fw-semibold text-primary-emphasis">
                                        Yêu cầu thanh toán tiền đặt cọc <strong>25%</strong> qua <strong>Mã QR PayOS</strong>. Thanh toán thành công chỉ xác nhận biển số đã đặt trước, không chuyển trạng thái slot.
                                    </span>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-success w-100 fw-bold py-3 mt-2 fs-6 shadow-sm"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <><i className="fa-solid fa-spinner fa-spin me-2"></i>Đang xử lý...</>
                                    ) : (
                                        <><i className="fa-solid fa-qrcode me-2"></i>XÁC NHẬN & QUÉT QR ĐẶT CỌC (25%)</>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* ── Booking đang hoạt động ── */}
                    <div className="col-12 col-md-7 col-lg-7">
                        <div className="h-100 d-flex flex-column">
                            <h6 className="fw-bold text-dark mb-3 fs-5">
                                Đặt Chỗ Đang Hoạt Động
                                {activeBookings.length > 0 && (
                                    <span className="badge bg-success ms-2" style={{ fontSize: '0.8rem' }}>
                                        {activeBookings.length}
                                    </span>
                                )}
                            </h6>

                            {loadingList ? (
                                <div className="text-center py-5 text-muted bg-white rounded-3 shadow-sm flex-grow-1 d-flex align-items-center justify-content-center">
                                    <div><i className="fa-solid fa-spinner fa-spin fa-2x mb-2 d-block text-success"></i>Đang tải...</div>
                                </div>
                            ) : activeBookings.length === 0 ? (
                                <div className="text-center py-5 text-muted bg-white rounded-3 shadow-sm flex-grow-1 d-flex align-items-center justify-content-center my-auto min-vh-25">
                                    <div className="py-4">
                                        <i className="fa-regular fa-calendar-xmark fa-3x mb-3 d-block opacity-40 text-secondary"></i>
                                        <span className="fs-6 d-block text-secondary">Chưa có đặt chỗ nào đang hoạt động.</span>
                                    </div>
                                </div>
                            ) : activeBookings.map(b => {
                                const isCheckedIn = b.status === 'CheckedIn';
                                const secs        = isCheckedIn ? 0 : (countdowns[b.bookingId] ?? secondsUntil(b.startTime));
                                const isDanger    = !isCheckedIn && secs < 300;
                                const slotName    = getSlotName(b);
                                return (
                                    <div key={b.bookingId} className={`bg-white rounded-3 shadow-sm p-4 mb-3 card-hover border-start border-3 ${isCheckedIn ? 'border-primary' : 'border-success'}`}>
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div>
                                                {isCheckedIn
                                                    ? <span className="badge bg-primary me-2 px-2 py-1 fs-7">Đã Check-in</span>
                                                    : <span className="badge bg-success me-2 px-2 py-1 fs-7">Booked</span>
                                                }
                                                <span className="text-muted fw-bold">#{b.bookingId}</span>
                                            </div>
                                            {!isCheckedIn && (
                                                <button
                                                    className="btn btn-outline-danger btn-sm px-3"
                                                    onClick={() => handleCancel(b.bookingId)}
                                                >
                                                    <i className="fa-solid fa-xmark me-1"></i>Hủy Đặt Chỗ
                                                </button>
                                            )}
                                        </div>

                                        <div className="row g-3 small mb-3 fs-6">
                                            <div className="col-6">
                                                <span className="text-muted">Biển xe / Slot:</span>
                                                <strong className="ms-2 text-primary fs-5">{slotName}</strong>
                                            </div>
                                            <div className="col-6 text-end text-md-start">
                                                <span className="text-muted">Check-in trước:</span>
                                                <strong className="ms-2 fs-6 text-dark">
                                                    {formatLocalTime(b.startTime)}
                                                </strong>
                                            </div>
                                        </div>

                                        {isCheckedIn ? (
                                            <div className="p-3 rounded-3 d-flex align-items-center bg-primary-subtle border border-primary">
                                                <i className="fa-solid fa-circle-check fa-lg me-3 text-primary"></i>
                                                <div>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0d6efd', letterSpacing: '0.5px' }}>
                                                        TRẠNG THÁI
                                                    </div>
                                                    <div className="fw-bold fs-5 text-primary">
                                                        Xe đã check-in thành công
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={`expiry-timer p-3 rounded-3 d-flex align-items-center ${isDanger ? 'bg-danger-subtle border border-danger' : 'bg-light border'}`}>
                                                <i className={`fa-solid fa-hourglass-half fa-lg me-3 ${isDanger ? 'text-danger' : 'text-warning'}`}></i>
                                                <div>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#555', letterSpacing: '0.5px' }}>
                                                        THỜI GIAN CHỜ CHECK-IN
                                                    </div>
                                                    <div className={`timer-value fw-bold fs-4 ${isDanger ? 'text-danger' : 'text-warning'}`}>
                                                        {secs > 0 ? formatCountdown(secs) : '⚠ Đã hết hạn'}
                                                    </div>
                                                </div>
                                                {isDanger && secs > 0 && (
                                                    <small className="text-danger fw-bold ms-auto alert-blink fs-6">
                                                        Vào bãi ngay!
                                                    </small>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Lịch sử đặt chỗ */}
                            {historyBookings.length > 0 && (
                                <div className="mt-4">
                                    <h6 className="fw-bold text-dark mb-3 fs-5">Lịch Sử Đặt Chỗ</h6>
                                    <div className="bg-white rounded-3 shadow-sm p-2">
                                        {historyBookings.slice(0, 5).map(b => (
                                            <div key={b.bookingId} className="booking-list-item d-flex justify-content-between align-items-center p-3 border-bottom last-border-0">
                                                <div>
                                                    <div className="small fw-semibold text-dark fs-6">Booking #{b.bookingId} — Slot {getSlotName(b)}</div>
                                                    <div className="text-muted mt-1" style={{ fontSize: '0.82rem' }}>
                                                        <i className="fa-regular fa-clock me-1"></i>
                                                        {formatLocalDate(b.startTime)}
                                                    </div>
                                                </div>
                                                <span className={`booking-status-badge badge px-3 py-2 ${b.status === 'Completed' ? 'bg-light-success text-success' : 'bg-light-secondary text-secondary'}`}>{b.status === 'Completed' ? 'Đã checkout' : b.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <UserBottomNav />

            {/* Modal QR Đặt Cọc PayOS */}
            {qrData && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 2000 }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 400 }}>
                        <div className="modal-content border-0 shadow-lg rounded-4 p-4 text-center">
                            <h5 className="fw-bold mb-1">
                                <i className="fa-solid fa-qrcode text-primary me-2"></i>Thanh Toán Tiền Đặt Cọc (25%)
                            </h5>
                            <p className="text-muted small mb-3">
                                Quét mã QR bằng ứng dụng ngân hàng hoặc ví điện tử bất kỳ
                            </p>
                            {qrData.qrCode ? (
                                <div className="d-inline-block p-3 bg-white rounded-3 border shadow-sm mb-3 qr-code-container">
                                    <QRCodeSVG value={qrData.qrCode} size={220} level="M" includeMargin={false} />
                                </div>
                            ) : (
                                <div className="alert alert-warning small">Không có dữ liệu QR. Vui lòng thử lại.</div>
                            )}
                            <div className="fw-black text-primary mb-1" style={{ fontSize: '1.8rem' }}>{fmtMoney(qrData.amount)}</div>
                            {qrData.totalEstimatedFee !== undefined && (
                                <div className="small text-muted mb-2">
                                    Tổng phí dự kiến: <strong>{fmtMoney(qrData.totalEstimatedFee)}</strong>
                                    {qrData.bookingDurationMinutes !== undefined && (
                                        <> trong <strong>{Math.floor(qrData.bookingDurationMinutes / 60)} giờ {qrData.bookingDurationMinutes % 60} phút</strong></>
                                    )}
                                </div>
                            )}
                            <p className="text-muted small mb-3">Sau khi thanh toán <strong>SUCCESS</strong>, biển số được xác nhận đặt trước và slot sẽ được phân bổ lúc check-in.</p>
                            {qrPolling && (
                                <div className="alert alert-primary py-2 small mb-3 border-0 rounded-3">
                                    <i className="fa-solid fa-spinner fa-spin me-2"></i>Đang chờ ngân hàng xác nhận giao dịch...
                                </div>
                            )}
                            <button className="btn btn-outline-secondary btn-sm fw-bold w-100"
                                    onClick={() => { clearInterval(pollingRef.current); setQrData(null); setQrPolling(false); setPendingBooking(null); }}>
                                <i className="fa-solid fa-xmark me-1"></i>Hủy Thanh Toán
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserBooking;
