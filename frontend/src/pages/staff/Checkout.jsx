// src/pages/staff/Checkout.jsx
import { useState, useEffect, useRef } from 'react';
import api from '../../config/Api';
import { QRCodeSVG } from 'qrcode.react';
import StaffSidebar from '../../components/StaffSidebar.jsx';

// ✓ ĐÚNG: Rút ngắn để Axios tự động đính kèm context path qua thực thể api custom
const API_BASE = '/parking';

function Checkout() {
    // --- States Quản lý dữ liệu ---
    const [timeStr, setTimeStr] = useState('--:--:-- - --/--/----');
    const [searchInput, setSearchInput] = useState('');
    const [sessionData, setSessionData] = useState(null);
    const [pricePolicy, setPricePolicy] = useState(null);
    const [slots, setSlots] = useState([]);
    const [totalFee, setTotalFee] = useState(0);
    const [isOvertime, setIsOvertime] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [loadingCheckout, setLoadingCheckout] = useState(false);
    const [qrData, setQrData] = useState(null);       // { qrCode, orderId, amount } từ PayOS
    const [qrPolling, setQrPolling] = useState(false);
    const pollingRef = useRef(null);

    const [imageFile, setImageFile] = useState(null);
    const fileInputRef = useRef(null);

    // State phục vụ việc Quét AI Biển Số
    const [scanningAI, setScanningAI] = useState(false);

    // Đồng hồ thời gian hệ thống thời gian thực
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setTimeStr(now.toLocaleTimeString('vi-VN', { hour12: false }) + " - " + now.toLocaleDateString('vi-VN'));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        api.get('/staff/slots/all')
            .then((response) => setSlots(Array.isArray(response.data) ? response.data : []))
            .catch(() => setSlots([]));
    }, []);

    const hasLostTicket = (session) => {
        const exceptionType = session?.exceptionType || session?.ExceptionType;
        return exceptionType === 'LOST_TICKET';
    };

    const getSessionSlotName = () => {
        if (!sessionData) return '--';
        const directName = sessionData.slotName || sessionData.slotCode || sessionData.SlotName || sessionData.SlotCode;
        if (directName) return directName;

        const slotId = sessionData.slotId || sessionData.SlotId;
        const matchedSlot = slots.find(slot => (slot.slotId || slot.SlotId) === slotId);
        return matchedSlot?.slotName || matchedSlot?.slotCode || (slotId ? `#SLOT-${slotId}` : '--');
    };

    const getBookingStartTime = (session) =>
        session?.bookingStartTime || session?.BookingStartTime || session?.checkInTime || session?.CheckInTime;

    const getBookingEndTime = (session) =>
        session?.bookingEndTime || session?.BookingEndTime || session?.checkOutTime || session?.CheckOutTime;

    // 1. Tra cứu xe và gọi API biểu phí từ Database
    const handleSearch = async (overridePlate = null) => {
        // Ưu tiên dùng biển số từ AI truyền trực tiếp vào, nếu không sẽ dùng state searchInput
        const targetPlate = typeof overridePlate === 'string' ? overridePlate : searchInput;

        if (!targetPlate || !targetPlate.trim()) return alert("Vui lòng nhập hoặc quét biển số xe cần tra cứu!");

        setLoadingSearch(true);
        setPricePolicy(null);
        try {
            const response = await api.get(`${API_BASE}/check-out/view?licensePlate=${targetPlate.trim()}`);
            if (response.status === 200) {
                const session = response.data;
                const sessionId = session.sessionId || session.SessionId;

                try {
                    const amountRes = await api.get(`/payments/amount/${sessionId}`);
                    session.checkoutAmount = amountRes.data;
                } catch (amountError) {
                    console.error("Không thể lấy phí checkout từ server:", amountError);
                }

                setSessionData(session);

                const vId = session.vehicleTypeId || session.VehicleTypeID || session.vehicleId;

                try {
                    // Gọi API lấy biểu phí thông qua thực thể api
                    const policyRes = await api.get(`/price-policies/vehicle-type/${vId}`);
                    if (policyRes.status === 200 && policyRes.data) {
                        const policyData = Array.isArray(policyRes.data) ? policyRes.data[0] : policyRes.data;
                        setPricePolicy(policyData);
                    }
                } catch (policyError) {
                    console.error("❌ Lỗi khi lấy biểu phí từ DB:", policyError);
                }
            }
        } catch (error) {
            setSessionData(null);
            if (error.response && error.response.status === 404) {
                alert(`Không tìm thấy phương tiện mang biển số [${targetPlate.toUpperCase()}] trong bãi!`);
            } else {
                alert("Lỗi kết nối hệ thống khi truy xuất dữ liệu.");
            }
        } finally {
            setLoadingSearch(false);
        }
    };

    // --- TÍNH NĂNG MỚI: QUÉT AI TỪ ẢNH ĐÃ CHỌN VÀ TỰ ĐỘNG TRA CỨU ---
    const handleScanFromSelectedImage = async () => {
        if (!imageFile) return;

        const formData = new FormData();
        formData.append("file", imageFile); // Khớp với @RequestParam("file") ở Spring Boot

        setScanningAI(true);
        try {
            const response = await api.post('/parking/scan-plate', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Bóc tách biến licensePlate từ JSON Back-end ({ licensePlate: "9H7060" })
            const rawPlate = response.data?.licensePlate || (typeof response.data === 'string' ? response.data : '');

            if (rawPlate && rawPlate.trim() !== '') {
                // Viết hoa và làm sạch chuỗi
                const cleanPlate = rawPlate.toUpperCase().replace(/[^A-Z0-9-]/g, '');

                // Điền tự động vào ô search input
                setSearchInput(cleanPlate);

                // TỰ ĐỘNG THỰC HIỆN TRA CỨU PHIÊN XE
                handleSearch(cleanPlate);
            } else {
                alert('⚠️ Không nhận diện được biển số từ ảnh này. Vui lòng nhập thủ công!');
            }
        } catch (error) {
            console.error("Lỗi khi nhận diện biển số AI:", error);
            alert('⚠️ Lỗi hệ thống quét AI. Vui lòng kiểm tra lại!');
        } finally {
            setScanningAI(false);
        }
    };

    // 🔥 REAL-TIME FEE CALCULATION
    useEffect(() => {
        if (!sessionData) {
            setTotalFee(null);
            return;
        }

        const vTypeId = sessionData.vehicleTypeId ?? sessionData.VehicleTypeID;
        const isCar = vTypeId === 2 || vTypeId === '2';

        const basePrice = pricePolicy
            ? (pricePolicy.basePrice ?? pricePolicy.BasePrice ?? 0)
            : (isCar ? 25000 : 20000);

        const hourlyRate = pricePolicy
            ? (pricePolicy.hourlyRate ?? pricePolicy.HourlyRate ?? 0)
            : (isCar ? 5000 : 10000);

        const overtimeRate = pricePolicy
            ? (pricePolicy.overtimeRate ?? pricePolicy.OvertimeRate ?? 0)
            : (isCar ? 150000 : 50000);

        const lostTicketPenalty = pricePolicy
            ? (pricePolicy.lostTicketPenalty ?? pricePolicy.LostTicketPenalty ?? 100000)
            : 100000;

        const checkInTimeStr = sessionData.checkInTime || sessionData.CheckInTime;
        let minutes = 0;
        if (checkInTimeStr) {
            const checkIn = new Date(checkInTimeStr.replace(' ', 'T'));
            const checkOut = new Date();
            const diffMs = checkOut - checkIn;
            minutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));
        }

        let fee = basePrice;

        if (minutes > 60) {
            const extraMinutes = minutes - 60;
            const extraHours = Math.ceil(extraMinutes / 60.0);
            fee += extraHours * hourlyRate;
        }

        if (minutes > 480) {
            fee += overtimeRate;
        }

        if (hasLostTicket(sessionData)) {
            fee += lostTicketPenalty;
        }

        if (isOvertime) {
            fee += 10000;
        }

        // Khấu trừ tiền đặt cọc trước (nếu xe gửi qua Booking đã nộp cọc)
        const depositAmt = sessionData.depositAmount ?? (sessionData.depositPaid ? (basePrice * 0.25) : 0);
        if (depositAmt > 0) {
            fee = Math.max(0, fee - depositAmt);
        }

        setTotalFee(fee);
    }, [sessionData, pricePolicy, isOvertime, timeStr]);

    // Tính toán chi tiết số giờ đỗ chính xác từ mốc Check-in
    const getDurationDetails = () => {
        if (!sessionData) return null;
        const checkInTimeStr = sessionData.checkInTime || sessionData.CheckInTime;
        if (!checkInTimeStr) return null;

        const checkIn = new Date(checkInTimeStr.replace(' ', 'T'));
        const checkOut = new Date();

        const diffMs = checkOut - checkIn;
        if (isNaN(diffMs) || diffMs < 0) {
            return { totalMinutes: 0, hours: 0, mins: 0, totalHoursStr: '0 phút', extraHours: 0, progressiveFee: 0 };
        }

        const totalMinutes = Math.floor(diffMs / (1000 * 60));
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;

        const totalHoursStr = hours > 0
            ? `${hours} giờ ${mins} phút`
            : `${mins} phút`;

        const extraHours = totalMinutes > 60 ? Math.ceil((totalMinutes - 60) / 60.0) : 0;
        const vTypeId = sessionData.vehicleTypeId ?? sessionData.VehicleTypeID;
        const isCar = vTypeId === 2 || vTypeId === '2';
        const hourlyRate = pricePolicy
            ? (pricePolicy.hourlyRate ?? pricePolicy.HourlyRate ?? 0)
            : (isCar ? 5000 : 10000);

        const progressiveFee = extraHours * hourlyRate;

        return {
            totalMinutes,
            hours,
            mins,
            totalHoursStr,
            extraHours,
            hourlyRate,
            progressiveFee
        };
    };

    const durationDetails = getDurationDetails();

    // Tạo QR PayOS và bắt đầu polling — dùng khi Staff chọn "Chuyển Khoản"
    const handleCreateQR = async () => {
        if (!sessionData) return;
        const sId = sessionData.sessionId || sessionData.SessionId;
        try {
            const res = await api.post('/payments/create-qr', {
                sessionId: Number(sId),
                amount: totalFee ? Math.round(totalFee) : undefined
            });
            setQrData(res.data);
            setQrPolling(true);
            let attempts = 0;
            pollingRef.current = setInterval(async () => {
                attempts++;
                try {
                    const statusRes = await api.get(`/payments/status/${res.data.orderId}`);
                    if (statusRes.data.status === 'SUCCESS') {
                        clearInterval(pollingRef.current);
                        setQrPolling(false);
                        setQrData(null);
                        alert(`✅ Khách đã thanh toán QR thành công!\nXe ${sessionData.licensePlate || sessionData.LicensePlate} được phép ra cổng.`);
                        setSessionData(null);
                        setPricePolicy(null);
                        setSearchInput('');
                        setIsOvertime(false);
                    }
                } catch { /* ignore */ }
                if (attempts >= 200) {
                    clearInterval(pollingRef.current);
                    setQrPolling(false);
                    alert('QR đã hết hiệu lực. Vui lòng tạo lại.');
                    setQrData(null);
                }
            }, 3000);
        } catch (err) {
            alert('Không thể tạo mã QR: ' + (err.response?.data?.error || err.message));
        }
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

    // 2. Xác nhận thanh toán
    const handleConfirmCheckout = async () => {
        if (!sessionData) return;

        setLoadingCheckout(true);
        const now = new Date();
        const offsetMs = now.getTimezoneOffset() * 60 * 1000;
        const localTimeStr = new Date(now.getTime() - offsetMs).toISOString().split('.')[0].replace('T', ' ');

        const checkoutPayload = {
            sessionId: sessionData.sessionId || sessionData.SessionId,
            slotId: sessionData.slotId || sessionData.SlotId,
            vehicleTypeId: sessionData.vehicleTypeId || sessionData.VehicleTypeID,
            licensePlate: sessionData.licensePlate || sessionData.LicensePlate,
            cardNumber: sessionData.cardNumber || sessionData.CardNumber,
            checkInTime: getBookingStartTime(sessionData),
            checkOutTime: getBookingEndTime(sessionData) || localTimeStr,
            imageInUrl: sessionData.imageInUrl || sessionData.ImageInUrl,
            sessionStatus: "COMPLETED",
            exceptionType: sessionData.exceptionType || sessionData.ExceptionType || (isOvertime ? "OVERTIME" : null)
        };

        try {
            const formData = new FormData();
            formData.append("checkoutData", new Blob([JSON.stringify(checkoutPayload)], {
                type: "application/json"
            }));

            if (imageFile) {
                formData.append("imageOut", imageFile);
            }
            const response = await api.post(`${API_BASE}/check-out?paymentMethod=${paymentMethod}&isOvertime=${isOvertime}`, formData);
            if (response.status === 201 || response.status === 200) {
                alert(`🎉 Xử lý xe ra THÀNH CÔNG!\nTổng tiền thu: ${totalFee.toLocaleString()} đ\nĐã giải phóng slot đỗ xe.`);
                setSessionData(null);
                setPricePolicy(null);
                setSearchInput('');
                setIsOvertime(false);
                handleClearFile();
            }
        } catch (error) {
            console.error("Lỗi khi kết toán:", error);
            alert("Hệ thống không thể thực hiện lệnh thanh toán.");
        } finally {
            setLoadingCheckout(false);
        }
    };

    return (
        <div className="d-flex" style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>

            {/* Inject CSS custom nâng cao trải nghiệm màu sắc */}
            <style>{`
                .text-green-custom { color: #10B981 !important; }
                .bg-green-soft { background-color: rgba(16, 185, 129, 0.08) !important; }
                
                .text-blue-custom { color: #3B82F6 !important; }
                .bg-blue-soft { background-color: rgba(59, 130, 246, 0.08) !important; }

                .text-red-custom { color: #EF4444 !important; }
                .bg-red-soft { background-color: rgba(239, 68, 68, 0.08) !important; }
                .border-red-soft { border: 1px solid rgba(239, 68, 68, 0.2) !important; }

                .text-slate-custom { color: #64748B !important; }
                .bg-slate-light { background-color: #F8FAFC !important; }

                /* Tùy chỉnh các nút chọn phương thức thanh toán */
                .btn-check:checked + .btn-outline-primary-custom {
                    background-color: #3B82F6 !important;
                    border-color: #3B82F6 !important;
                    color: #FFFFFF !important;
                }
                .btn-outline-primary-custom {
                    color: #64748B;
                    border: 1px solid #E2E8F0;
                    background-color: #FFFFFF;
                }
                .btn-outline-primary-custom:hover {
                    background-color: #F1F5F9;
                    color: #1E293B;
                }
            `}</style>

            <StaffSidebar />

            {/* Dịch lề trái 240px khớp cấu trúc Sidebar tĩnh */}
            <div className="main-content flex-grow-1" style={{ minWidth: 0, padding: '24px 32px', marginLeft: '240px' }}>
                <div className="container-fluid px-0">

                    {/* Header */}
                    <div className="p-4 mb-4 text-white d-flex justify-content-between align-items-center position-relative shadow-sm"
                         style={{ background: 'linear-gradient(135deg, #0B1528 0%, #1E2E4A 100%)', borderRadius: '16px', minHeight: '110px' }}>
                        <div>
                            <span className="fw-bold text-uppercase opacity-70" style={{ fontSize: '11px', letterSpacing: '1.5px', color: '#3B82F6' }}>
                                <i className="fa-solid fa-right-from-bracket me-1.5" /> Gate Operations — Exit
                            </span>
                            <h3 className="fw-bold mt-1 mb-2" style={{ fontSize: '22px', letterSpacing: '-0.5px' }}>Xử Lý Xe Ra (Check-out)</h3>
                            <p className="mb-0 opacity-70" style={{ fontSize: '13px' }}>Tính toán phí thời gian thực từ hệ thống cơ sở dữ liệu</p>
                        </div>
                        <div className="d-none d-sm-flex align-items-center p-2 px-3 rounded-3 fw-bold"
                             style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '13px' }}>
                            <i className="fa-regular fa-clock me-2"></i><span>{timeStr}</span>
                        </div>
                    </div>

                    <div className="row g-4">
                        {/* Cột trái: Quét & Tra cứu */}
                        <div className="col-lg-6">
                            <div className="card shadow-sm border p-4 bg-white h-100 rounded-3" style={{ borderColor: '#E2E8F0' }}>
                                <h5 className="fw-bold mb-4 text-dark" style={{ fontSize: '16px' }}><i className="fa-solid fa-magnifying-glass text-primary me-2"></i>Truy Xuất Phiên Gửi Xe</h5>

                                <div className="d-flex align-items-center justify-content-center border rounded-3 mb-4" style={{ height: '240px', borderStyle: 'dashed', backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' }}>
                                    <div className="text-center text-secondary">
                                        <i className="fa-solid fa-qrcode fs-2 mb-3 text-slate-custom opacity-50"></i>
                                        <h6 className="fw-bold mb-1 text-dark" style={{ fontSize: '14px' }}>MÁY QUÉT VÉ TỰ ĐỘNG</h6>
                                        <p className="mb-0 text-muted" style={{ fontSize: '12.5px' }}>Đang đợi quét mã nhận diện từ camera hoặc thẻ từ...</p>
                                    </div>
                                </div>

                                {/* Khu Vực Upload Ảnh Minh Chứng Xe Ra + Nút Quét AI */}
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

                                        {/* CHỈ HIỂN THỊ KHI ĐÃ CHỌN ẢNH XE RA */}
                                        {imageFile && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-primary fw-bold px-3 d-flex align-items-center shadow-sm"
                                                    onClick={handleScanFromSelectedImage}
                                                    disabled={scanningAI || loadingSearch}
                                                    style={{ fontSize: '12px', height: '38px', borderRadius: '6px', gap: '4px' }}
                                                >
                                                    {scanningAI ? (
                                                        <><span className="spinner-border spinner-border-sm me-1.5"></span> Đang quét AI...</>
                                                    ) : (
                                                        <><i className="fa-solid fa-wand-magic-sparkles me-1.5"></i> Quét AI Biển Số</>
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

                                    {imageFile && (
                                        <div className="mt-3">
                                            <img src={URL.createObjectURL(imageFile)} alt="Preview" className="img-thumbnail rounded-3 shadow-sm border" style={{ maxHeight: '110px', objectFit: 'cover', borderColor: '#E2E8F0' }} />
                                        </div>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-bold text-slate-custom mb-2" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>TRA CỨU BIỂN SỐ THỦ CÔNG</label>
                                    <div className="input-group shadow-sm rounded-3 overflow-hidden">
                                        <span className="input-group-text bg-slate-light border-end-0 px-3" style={{ borderColor: '#E2E8F0' }}><i className="fa-solid fa-keyboard text-muted"></i></span>
                                        <input type="text" className="form-control text-uppercase fw-bold py-2 fs-5" style={{ height: '46px', borderColor: '#E2E8F0', letterSpacing: '0.5px' }} placeholder="Nhập biển số xe..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                                        <button className="btn btn-primary fw-bold px-4 fs-6" type="button" onClick={handleSearch} disabled={loadingSearch} style={{ backgroundColor: '#3B82F6', border: 'none' }}>
                                            {loadingSearch ? <span className="spinner-border spinner-border-sm"></span> : 'Truy Xuất'}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-check form-switch p-3 bg-red-soft text-red-custom border-red-soft rounded-3 mt-auto d-flex align-items-center justify-content-between">
                                    <label className="form-check-label fw-bold fs-6" style={{ cursor: 'pointer', fontSize: '13.5px' }} htmlFor="simOvertime">
                                        <i className="fa-solid fa-clock-conflict me-2"></i>Giả lập tình huống khách ra cổng trễ quá 15 phút (+10k)
                                    </label>
                                    <input className="form-check-input m-0" type="checkbox" style={{ cursor: 'pointer', transform: 'scale(1.2)' }} id="simOvertime" checked={isOvertime} onChange={() => setIsOvertime(!isOvertime)} />
                                </div>
                            </div>
                        </div>

                        {/* Cột phải: Hóa đơn & Kết toán */}
                        <div className="col-lg-6">
                            <div className="card shadow-sm border p-4 bg-white rounded-3 h-100 d-flex flex-column" style={{ borderColor: '#E2E8F0' }}>
                                <h5 className="fw-bold mb-4 text-dark" style={{ fontSize: '16px' }}><i className="fa-solid fa-file-invoice-dollar text-green-custom me-2"></i>Chi Tiết Giao Dịch & Thanh Toán</h5>

                                <div className="p-3 rounded-3 border mb-4 bg-slate-light" style={{ fontWeight: 500, fontSize: '13.5px', borderColor: '#E2E8F0' }}>
                                    <div className="d-flex justify-content-between mb-2 pb-2 border-bottom" style={{ borderColor: '#E2E8F0' }}>
                                        <span className="text-slate-custom fw-bold">Mã Phiên Gửi Xe</span>
                                        <strong className="text-dark">{sessionData ? `#${sessionData.sessionId || sessionData.SessionId}` : '--'}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2 pb-2 border-bottom" style={{ borderColor: '#E2E8F0' }}>
                                        <span className="text-slate-custom fw-bold">Tên ô đỗ</span>
                                        <strong className="text-blue-custom">{getSessionSlotName()}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2 pb-2 border-bottom" style={{ borderColor: '#E2E8F0' }}>
                                        <span className="text-slate-custom fw-bold">Mốc Giờ Vào</span>
                                        <strong className="text-dark">{sessionData ? getBookingStartTime(sessionData) : '--'}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2 pb-2 border-bottom" style={{ borderColor: '#E2E8F0' }}>
                                        <span className="text-slate-custom fw-bold">Mốc Giờ Ra Hiện Tại</span>
                                        <strong className="text-red-custom">{sessionData ? (getBookingEndTime(sessionData) || timeStr.split(' - ')[0]) : '--'}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span className="text-slate-custom fw-bold">Tổng Thời Gian Đỗ</span>
                                        <strong className="text-primary-custom fw-bold" style={{ color: '#3B82F6' }}>
                                            {durationDetails ? durationDetails.totalHoursStr : '--'}
                                        </strong>
                                    </div>
                                </div>

                                <div className="border rounded-3 p-4 mb-4 bg-white shadow-sm" style={{ borderColor: '#E2E8F0' }}>
                                    <div className="d-flex justify-content-between mb-3 pb-2.5 border-bottom border-dashed">
                                        <span className="text-slate-custom fw-bold fs-6">
                                            Định mức phí cơ bản {!sessionData ? '' : ((sessionData.vehicleTypeId === 2 || sessionData.VehicleTypeID === 2 || pricePolicy?.vehicleTypeId === 2 || pricePolicy?.VehicleTypeID === 2) ? '(Ô tô)' : '(Xe máy)')}
                                        </span>
                                        <strong className="fs-6 text-dark">
                                            {!sessionData 
                                                ? '--' 
                                                : (pricePolicy ? (pricePolicy.basePrice ?? pricePolicy.BasePrice ?? 0).toLocaleString() + 'đ' : ((sessionData.vehicleTypeId === 2 || sessionData.VehicleTypeID === 2) ? '25,000đ' : '20,000đ'))}
                                        </strong>
                                    </div>

                                    <div className="d-flex justify-content-between mb-3 pb-2.5 border-bottom border-dashed">
                                        <div>
                                            <span className="text-slate-custom fw-bold fs-6 d-block">Phí tính lũy tiến theo giờ</span>
                                            {durationDetails && (
                                                <small className="text-muted fw-semibold d-block mt-0.5" style={{ fontSize: '11.5px' }}>
                                                    (Đã gửi: <strong>{durationDetails.totalHoursStr}</strong> ➔ {durationDetails.extraHours > 0 ? `Tính ${durationDetails.extraHours}h lũy tiến x ${durationDetails.hourlyRate.toLocaleString()}đ` : 'Chưa quá 1h đầu'})
                                                </small>
                                            )}
                                        </div>
                                        <strong className="fs-6 text-blue-custom fw-bold align-self-start">
                                            {durationDetails ? `${durationDetails.progressiveFee.toLocaleString()}đ` : '--'}
                                        </strong>
                                    </div>

                                    {/* Phụ thu quá 8 giờ đỗ xe */}
                                    {sessionData && durationDetails && durationDetails.totalMinutes > 480 && (
                                        <div className="d-flex justify-content-between mb-3 pb-2.5 border-bottom border-dashed">
                                            <div>
                                                <span className="text-red-custom fw-bold fs-6 d-block">Phụ thu đỗ quá 8 giờ</span>
                                                <small className="text-muted fw-semibold d-block mt-0.5" style={{ fontSize: '11.5px' }}>
                                                    (Theo quy định đỗ xe vượt quá 8 tiếng)
                                                </small>
                                            </div>
                                            <strong className="fw-bold text-red-custom fs-6">
                                                +{(pricePolicy ? (pricePolicy.overtimeRate ?? pricePolicy.OvertimeRate ?? 150000) : ((sessionData.vehicleTypeId === 2 || sessionData.VehicleTypeID === 2) ? 150000 : 50000)).toLocaleString()} đ
                                            </strong>
                                        </div>
                                    )}

                                    {sessionData && isOvertime && (
                                        <div className="d-flex justify-content-between mb-3 pb-2.5 border-bottom border-dashed">
                                            <span className="text-red-custom fw-bold fs-6">Chi phí phụ thu quá giờ (Giả lập)</span>
                                            <strong className="fw-bold text-red-custom fs-6">+10,000 đ</strong>
                                        </div>
                                    )}
                                    {sessionData && hasLostTicket(sessionData) && (
                                        <div className="d-flex justify-content-between mb-3 pb-2.5 border-bottom border-dashed" style={{ borderStyle: 'dashed' }}>
                                            <span className="text-red-custom fw-bold fs-6">Phí biên bản mất vé</span>
                                            <strong className="fw-bold text-red-custom fs-6">
                                                +{(pricePolicy ? (pricePolicy.lostTicketPenalty ?? pricePolicy.LostTicketPenalty ?? 100000) : 100000).toLocaleString()} đ
                                            </strong>
                                        </div>
                                    )}
                                    {Boolean(sessionData && (sessionData.depositPaid || (sessionData.depositAmount && sessionData.depositAmount > 0))) && (
                                        <div className="d-flex justify-content-between mb-3 pb-2.5 border-bottom border-dashed">
                                            <div>
                                                <span className="text-success fw-bold fs-6 d-block">Khấu trừ tiền cọc đặt chỗ</span>
                                                <small className="text-muted fw-semibold d-block mt-0.5" style={{ fontSize: '11.5px' }}>
                                                    (Xe đặt chỗ trước - đã nộp cọc trước đó)
                                                </small>
                                            </div>
                                            <strong className="fw-bold text-success fs-6">
                                                -{(sessionData.depositAmount ?? ((sessionData.vehicleTypeId === 2 || sessionData.VehicleTypeID === 2) ? 6250 : 5000)).toLocaleString()} đ
                                            </strong>
                                        </div>
                                    )}
                                    <div className="d-flex justify-content-between align-items-center mt-2 gap-3 flex-wrap">
                                        <div className="d-flex align-items-center gap-2 flex-wrap">
                                            <span className="fw-bold fs-5 text-dark" style={{ letterSpacing: '-0.3px' }}>TỔNG TIỀN THU PHÍ</span>
                                            {sessionData && hasLostTicket(sessionData) && (
                                                <span className="badge bg-danger-subtle text-danger border border-danger-subtle">Có lỗi mất vé</span>
                                            )}
                                        </div>
                                        <strong className="fw-bold fs-3 text-green-custom" style={{ fontWeight: '800' }}>
                                            {sessionData && totalFee !== null && totalFee !== undefined ? `${totalFee.toLocaleString()}đ` : '--'}
                                        </strong>
                                    </div>
                                </div>

                                <label className="form-label fw-bold text-slate-custom mb-2" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>PHƯƠNG THỨC THANH TOÁN</label>
                                <div className="row g-2 mb-4">
                                    <div className="col-6">
                                        <input type="radio" className="btn-check" id="pCash" checked={paymentMethod === 'CASH'} onChange={() => { setPaymentMethod('CASH'); setQrData(null); clearInterval(pollingRef.current); setQrPolling(false); }} />
                                        <label className="btn btn-outline-primary-custom w-100 fw-bold py-2.5 fs-6" htmlFor="pCash"><i className="fa-solid fa-money-bill-1-wave me-1"></i> Tiền Mặt</label>
                                    </div>
                                    <div className="col-6">
                                        <input type="radio" className="btn-check" id="pQR" checked={paymentMethod === 'QR'} onChange={() => setPaymentMethod('QR')} />
                                        <label className="btn btn-outline-primary-custom w-100 fw-bold py-2.5 fs-6" htmlFor="pQR"><i className="fa-solid fa-qrcode me-1"></i> Chuyển Khoản</label>
                                    </div>
                                </div>

                                {/* QR PayOS — hiển thị khi chọn Chuyển Khoản và đã tạo QR */}
                                {paymentMethod === 'QR' && sessionData && !qrData && (
                                    <button className="btn btn-outline-primary w-100 fw-bold py-2 mb-3" onClick={handleCreateQR} disabled={qrPolling}>
                                        <i className="fa-solid fa-qrcode me-2"></i>Tạo Mã QR Cho Khách Quét
                                    </button>
                                )}
                                {qrData && (
                                    <div className="text-center p-3 rounded-3 border border-primary mb-3 bg-white">
                                        <div className="fw-bold text-primary small mb-2">
                                            <i className="fa-solid fa-qrcode me-1"></i>Khách quét mã để thanh toán
                                        </div>
                                        {qrData.qrCode ? (
                                            <QRCodeSVG value={qrData.qrCode} size={180} level="M" includeMargin={false} />
                                        ) : (
                                            <div className="text-muted small">Không có dữ liệu QR</div>
                                        )}
                                        <div className="fw-bold text-success mt-2">
                                            {Number(qrData.amount).toLocaleString('vi-VN')}đ
                                        </div>
                                        {qrPolling && (
                                            <div className="text-primary small mt-1">
                                                <i className="fa-solid fa-spinner fa-spin me-1"></i>Đang chờ xác nhận...
                                            </div>
                                        )}
                                        <button className="btn btn-sm btn-outline-secondary mt-2" onClick={() => { clearInterval(pollingRef.current); setQrData(null); setQrPolling(false); }}>
                                            Hủy QR
                                        </button>
                                    </div>
                                )}

                                <button className="btn btn-success bg-green-custom w-100 fw-bold py-3 fs-6 mt-auto shadow-sm" style={{ border: 'none', borderRadius: '8px' }} disabled={!sessionData || loadingCheckout || paymentMethod === 'QR'} onClick={handleConfirmCheckout}>
                                    {loadingCheckout ? (
                                        <><span className="spinner-border spinner-border-sm me-2"></span> Đang cập nhật giải phóng bãi...</>
                                    ) : paymentMethod === 'QR' ? (
                                        <><i className="fa-solid fa-lock me-2"></i>Chờ khách quét QR để tự động xác nhận</>
                                    ) : (
                                        <><i className="fa-solid fa-circle-check me-2"></i>Xác Nhận Thu Tiền & Mở Cổng Cho Xe Ra</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Checkout;

