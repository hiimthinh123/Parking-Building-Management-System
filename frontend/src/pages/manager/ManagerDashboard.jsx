// src/pages/manager/ManagerDashboard.jsx
import { useState, useEffect } from 'react';
import api from '../../config/Api';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import ManagerSidebar from '../../components/ManagerSidebar';
import CustomDatePicker from '../../components/CustomDatePicker';

const INCIDENT_TYPE_LABELS = {
    LOST_TICKET: 'Mất thẻ xe',
    PAYMENT_ERROR: 'Lỗi thanh toán',
    WRONG_PARKING_POSITION: 'Đỗ sai vị trí',
    OCCUPIED_SLOT: 'Chiếm chỗ',
    CUSTOMER_REPORT: 'Phản ánh khách hàng',
};

const INCIDENT_STATUS_META = {
    RESOLVED: { label: 'Đã giải quyết', className: 'bg-green-soft text-green-custom', icon: 'fa-check' },
    IN_REVIEW: { label: 'Đang xử lý', className: 'bg-amber-soft text-amber-custom', icon: 'fa-spinner fa-spin' },
    ESCALATED: { label: 'Đã chuyển cấp', className: 'bg-red-soft text-red-custom', icon: 'fa-triangle-exclamation' },
    OPEN: { label: 'Mới tạo', className: 'bg-red-soft text-red-custom', icon: 'fa-circle-exclamation' },
};

function formatRelativeTime(value) {
    if (!value) return 'Không rõ thời gian';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Không rõ thời gian';

    const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return `${Math.floor(hours / 24)} ngày trước`;
}

function ManagerDashboard() {
    // --- 1. TẦNG KHỞI TẠO STATE ĐỘNG ---
    const [stats, setStats] = useState({
        carsInGarage: 0,
        availableSlots: 0,
        bookedSlots: 0,
        maintenanceSlots: 0,
        dailyRevenue: 0,
        totalSlots: 0,
        carRatioInGarage: 0,
        bikeRatioInGarage: 0
    });

    const [floor1Slots, setFloor1Slots] = useState([]);
    const [floor2Slots, setFloor2Slots] = useState([]);
    const [recentIncidents, setRecentIncidents] = useState([]);

    const [trafficData, setTrafficData] = useState({
        in: [0, 0, 0, 0, 0, 0, 0, 0],
        out: [0, 0, 0, 0, 0, 0, 0, 0]
    });

    const [, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

    // --- 2. TẦNG ĐỒNG BỘ DATA TỪ API SPRING BOOT ---
    useEffect(() => {
        Promise.all([
            api.get('/slots/count/all'),
            api.get('/slots/status/occupied/floor/1'),
            api.get('/payments/daily-revenue'),
            api.get('/slots/floor/1'),
            api.get('/slots/floor/2'),
            api.get('/parking/chart/check-in', { params: { targetDate: filterDate } }),
            api.get('/parking/chart/check-out', { params: { targetDate: filterDate } }),
            api.get('/staff/incidents')
        ])
            .then(([countAllRes, countFloor1Res, revenueRes, floor1Res, floor2Res, checkInRes, checkOutRes, incidentsRes]) => {
                const occupiedAll = countAllRes.data[0] || 0;
                const availableAll = countAllRes.data[1] || 0;
                const bookedAll = countAllRes.data[2] || 0;
                const maintenanceAll = countAllRes.data[3] || 0;
                const total = occupiedAll + availableAll + bookedAll + maintenanceAll;

                const carOccupiedInFloor1 = countFloor1Res.data || 0;
                let carRatio = 0;
                let bikeRatio = 0;
                if (occupiedAll > 0) {
                    carRatio = Math.round((carOccupiedInFloor1 / occupiedAll) * 100);
                    bikeRatio = 100 - carRatio;
                }

                setStats({
                    carsInGarage: occupiedAll,
                    availableSlots: availableAll,
                    bookedSlots: bookedAll,
                    maintenanceSlots: maintenanceAll,
                    dailyRevenue: revenueRes.data[0] || 0,
                    totalSlots: total,
                    carRatioInGarage: carRatio,
                    bikeRatioInGarage: bikeRatio
                });

                setFloor1Slots(floor1Res.data || []);
                setFloor2Slots(floor2Res.data || []);
                setRecentIncidents((incidentsRes.data || []).slice(0, 3));

                setTrafficData({
                    in: checkInRes.data || [0, 0, 0, 0, 0, 0, 0, 0],
                    out: checkOutRes.data || [0, 0, 0, 0, 0, 0, 0, 0]
                });

                setLoading(false);
            })
            .catch(error => {
                console.error("Lỗi đồng bộ dữ liệu bảng điều khiển quản trị:", error);
                setLoading(false);
            });
    }, []);

    // --- 3. SỰ KIỆN KHI BẤM CHỌN NGÀY CỦA DATEPICKER ---
    const handleFetchTrafficByDate = (date) => {
        setFilterDate(date);

        // Gọi lại 2 API chart dựa vào ngày người dùng chọn
        Promise.all([
            api.get('/parking/chart/check-in', { params: { targetDate: date } }),
            api.get('/parking/chart/check-out', { params: { targetDate: date } })
        ])
            .then(([checkInRes, checkOutRes]) => {
                setTrafficData({
                    in: checkInRes.data || [0, 0, 0, 0, 0, 0, 0, 0],
                    out: checkOutRes.data || [0, 0, 0, 0, 0, 0, 0, 0]
                });
            })
            .catch(error => console.error("Lỗi cập nhật biểu đồ theo ngày:", error));
    };

    // --- 4. CẤU HÌNH BIỂU ĐỒ LƯU LƯỢNG XE ---
    const chartData = {
        labels: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
        datasets: [
            {
                label: 'Lượt Xe Vào',
                data: trafficData.in,
                borderColor: 'rgba(59, 130, 246, 1)',
                backgroundColor: 'transparent',
                borderWidth: 2,
                pointRadius: 3,
                tension: 0.4,
                fill: true
            },
            {
                label: 'Lượt Xe Ra',
                data: trafficData.out,
                borderColor: 'rgba(239, 68, 68, 1)',
                backgroundColor: 'transparent',
                borderWidth: 4,
                pointRadius: 5,
                tension: 0.4,
                fill: true
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11, weight: '600' } } } },
        scales: {
            y: {
                beginAtZero: true,
                suggestedMax: 10,
                ticks: { stepSize: 1, precision: 0 },
                grid: { color: '#F1F5F9' },
                title: { display: true, text: 'Số lượng xe (Chiếc)', font: { size: 10, weight: '600' } }
            },
            x: {
                grid: { display: false },
                title: { display: true, text: 'Mốc thời gian (h)', font: { size: 10, weight: '600' } }
            }
        }
    };

    // --- 5. HÀM TRỢ GIÚP ĐỊNH DẠNG BOX SƠ ĐỒ VỊ TRÍ ---
    const getSlotStyleClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'occupied': return 'slot-occupied';
            case 'booked': return 'slot-booked';
            case 'maintenance': return 'slot-maintenance';
            default: return 'slot-available';
        }
    };

    const getSlotLabel = (slot) => {
        const status = slot.status?.toLowerCase();
        if (status === 'occupied') return 'Có xe';
        if (status === 'booked') return 'Đặt trước';
        if (status === 'maintenance') return 'Bảo trì';
        return 'Trống';
    };

    const formattedDate = new Date().toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });

    return (
        <div className="d-flex" style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>

            <style>{`
                .text-blue-custom { color: #3B82F6 !important; }
                .bg-blue-soft { background-color: rgba(59, 130, 246, 0.08) !important; }
                
                .text-green-custom { color: #10B981 !important; }
                .bg-green-soft { background-color: rgba(16, 185, 129, 0.08) !important; }
                
                .text-amber-custom { color: #F59E0B !important; }
                .bg-amber-soft { background-color: rgba(245, 158, 11, 0.08) !important; }

                .text-red-custom { color: #EF4444 !important; }
                .bg-red-soft { background-color: rgba(239, 68, 68, 0.08) !important; }

                .text-slate-custom { color: #64748B !important; }
                .bg-slate-soft { background-color: rgba(100, 116, 139, 0.08) !important; }

                .slot-available { background-color: #E6F4EA !important; color: #137333 !important; border: 1px solid #CEEAD6 !important; }
                .slot-occupied { background-color: #FCE8E6 !important; color: #C5221F !important; border: 1px solid #FAD2CF !important; }
                .slot-booked { background-color: #FEF7E0 !important; color: #B06000 !important; border: 1px solid #FEEFC3 !important; }
                .slot-maintenance { background-color: #F1F3F4 !important; color: #5F6368 !important; border: 1px solid #E8EAED !important; }
            `}</style>

            <ManagerSidebar />

            <div className="main-content flex-grow-1" style={{ minWidth: 0, padding: '24px 32px', marginLeft: '240px' }}>
                <div className="container-fluid px-0">

                    {/* Header */}
                    <div className="p-4 mb-4 text-white d-flex justify-content-between align-items-center position-relative shadow-sm"
                         style={{
                             background: 'linear-gradient(135deg, #0B1528 0%, #1E2E4A 100%)',
                             borderRadius: '16px',
                             minHeight: '140px'
                         }}>
                        <div>
                            <span className="fw-bold text-uppercase opacity-70" style={{ fontSize: '11px', letterSpacing: '1.5px', color: '#3B82F6' }}>
                                <i className="fa-solid fa-chart-line me-1.5" /> Operations & Performance Analytics
                            </span>
                            <h2 className="fw-bold mt-1 mb-2" style={{ fontSize: '26px', letterSpacing: '-0.5px' }}>Trang Tổng Quan Quản Trị</h2>
                            <p className="mb-0 opacity-70" style={{ fontSize: '13.5px' }}>Theo dõi hiệu suất kinh doanh và vận hành hệ thống toàn bãi theo thời gian thực.</p>
                        </div>

                        <div className="d-flex align-items-center p-2.5 px-3 rounded-3 d-none d-sm-flex"
                             style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            <div className="bg-success rounded-circle me-2.5" style={{ width: '10px', height: '10px', boxShadow: '0 0 8px #10B981' }} />
                        </div>
                    </div>

                    {/* Khối Thống Kê 5 Ô Đầu Trang */}
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-5 g-3 mb-4">
                        {/* Xe Trong Bãi */}
                        <div className="col">
                            <div className="card p-3 border-0 shadow-sm h-100 d-flex flex-row align-items-center position-relative text-white rounded-3"
                                 style={{ background: 'linear-gradient(135deg, #0B1528 0%, #1E2E4A 100%)', minHeight: '100px' }}>
                                <div className="p-2.5 bg-blue-soft rounded-3 me-3 d-flex align-items-center justify-content-center" style={{ width: '46px', height: '46px' }}>
                                    <i className="fa-solid fa-car-rear fs-4 text-blue-custom"></i>
                                </div>
                                <div>
                                    <span className="fw-bold d-block mb-0.5 opacity-60" style={{ fontSize: '10.5px', letterSpacing: '0.5px', color: '#93C5FD' }}>XE TRONG BÃI</span>
                                    <h3 className="fw-extrabold my-0 lh-1 text-white fs-3" style={{ letterSpacing: '-0.5px' }}>{stats.carsInGarage}</h3>
                                    <small className="opacity-40 d-block mt-1" style={{ fontSize: '10px' }}>Hiện hành</small>
                                </div>
                            </div>
                        </div>

                        {/* Slot Trống */}
                        <div className="col">
                            <div className="card p-3 border-0 shadow-sm h-100 d-flex flex-row align-items-center position-relative text-white rounded-3"
                                 style={{ background: 'linear-gradient(135deg, #0B1528 0%, #1E2E4A 100%)', minHeight: '100px' }}>
                                <div className="p-2.5 bg-green-soft rounded-3 me-3 d-flex align-items-center justify-content-center" style={{ width: '46px', height: '46px' }}>
                                    <i className="fa-solid fa-square-check fs-4 text-green-custom"></i>
                                </div>
                                <div>
                                    <span className="fw-bold d-block mb-0.5 opacity-60" style={{ fontSize: '10.5px', letterSpacing: '0.5px', color: '#4ADE80' }}>SLOT TRỐNG</span>
                                    <h3 className="fw-extrabold my-0 lh-1 text-white fs-3" style={{ letterSpacing: '-0.5px' }}>{stats.availableSlots}</h3>
                                    <small className="opacity-40 d-block mt-1" style={{ fontSize: '10px' }}>Khả dụng</small>
                                </div>
                            </div>
                        </div>

                        {/* Slot Đặt Trước */}
                        <div className="col">
                            <div className="card p-3 border-0 shadow-sm h-100 d-flex flex-row align-items-center position-relative text-white rounded-3"
                                 style={{ background: 'linear-gradient(135deg, #0B1528 0%, #1E2E4A 100%)', minHeight: '100px' }}>
                                <div className="p-2.5 bg-amber-soft rounded-3 me-3 d-flex align-items-center justify-content-center" style={{ width: '46px', height: '46px' }}>
                                    <i className="fa-solid fa-clock fs-4 text-amber-custom"></i>
                                </div>
                                <div>
                                    <span className="fw-bold d-block mb-0.5 opacity-60" style={{ fontSize: '10.5px', letterSpacing: '0.5px', color: '#F59E0B' }}>SLOT ĐẶT TRƯỚC</span>
                                    <h3 className="fw-extrabold my-0 lh-1 text-white fs-3" style={{ letterSpacing: '-0.5px' }}>{stats.bookedSlots}</h3>
                                    <small className="opacity-40 d-block mt-1" style={{ fontSize: '10px' }}>Chờ xe vào</small>
                                </div>
                            </div>
                        </div>

                        {/* Slot Bảo Trì */}
                        <div className="col">
                            <div className="card p-3 border-0 shadow-sm h-100 d-flex flex-row align-items-center position-relative text-white rounded-3"
                                 style={{ background: 'linear-gradient(135deg, #0B1528 0%, #1E2E4A 100%)', minHeight: '100px' }}>
                                <div className="p-2.5 bg-slate-soft rounded-3 me-3 d-flex align-items-center justify-content-center" style={{ width: '46px', height: '46px' }}>
                                    <i className="fa-solid fa-hammer fs-4 text-slate-custom"></i>
                                </div>
                                <div>
                                    <span className="fw-bold d-block mb-0.5 opacity-60" style={{ fontSize: '10.5px', letterSpacing: '0.5px', color: '#94A3B8' }}>SLOT BẢO TRÌ</span>
                                    <h3 className="fw-extrabold my-0 lh-1 text-white fs-3" style={{ letterSpacing: '-0.5px' }}>{stats.maintenanceSlots}</h3>
                                    <small className="opacity-40 d-block mt-1" style={{ fontSize: '10px' }}>Đang tạm khóa</small>
                                </div>
                            </div>
                        </div>

                        {/* Doanh Thu */}
                        <div className="col">
                            <div className="card p-3 border-0 shadow-sm h-100 d-flex flex-row align-items-center position-relative text-white rounded-3"
                                 style={{ background: 'linear-gradient(135deg, #0B1528 0%, #1E2E4A 100%)', minHeight: '100px' }}>
                                <div className="p-2.5 bg-red-soft rounded-3 me-3 d-flex align-items-center justify-content-center" style={{ width: '46px', height: '46px' }}>
                                    <i className="fa-solid fa-money-bill-wave fs-4 text-red-custom"></i>
                                </div>
                                <div>
                                    <span className="fw-bold d-block mb-0.5 opacity-60" style={{ fontSize: '10.5px', letterSpacing: '0.5px', color: '#F87171' }}>DOANH THU ({formattedDate})</span>
                                    <h3 className="fw-extrabold my-0 lh-1 text-white fs-4" style={{ letterSpacing: '-0.5px' }}>
                                        {Math.round(stats.dailyRevenue).toLocaleString('vi-VN')}đ
                                    </h3>
                                    <small className="opacity-40 d-block mt-1" style={{ fontSize: '10px' }}>Tổng thu trong ngày</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Khu Vực Thân Trang */}
                    <div className="row g-4">
                        {/* CỘT TRÁI */}
                        <div className="col-xl-8">
                            {/* Biểu đồ lưu lượng tuyến tính */}
                            <div className="card shadow-sm border p-4 mb-4 bg-white rounded-3" style={{ borderColor: '#E2E8F0' }}>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '16px' }}>
                                        <i className="fa-solid fa-chart-line text-primary me-2"></i>Thống kê lưu lượng xe ra vào
                                    </h5>
                                    <i className="fa-solid fa-calendar-days position-absolute text-muted"
                                            style={{ left: '630px', top: '40px', transform: 'translateY(-50%)', zIndex: 3, pointerEvents: 'none', fontSize: '14px' }}
                                    />
                                    <CustomDatePicker onDateChange={handleFetchTrafficByDate} />
                                </div>
                                <div style={{ height: '329px', width: '100%' }}>
                                    <Line data={chartData} options={chartOptions} />
                                </div>
                            </div>

                            {/* Giám sát sơ đồ ô vị trí tổng lực */}
                            <div className="card shadow-sm border p-4 bg-white rounded-3" style={{ borderColor: '#E2E8F0' }}>
                                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center border-bottom pb-3 mb-4 gap-2" style={{ borderColor: '#E2E8F0' }}>
                                    <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '16px' }}><i className="fa-solid fa-map-location-dot me-2 text-primary"></i>Giám sát sơ đồ mặt bằng bãi xe</h5>
                                    <div className="d-flex flex-wrap gap-3 text-secondary" style={{ fontSize: '12px', fontWeight: 600 }}>
                                        <span><i className="fa-solid fa-square text-green-custom me-1"></i> Trống</span>
                                        <span><i className="fa-solid fa-square text-red-custom me-1"></i> Có xe</span>
                                        <span><i className="fa-solid fa-square text-amber-custom me-1"></i> Đặt trước</span>
                                        <span><i className="fa-solid fa-square me-1"></i> Bảo trì</span>
                                    </div>
                                </div>

                                {/* Sơ đồ Tầng 1 */}
                                <h6 className="fw-bold text-dark mb-3 border-start border-primary border-3 ps-2 fs-6" style={{ letterSpacing: '-0.3px' }}>TẦNG 1 (Khu Vực Ô Tô)</h6>
                                <div className="slot-grid mb-5" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(92px, 1fr))', gap: '12px' }}>
                                    {floor1Slots.map((slot) => (
                                        <div key={slot.slotId} className={`slot-box p-2 text-center rounded-3 shadow-sm border fw-bold ${getSlotStyleClass(slot.status)}`} style={{ fontSize: '13px', minHeight: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                            <span className="slot-code d-block">{slot.slotCode}</span>
                                            {slot.currentVehiclePlate && (
                                                <span className="mt-0.5 text-truncate mx-auto" style={{ fontSize: '10.5px', fontWeight: 700, maxWidth: '100%' }}>{slot.currentVehiclePlate}</span>
                                            )}
                                            <span className="mt-0.5 opacity-85 text-truncate mx-auto" style={{ fontSize: '10px', fontWeight: 500, maxWidth: '100%' }}>{getSlotLabel(slot)}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Sơ đồ Tầng 2 */}
                                <h6 className="fw-bold text-dark mb-3 border-start border-success border-3 ps-2 fs-6" style={{ letterSpacing: '-0.3px' }}>TẦNG 2 (Khu Vực Xe Máy)</h6>
                                <div className="slot-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(92px, 1fr))', gap: '12px' }}>
                                    {floor2Slots.map((slot) => (
                                        <div key={slot.slotId} className={`slot-box p-2 text-center rounded-3 shadow-sm border fw-bold ${getSlotStyleClass(slot.status)}`} style={{ fontSize: '13px', minHeight: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                            <span className="slot-code d-block">{slot.slotCode}</span>
                                            {slot.currentVehiclePlate && (
                                                <span className="mt-0.5 text-truncate mx-auto" style={{ fontSize: '10.5px', fontWeight: 700, maxWidth: '100%' }}>{slot.currentVehiclePlate}</span>
                                            )}
                                            <span className="mt-0.5 opacity-85 text-truncate mx-auto" style={{ fontSize: '10px', fontWeight: 500, maxWidth: '100%' }}>{getSlotLabel(slot)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* CỘT PHẢI */}
                        <div className="col-xl-4">

                            {/* Card Hiển thị tỷ lệ lấp đầy bãi */}
                            <div className="d-flex flex-column justify-content-center align-items-center card shadow-sm border p-4 mb-4 text-center bg-white rounded-3" style={{ minHeight: "430px", borderColor: '#E2E8F0' }}>
                                <h5 className="fw-bold text-dark w-100 text-start mb-4" style={{ fontSize: '16px' }}><i className="fa-solid fa-chart-simple text-green-custom me-2"></i>Tỷ lệ lấp đầy bãi xe</h5>
                                <div className="w-100 py-2">
                                    <h1 className="display-4 fw-extrabold text-green-custom mb-2" style={{ fontSize: '3.5rem', fontWeight: '800' }}>
                                        {stats.totalSlots > 0 ? Math.round((stats.carsInGarage / stats.totalSlots) * 100) : 0}%
                                    </h1>
                                    <p className="text-secondary mt-3 mb-0 px-2" style={{ fontSize: '14.5px', lineHeight: '1.7', fontWeight: 500 }}>
                                        Hệ thống đang lưu trữ <strong className="text-dark">{stats.carsInGarage}</strong> phương tiện trên tổng số <strong className="text-dark">{stats.totalSlots}</strong> vị trí đỗ toàn bãi.
                                        {stats.carsInGarage > 0 && (
                                            <span className="d-block mt-2 text-muted" style={{ fontSize: '13.5px' }}>Trong đó, ghi nhận có <strong className="text-blue-custom">{stats.carRatioInGarage}%</strong> ô tô và <strong className="text-amber-custom">{stats.bikeRatioInGarage}%</strong> xe máy đang phân bổ.</span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Khối giám sát sự cố bất thường ngầm */}
                            <div className="card shadow-sm border p-4 bg-white rounded-3" style={{ borderColor: '#E2E8F0' }}>
                                <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2" style={{ borderColor: '#E2E8F0' }}>
                                    <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '16px' }}><i className="fa-solid fa-triangle-exclamation text-red-custom me-2"></i>Giám sát sự cố</h5>
                                    <a href="#" className="text-decoration-none fw-bold text-blue-custom" style={{ fontSize: '13px' }}>Xem tất cả</a>
                                </div>
                                <div className="list-group list-group-flush">
                                    {recentIncidents.length === 0 ? (
                                        <div className="text-center text-secondary py-4" style={{ fontSize: '13px' }}>
                                            <i className="fa-solid fa-shield-heart d-block fs-4 mb-2 text-green-custom"></i>
                                            Chưa có sự cố nào được ghi nhận.
                                        </div>
                                    ) : recentIncidents.map((incident, index) => {
                                        const status = INCIDENT_STATUS_META[incident.status] || INCIDENT_STATUS_META.OPEN;
                                        const isResolved = incident.status === 'RESOLVED';
                                        const titleClass = isResolved ? 'text-green-custom' : 'text-red-custom';
                                        const description = incident.evidenceNote
                                            || `Sự cố liên quan đến xe ${incident.licensePlate || 'chưa xác định'}.`;

                                        return (
                                            <div
                                                className={`list-group-item px-0 py-3 ${index < recentIncidents.length - 1 ? 'border-bottom' : ''}`}
                                                style={{ borderColor: '#F1F5F9' }}
                                                key={incident.incidentId}
                                            >
                                                <div className="d-flex w-100 justify-content-between align-items-center mb-1 gap-2">
                                                    <span className={`fw-bold ${titleClass} fs-6`}>
                                                        {INCIDENT_TYPE_LABELS[incident.incidentType] || incident.incidentType}
                                                        {incident.licensePlate ? ` – ${incident.licensePlate}` : ''}
                                                    </span>
                                                    <small className="text-muted text-nowrap" style={{ fontSize: '11px' }}>
                                                        {formatRelativeTime(incident.createdAt)}
                                                    </small>
                                                </div>
                                                <p className="mb-2 text-secondary" style={{ fontSize: '13px', lineHeight: '1.45' }}>
                                                    {description}
                                                </p>
                                                <span className={`badge ${status.className} px-2.5 py-1.5 rounded-2 fw-bold`} style={{ fontSize: '11px' }}>
                                                    <i className={`fa-solid ${status.icon} me-1`}></i>{status.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default ManagerDashboard;
