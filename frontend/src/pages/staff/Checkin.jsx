// src/pages/staff/Checkin.jsx
import { useState, useEffect, useRef } from 'react';
import api from '../../config/Api'; // ✓ Tự động bọc Header Authorization từ interceptor
import StaffSidebar from '../../components/StaffSidebar.jsx';

function Checkin() {
    // --- Các State quản lý dữ liệu ---
    const [timeStr, setTimeStr] = useState('--:--:-- - --/--/----');
    const [entryTime, setEntryTime] = useState('--:--:--');
    const [vehicleType, setVehicleType] = useState('CAR');
    const [licensePlate, setLicensePlate] = useState('');

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const fileInputRef = useRef(null);

    // State phục vụ việc Quét AI Biển Số
    const [scanningAI, setScanningAI] = useState(false);

    const [slotsFromApi, setSlotsFromApi] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loading, setLoading] = useState(false);
    const [reservedBookings, setReservedBookings] = useState([]);
    const [capacityWarning, setCapacityWarning] = useState(null);
    const [matchedBooking, setMatchedBooking] = useState(null);
    const [bookedSlot, setBookedSlot] = useState(null);

    const currentVehicleTypeId = vehicleType === 'CAR' ? 2 : 1;

    // 1. Đồng hồ thời gian hệ thống định dạng vi-VN
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setTimeStr(now.toLocaleTimeString('vi-VN', { hour12: false }) + " - " + now.toLocaleDateString('vi-VN'));
            setEntryTime(now.toLocaleTimeString('vi-VN', { hour12: false }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // 2. Quản lý vòng đời ảnh xem trước để tránh Memory Leak
    useEffect(() => {
        if (!imageFile) {
                setImagePreview('');
            return;
        }
        const objectUrl = URL.createObjectURL(imageFile);
        setImagePreview(objectUrl);

        // Khử vùng nhớ khi thay đổi ảnh hoặc unmount component
        return () => URL.revokeObjectURL(objectUrl);
    }, [imageFile]);

    // 3. Tải danh sách các slot trống từ hệ thống
    const fetchAvailableSlots = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/slots/available?vehicleTypeId=${currentVehicleTypeId}`);
            const availableSlots = response.data || [];
            setSlotsFromApi(availableSlots);

            // Ưu tiên chọn đúng slot đã được đặt trước nếu biển số có booking matched
            if (bookedSlot && bookedSlot.slotId) {
                const matched = availableSlots.find(slot => (slot.slotId || slot.SlotId) === bookedSlot.slotId) || bookedSlot;
                setSelectedSlot(matched);
                return;
            }

            // Tìm kiếm vị trí tối ưu (AI Đề xuất: CAR -> Tầng 1, MOTORBIKE -> Tầng 2)
            const AIRecommendation = availableSlots.find(slot =>
                vehicleType === 'CAR' ? slot.floorId === 1 : slot.floorId === 2
            );

            // Nếu không tìm được tầng ưu tiên, chọn vị trí trống đầu tiên tìm thấy
            setSelectedSlot(AIRecommendation || availableSlots[0] || null);
        } catch (error) {
            console.error("Lỗi khi fetch slot trống:", error);
            setSlotsFromApi([]);
            setSelectedSlot(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchReservedBookings = async () => {
        try {
            const response = await api.get('/bookings/staff/confirmed');
            setReservedBookings(Array.isArray(response.data) ? response.data : []);
        } catch {
            setReservedBookings([]);
        }
    };

    const fetchCapacityWarning = async () => {
        try {
            const response = await api.get(`/bookings/checkin-capacity-warning?vehicleTypeId=${currentVehicleTypeId}`);
            setCapacityWarning(response.data || null);
        } catch {
            setCapacityWarning(null);
        }
    };

    useEffect(() => {
        fetchAvailableSlots();
        fetchReservedBookings();
        fetchCapacityWarning();
    }, [vehicleType]);

    // Trạng thái bãi xe hết chỗ thực sự (Chỉ kích hoạt khi đã load xong và mảng trống)
    const isFull = !loading && !selectedSlot;

    const getSlotDisplayName = (slot) => {
        if (!slot) return '--';
        return slot.slotName || slot.slotCode || (slot.slotId ? `#SLOT-${slot.slotId}` : '--');
    };

    const getBookingStatusLabel = (status) => {
        const normalized = (status || '').toString().toUpperCase();
        if (normalized === 'CHECKEDIN' || normalized === 'CHECKED_IN') return 'Đã checkin';
        if (normalized === 'COMPLETED' || normalized === 'CHECKEDOUT' || normalized === 'CHECKED_OUT') return 'Đã checkout';
        return 'Chờ checkin';
    };

    const getVehicleTypeFromId = (vehicleTypeId) => {
        const id = Number(vehicleTypeId);
        return id === 2 ? 'CAR' : 'MOTORBIKE';
    };

    const [bookedNotice, setBookedNotice] = useState(null); // Thông báo khi biển số có đặt chỗ trước

    // Tra cứu xem biển số có đặt chỗ trước không để tự động chọn đúng slot đã Booked
    const checkBookingForPlate = async (plate) => {
        if (!plate || !plate.trim()) {
            setBookedNotice(null);
            setMatchedBooking(null);
            setBookedSlot(null);
            return;
        }
        try {
            const cleanPlate = plate.trim().toUpperCase();
            const res = await api.get(`/bookings/by-plate?licensePlate=${encodeURIComponent(cleanPlate)}`);
            if (res.data && (res.data.bookingId || res.data.slotId)) {
                const bookingData = res.data;
                setMatchedBooking(bookingData);

                if (bookingData.vehicleTypeId) {
                    setVehicleType(getVehicleTypeFromId(bookingData.vehicleTypeId));
                }

                // Nếu booking có slotId, mặc định chọn đúng slot ô đỗ đã đặt trước này!
                if (bookingData.slotId) {
                    const targetBookedSlot = {
                        slotId: bookingData.slotId,
                        slotCode: bookingData.slotCode || `Slot #${bookingData.slotId}`,
                        slotName: bookingData.slotCode || `Slot #${bookingData.slotId}`,
                        floorId: bookingData.floorId || (bookingData.vehicleTypeId === 2 ? 1 : 2)
                    };
                    setBookedSlot(targetBookedSlot);
                    setSelectedSlot(targetBookedSlot);
                    setBookedNotice(`📌 Xe ${cleanPlate} đã ĐẶT TRƯỚC ô đỗ ${targetBookedSlot.slotCode}! Hệ thống đã tự động chuyển mặc định chọn vị trí này.`);
                } else {
                    setBookedSlot(null);
                    setBookedNotice(`📌 Xe ${cleanPlate} đã đặt chỗ trước từ ${formatDateTime(bookingData.startTime)} đến ${formatDateTime(bookingData.endTime)}.`);
                }
            } else {
                setBookedNotice(null);
                setMatchedBooking(null);
                setBookedSlot(null);
            }
        } catch {
            setBookedNotice(null);
            setMatchedBooking(null);
            setBookedSlot(null);
        }
    };

    const handlePlateChange = (e) => {
        // Chuẩn hóa chữ hoa, lọc bỏ ký tự đặc biệt trừ dấu gạch ngang chữ
        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
        setLicensePlate(value);
        checkBookingForPlate(value);
    };

    const formatDateTime = (value) => {
        if (!value) return '--';
        const [datePart, timePart = ''] = String(value).replace('T', ' ').split(' ');
        const [year, month, day] = datePart.split('-');
        const [hour = '00', minute = '00'] = timePart.split(':');
        if (year && month && day) {
            return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')} ${day}/${month}/${year}`;
        }
        return String(value);
    };

    const formatTimeOnly = (value) => {
        if (!value) return '--';
        const [, timePart = ''] = String(value).replace('T', ' ').split(' ');
        const [hour = '00', minute = '00', second = '00'] = timePart.split(':');
        return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}`;
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleClearFile = () => {
        setImageFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // --- TÍNH NĂNG: QUÉT AI TỪ ẢNH ĐÃ CHỌN ---
    const handleScanFromSelectedImage = async () => {
        if (!imageFile) return;

        const formData = new FormData();
        formData.append("file", imageFile);

        setScanningAI(true);
        try {
            const response = await api.post('/parking/scan-plate', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Đọc đúng key licensePlate từ Object Back-end trả về ({ licensePlate: "9H7060" })
            const rawPlate = response.data?.licensePlate || response.data;

            if (rawPlate && typeof rawPlate === 'string' && rawPlate.trim() !== '') {
                // Viết hoa và làm sạch chuỗi
                const cleanPlate = rawPlate.toUpperCase().replace(/[^A-Z0-9-]/g, '');

                // TỰ ĐỘNG ĐIỀN VÀO Ô INPUT BIỂN SỐ XE
                setLicensePlate(cleanPlate);
                checkBookingForPlate(cleanPlate);
            } else {
                alert('⚠️ Không nhận diện được biển số từ ảnh này!');
            }
        } catch (error) {
            console.error("Lỗi khi nhận diện biển số AI:", error);
            alert('⚠️ Lỗi hệ thống quét AI. Vui lòng kiểm tra lại!');
        } finally {
            setScanningAI(false);
        }
    };

    // 4. GỬI DỮ LIỆU: Đóng gói đa phân đoạn (Multipart/FormData)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedSlot) return;

        setLoading(true);

        // Định dạng mốc thời gian ISO local chuẩn cơ sở dữ liệu (YYYY-MM-DD HH:mm:ss)
        const now = new Date();
        const offsetMs = now.getTimezoneOffset() * 60 * 1000;
        const localISOTime = new Date(now.getTime() - offsetMs).toISOString().split('.')[0];
        const cleanDateTime = localISOTime.replace('T', ' ');
        const bookingCheckInTime = matchedBooking?.startTime ? String(matchedBooking.startTime).replace('T', ' ') : null;

        const parkingSessionPayload = {
            slotId: selectedSlot.slotId,
            vehicleTypeId: currentVehicleTypeId,
            licensePlate: licensePlate,
            cardNumber: `CARD-${Date.now().toString().slice(-6)}`,
            checkInTime: bookingCheckInTime || cleanDateTime,
            checkOutTime: null,
            sessionStatus: "ACTIVE"
        };

        try {
            const formData = new FormData();
            formData.append("sessionData", new Blob([JSON.stringify(parkingSessionPayload)], {
                type: "application/json"
            }));

            if (imageFile) {
                formData.append("imageIn", imageFile);
            }

            const response = await api.post('/parking/create', formData);

            if (response.status === 201 || response.status === 200) {
                const result = response.data;
                alert(`🎉 XỬ LÝ CHECK-IN THÀNH CÔNG!\n🔹 Biển số: ${result.licensePlate}\n🔹 Ô đỗ phân phối: ${selectedSlot.slotCode}\n🔹 ID Phiên: #SS-${result.sessionId}`);

                setLicensePlate('');
                setMatchedBooking(null);
                setBookedSlot(null);
                setBookedNotice(null);
                handleClearFile();
                fetchAvailableSlots();
                fetchReservedBookings();
                fetchCapacityWarning();
            }
        } catch (error) {
            console.error("Lỗi kết nối khi lưu phiên đỗ xe:", error);
            const errMsg = error.response?.data?.message || "Không thể kết nối tới máy chủ hoặc dữ liệu đầu vào không hợp lệ.";
            alert(`⚠️ Thất bại: ${errMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex" style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>

            {/* Hệ thống mã màu Soft-UI tùy biến mở rộng */}
            <style>{`
                .text-green-custom { color: #10B981 !important; }
                .bg-green-soft { background-color: rgba(16, 185, 129, 0.08) !important; border: 1px solid rgba(16, 185, 129, 0.15) !important; }
                
                .text-blue-custom { color: #3B82F6 !important; }
                .bg-blue-soft { background-color: rgba(59, 130, 246, 0.08) !important; }

                .text-red-custom { color: #EF4444 !important; }
                .bg-red-soft { background-color: rgba(239, 68, 68, 0.08) !important; }

                .text-amber-custom { color: #D97706 !important; }
                .bg-amber-soft { background-color: rgba(245, 158, 11, 0.08) !important; border: 1px solid rgba(245, 158, 11, 0.15) !important; }

                .text-slate-custom { color: #64748B !important; }
                
                .btn-check:checked + .btn-outline-success {
                    background-color: #10B981 !important;
                    border-color: #10B981 !important;
                    color: #FFFFFF !important;
                }
                .btn-check:checked + .btn-outline-info {
                    background-color: #3B82F6 !important;
                    border-color: #3B82F6 !important;
                    color: #FFFFFF !important;
                }
                .select-override-custom {
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .select-override-custom:hover {
                    background-color: rgba(16, 185, 129, 0.12) !important;
                }
            `}</style>

            <StaffSidebar />

            <div className="main-content flex-grow-1" style={{ minWidth: 0, padding: '24px 32px', marginLeft: '240px' }}>
                <div className="container-fluid px-0">

                    {/* Dashboard Header — banner tối màu đồng bộ Manager */}
                    <div className="p-4 mb-4 text-white d-flex justify-content-between align-items-center position-relative shadow-sm"
                         style={{ background: 'linear-gradient(135deg, #0B1528 0%, #1E2E4A 100%)', borderRadius: '16px', minHeight: '110px' }}>
                        <div>
                            <span className="fw-bold text-uppercase opacity-70" style={{ fontSize: '11px', letterSpacing: '1.5px', color: '#3B82F6' }}>
                                <i className="fa-solid fa-right-to-bracket me-1.5" /> Gate Operations — Entry
                            </span>
                            <h3 className="fw-bold mt-1 mb-2" style={{ fontSize: '22px', letterSpacing: '-0.5px' }}>Xử Lý Xe Vào (Check-in)</h3>
                            <p className="mb-0 opacity-70" style={{ fontSize: '13px' }}>Ghi nhận thông tin phương tiện, tự động phân phối vị trí và cấp phát vé xe</p>
                        </div>
                        <div className="d-none d-sm-flex align-items-center p-2 px-3 rounded-3 fw-bold"
                             style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '13px' }}>
                            <i className="fa-regular fa-clock me-2"></i><span>{timeStr}</span>
                        </div>
                    </div>

                    {/* Alert Hết chỗ (Chỉ render khi thật sự hết chỗ và ngưng load) */}
                    {isFull && (
                        <div className="alert bg-red-soft text-red-custom d-flex align-items-center border-0 shadow-sm p-3 mb-4 rounded-3-fade">
                            <i className="fa-solid fa-circle-exclamation fs-4 me-3"></i>
                            <div>
                                <h6 className="fw-bold mb-1">CẢNH BÁO: HỆ THỐNG HẾT VỊ TRÍ TRỐNG!</h6>
                                <span style={{ fontSize: '13px', opacity: 0.9 }}>Bãi đỗ hiện tại không còn vị trí trống khả dụng cho loại phương tiện này. Vui lòng điều phối xe ra hoặc từ chối nhận.</span>
                            </div>
                        </div>
                    )}

                    {capacityWarning?.restricted && (
                        <div className="alert bg-amber-soft text-amber-custom border-0 shadow-sm p-3 mb-4 rounded-3">
                            <div className="fw-bold mb-1">
                                Chỉ cho phép check-in nếu xe này rời đi trước giờ có xe booking gần nhất 30 phút.
                            </div>
                            <div style={{ fontSize: '13px' }}>
                                Booking gần nhất vào lúc <strong>{formatDateTime(capacityWarning.nearestBookingStartTime)}</strong>;
                                xe vãng lai cần rời trước <strong>{formatDateTime(capacityWarning.latestCheckoutTime)}</strong>.
                                Slot trống: {capacityWarning.availableSlots}, số booking trùng cần giữ: {capacityWarning.overlapReserve}.
                            </div>
                        </div>
                    )}

                    <div className="card shadow-sm border p-3 bg-white rounded-3 mb-4" style={{ borderColor: '#E2E8F0' }}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '16px' }}>
                                <i className="fa-solid fa-calendar-check text-primary me-2"></i>Phiên Đã Đặt Trước
                            </h5>
                            <span className="badge bg-primary">{reservedBookings.length}</span>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-sm align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th>Biển số xe</th>
                                        <th>Thời gian vào</th>
                                        <th>Thời gian ra</th>
                                        <th>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reservedBookings.length === 0 ? (
                                        <tr><td colSpan="4" className="text-muted text-center py-3">Chưa có booking đã xác nhận.</td></tr>
                                    ) : reservedBookings.map(booking => (
                                        <tr key={booking.bookingId}>
                                            <td className="fw-bold">{booking.licensePlate}</td>
                                            <td>{formatDateTime(booking.startTime)}</td>
                                            <td>{formatDateTime(booking.endTime)}</td>
                                            <td>
                                                <span className="badge bg-light text-dark border">
                                                    {getBookingStatusLabel(booking.status || booking.bookingStatus)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="row g-4">
                        {/* Cột Trái: Thông tin camera & Form khai báo dữ liệu */}
                        <div className="col-xl-7">
                            <div className="card shadow-sm border p-4 bg-white h-100 rounded-3" style={{ borderColor: '#E2E8F0' }}>
                                <h5 className="fw-bold mb-4 text-dark" style={{ fontSize: '16px' }}><i className="fa-solid fa-car-side text-primary me-2"></i>Thông Tin Nhận Xe Hệ Thống</h5>

                                {/* Luồng Giả Lập Quét Camera ANPR */}
                                <div className="d-flex align-items-center justify-content-center border rounded-3 mb-4" style={{ height: '240px', borderStyle: 'dashed', backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' }}>
                                    <div className="text-center text-secondary">
                                        <i className="fa-solid fa-video fs-2 mb-3 text-slate-custom opacity-50"></i>
                                        <h6 className="fw-bold mb-1 text-dark" style={{ fontSize: '14px' }}>LUỒNG CAMERA NHẬN DIỆN CHÍNH (ANPR)</h6>
                                        <p className="mb-0 text-muted" style={{ fontSize: '12.5px' }}>Hệ thống quét thông minh đang tự động trực tuyến và phân tích luồng hình ảnh...</p>
                                    </div>
                                </div>

                                {/* Khu Vực Upload Ảnh Minh Chứng Bổ Sung & Nút Quét AI */}
                                <div className="mb-4">
                                    <label className="form-label text-slate-custom fw-bold" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>────── HOẶC TẢI ẢNH TỪ MÁY TÍNH ──────</label>
                                    <div className="d-flex align-items-center gap-2 mt-1 flex-wrap">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="form-control"
                                            style={{ maxWidth: '280px', borderColor: '#E2E8F0', fontSize: '13px' }}
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                        />

                                        {/* CHỈ HIỂN THỊ KHI ĐÃ CHỌN ẢNH */}
                                        {imageFile && (
                                            <>
                                                {/* Nút Quét AI nằm ngay kế bên nút Xóa Ảnh */}
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-primary fw-bold px-3 d-flex align-items-center shadow-sm"
                                                    onClick={handleScanFromSelectedImage}
                                                    disabled={scanningAI}
                                                    style={{ fontSize: '12px', height: '38px', borderRadius: '6px', gap: '4px' }}
                                                >
                                                    {scanningAI ? (
                                                        <><span className="spinner-border spinner-border-sm me-1.5"></span> Đang quét AI...</>
                                                    ) : (
                                                        <><i className="fa-solid fa-wand-magic-sparkles me-1.5"></i>Quét biển số</>
                                                    )}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger fw-bold px-3"
                                                    onClick={handleClearFile}
                                                    disabled={scanningAI}
                                                    style={{ fontSize: '12px', height: '38px', borderRadius: '6px' }}
                                                >
                                                    <i className="fa-solid fa-trash me-1"></i> Xóa ảnh
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {imagePreview && (
                                        <div className="mt-3">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="img-thumbnail rounded-3 shadow-sm border"
                                                style={{ maxHeight: '110px', objectFit: 'cover', borderColor: '#E2E8F0' }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Form Khai Báo Biển Số */}
                                <form onSubmit={handleSubmit}>
                                    <div className="row mb-4 g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold text-slate-custom mb-2" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>LOẠI PHƯƠNG TIỆN</label>
                                            <div className="d-flex gap-2">
                                                <input type="radio" className="btn-check" name="vType" id="typeCar" checked={vehicleType === 'CAR'} onChange={() => setVehicleType('CAR')} />
                                                <label className="btn btn-outline-success fw-bold flex-grow-1 py-2 fs-6 text-green-custom" htmlFor="typeCar"><i className="fa-solid fa-car me-1"></i> Ô Tô</label>

                                                <input type="radio" className="btn-check" name="vType" id="typeMoto" checked={vehicleType === 'MOTORBIKE'} onChange={() => setVehicleType('MOTORBIKE')} />
                                                <label className="btn btn-outline-info fw-bold flex-grow-1 py-2 fs-6 text-blue-custom" htmlFor="typeMoto"><i className="fa-solid fa-motorcycle me-1"></i> Xe Máy</label>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-bold text-slate-custom mb-2" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>BIỂN SỐ XE KHAI BÁO</label>
                                            <input
                                                type="text"
                                                className="form-control fw-bold text-uppercase py-2 fs-5 text-dark shadow-sm"
                                                style={{ height: '44px', borderColor: '#E2E8F0', letterSpacing: '0.5px' }}
                                                placeholder="VD: 30K12345"
                                                value={licensePlate}
                                                onChange={handlePlateChange}
                                                required
                                            />
                                            {bookedNotice && (
                                                <div className="mt-2 p-2 rounded-3 bg-primary-subtle border border-primary text-primary fw-bold" style={{ fontSize: '0.82rem' }}>
                                                    {bookedNotice}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <hr style={{ borderColor: '#E2E8F0', opacity: 0.5 }} className="my-4" />

                                    <button type="submit" className={`btn ${isFull || loading ? 'btn-secondary' : 'btn-success bg-green-custom'} w-100 fw-bold py-2.5 fs-6 shadow-sm`} style={{ border: 'none', borderRadius: '8px' }} disabled={isFull || loading}>
                                        {loading ? (
                                            <><span className="spinner-border spinner-border-sm me-2"></span> Đang kết nối xử lý hệ thống...</>
                                        ) : isFull ? (
                                            <><i className="fa-solid fa-lock me-2"></i>Hệ thống đã khóa (Hết vị trí trống)</>
                                        ) : (
                                            <><i className="fa-solid fa-print me-2"></i>Xác Nhận Đỗ & Cấp Phát Vé Xe</>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Cột Phải: Bộ Đề Xuất AI & Xem Trước Dữ Liệu Gửi Đi */}
                        <div className="col-xl-5">
                            <div className="card shadow-sm border p-4 bg-white rounded-3 d-flex flex-column" style={{ borderColor: '#E2E8F0', height: '650px' }}>
                                <h5 className="fw-bold mb-1 text-dark" style={{ fontSize: '16px' }}><i className="fa-solid fa-robot text-green-custom me-2"></i>Hệ Thống Phân Bổ Vị Trí (AI Đề Xuất)</h5>
                                <p className="text-muted mb-3" style={{ fontSize: '13px' }}>Vị trí tối ưu dựa trên loại xe (Có thể nhấn vào mã để đổi ô thủ công nếu cần):</p>

                                {/* Ô hiển thị vị trí hoặc chuyển đổi nhanh dạng Dropdown Override */}
                                <div className={`text-center p-3 mb-4 rounded-3 shadow-inner d-flex flex-column align-items-center justify-content-center ${bookedNotice ? 'bg-primary-subtle border border-primary' : 'bg-green-soft'}`}>
                                    {isFull ? (
                                        <div className="fw-bold text-danger display-4 my-1">N/A</div>
                                    ) : (
                                        <select
                                            className={`form-select text-center fw-bold border-0 bg-transparent fs-3 select-override-custom my-1 p-0 shadow-none mx-auto w-auto ${bookedNotice ? 'text-primary' : 'text-green-custom'}`}
                                            style={{ fontWeight: '800', letterSpacing: '0.5px', maxWidth: '100%' }}
                                            value={selectedSlot?.slotId || ''}
                                            onChange={(e) => {
                                                const id = parseInt(e.target.value);
                                                if (bookedSlot && (bookedSlot.slotId === id || Number(bookedSlot.slotId) === id)) {
                                                    setSelectedSlot(bookedSlot);
                                                } else {
                                                    const slot = slotsFromApi.find(s => s.slotId === id || Number(s.slotId) === id);
                                                    if (slot) setSelectedSlot(slot);
                                                }
                                            }}
                                        >
                                            {/* Luôn giữ Option ô đỗ xe đã đặt trước khi biển số matched booking */}
                                            {bookedSlot && !slotsFromApi.some(s => (s.slotId || s.SlotId) === bookedSlot.slotId || Number(s.slotId || s.SlotId) === Number(bookedSlot.slotId)) && (
                                                <option value={bookedSlot.slotId} className="text-dark fs-6 fw-normal">
                                                    {bookedSlot.slotCode || bookedSlot.slotName || `Slot #${bookedSlot.slotId}`} 📌 (Xe đã đặt chỗ trước)
                                                </option>
                                            )}
                                            {slotsFromApi.map(slot => {
                                                const isBooked = bookedSlot && ((slot.slotId || slot.SlotId) === bookedSlot.slotId || Number(slot.slotId || slot.SlotId) === Number(bookedSlot.slotId));
                                                const isOptimal = vehicleType === 'CAR' ? slot.floorId === 1 : slot.floorId === 2;
                                                return (
                                                    <option key={slot.slotId} value={slot.slotId} className="text-dark fs-6 fw-normal">
                                                        {slot.slotCode} {isBooked ? '📌 (Đã đặt trước)' : isOptimal ? '⭐ (Tối ưu)' : ''}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    )}
                                    {!isFull && (
                                        bookedSlot && selectedSlot && (selectedSlot.slotId === bookedSlot.slotId || Number(selectedSlot.slotId) === Number(bookedSlot.slotId)) ? (
                                            <span className="badge bg-primary text-white px-3 py-1.5 fs-7 mt-2 fw-bold" style={{ borderRadius: '6px' }}>
                                                <i className="fa-solid fa-bookmark me-1"></i>Xe đang chọn ô đỗ đã đặt trước
                                            </span>
                                        ) : (
                                            <span className="badge bg-green-soft text-green-custom px-3 py-1.5 fs-7 mt-2 fw-bold" style={{ borderRadius: '6px' }}>
                                                <i className="fa-solid fa-spinner fa-spin me-1"></i>Hệ thống đang giữ chỗ tạm thời
                                            </span>
                                        )
                                    )}
                                </div>

                                <h5 className="fw-bold mb-1 mt-2 text-dark" style={{ fontSize: '16px' }}><i className="fa-solid fa-ticket text-amber-custom me-2"></i>Thông Tin Phiên Gửi Kỹ Thuật (Preview)</h5>
                                <p className="text-muted mb-3" style={{ fontSize: '13px' }}>Bản xem trước khi chuẩn bị ghi nhận vào kho dữ liệu:</p>

                                <ul className="list-group list-group-flush border rounded-3 fs-6 " style={{ fontWeight: 500, borderColor: '#E2E8F0' }}>
                                    <li className="list-group-item d-flex justify-content-between align-items-center bg-light py-3 px-3" style={{ borderColor: '#E2E8F0' }}>
                                        <span className="text-slate-custom fw-bold" style={{ fontSize: '13px' }}>Mã Vị Trí Lưu Hệ Thống (Slot Name)</span>
                                        <span className="fw-bold text-primary-custom" style={{ color: '#3B82F6' }}>{isFull ? 'N/A' : getSlotDisplayName(selectedSlot)}</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center py-3 px-3" style={{ borderColor: '#E2E8F0' }}>
                                        <span className="text-slate-custom fw-bold" style={{ fontSize: '13px' }}>Thời Gian Bắt Đầu Vào</span>
                                        <span className="fw-bold text-dark fs-6">{matchedBooking?.startTime ? formatTimeOnly(matchedBooking.startTime) : entryTime}</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center py-3 px-3" style={{ borderColor: '#E2E8F0' }}>
                                        <span className="text-slate-custom fw-bold" style={{ fontSize: '13px' }}>Trạng Thái Khởi Tạo</span>
                                        <span className="badge bg-amber-soft text-amber-custom px-2.5 py-1.5 fw-bold" style={{ fontSize: '11px', borderRadius: '4px' }}>ACTIVE</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Checkin;
