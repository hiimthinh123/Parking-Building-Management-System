// src/pages/manager/ManagerReports.jsx
import { useState, useEffect, useMemo } from 'react';
import api from '../../config/Api';
import { Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import * as XLSX from 'xlsx';
import ManagerSidebar from '../../components/ManagerSidebar';

// ── COMPONENT CON: Tự động tải số tiền theo từng sessionId riêng biệt ──
function SessionAmount({ sessionId, fallbackAmount }) {
    const [amount, setAmount] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!sessionId) {
            setLoading(false);
            return;
        }

        api.get(`/payments/amount/${sessionId}`)
            .then(res => {
                setAmount(res.data);
            })
            .catch(err => {
                console.error(`Lỗi fetch amount cho session #${sessionId}:`, err);
                setAmount(fallbackAmount);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [sessionId, fallbackAmount]);

    return (
        <td className="text-end pe-3 fw-bold text-dark fs-6">
            {loading ? (
                <span className="spinner-border spinner-border-sm text-secondary opacity-50" role="status"></span>
            ) : (
                `${Number(amount ?? 0).toLocaleString('vi-VN')}đ`
            )}
        </td>
    );
}

function ManagerReports() {
    // --- 1. TẦNG KHỞI TẠO STATE ĐỘNG ---
    const [profitList, setProfitList] = useState([0, 0, 0]);
    const [sessions, setSessions] = useState([]);
    const [managerFeedbacks, setManagerFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Bổ sung State phục vụ Bộ lọc & Sắp xếp
    const [filterVehicleType, setFilterVehicleType] = useState('ALL'); // ALL, CAR, MOTO
    const [sortOrder, setSortOrder] = useState('NEWEST'); // NEWEST (Mặc định), OLDEST

    // State phục vụ Modal Xem trước Excel
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    // --- 2. TẦNG ĐỒNG BỘ DỮ LIỆU TỪ API BACKEND ---
    useEffect(() => {
        Promise.all([
            api.get('/payments/daily-revenue'),
            api.get('/parking/sessions'),
            api.get('/feedback/manager')
        ])
            .then(([revenueRes, sessionsRes, feedbackRes]) => {
                setProfitList(revenueRes.data || [0, 0, 0]);
                setSessions(sessionsRes.data || []);
                setManagerFeedbacks(feedbackRes.data || []);
                setLoading(false);
            })
            .catch(error => {
                console.error("Lỗi khi kéo dữ liệu báo cáo thống kê:", error);
                setLoading(false);
            });
    }, []);

    // --- 3. XỬ LÝ LỌC VÀ SẮP XẾP SESSIONS BẰNG USEMEMO ---
    const processedSessions = useMemo(() => {
        // Lọc theo loại xe
        let result = [...sessions];
        if (filterVehicleType === 'CAR') {
            result = result.filter(ses => ses.vehicleTypeId === 2); // Ô tô
        } else if (filterVehicleType === 'MOTO') {
            result = result.filter(ses => ses.vehicleTypeId !== 2);  // Xe máy
        }

        // Sắp xếp theo thời gian vào (Mặc định mới nhất lên đầu)
        result.sort((a, b) => {
            const timeA = new Date(a.checkInTime || 0);
            const timeB = new Date(b.checkInTime || 0);
            return sortOrder === 'NEWEST' ? timeB - timeA : timeA - timeB;
        });

        return result;
    }, [sessions, filterVehicleType, sortOrder]);

    // --- 4. LOGIC TÍNH TOÁN DOANH THU ĐẦU TRANG ---
    const totalRevenue = profitList[0] > 0
        ? profitList[0]
        : sessions.reduce((sum, ses) => sum + Number(ses.amount || ses.totalPayment || 0), 0);

    const carRevenue = profitList[1] > 0
        ? profitList[1]
        : sessions.filter(ses => ses.vehicleTypeId !== 2).reduce((sum, ses) => sum + Number(ses.amount || ses.totalPayment || 0), 0);

    const motoRevenue = profitList[2] > 0
        ? profitList[2]
        : sessions.filter(ses => ses.vehicleTypeId === 2).reduce((sum, ses) => sum + Number(ses.amount || ses.totalPayment || 0), 0);

    // --- 5. CẤU HÌNH BIỂU ĐỒ TRÒN ---
    const pieData = {
        labels: ['Doanh Thu Ô Tô (đ)', 'Doanh Thu Xe Máy (đ)'],
        datasets: [{
            data: [carRevenue, motoRevenue],
            backgroundColor: ['#3B82F6', 'orange'],
            borderWidth: 2,
            borderColor: '#ffffff'
        }]
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { boxWidth: 12, font: { size: 12, weight: '600' } }
            }
        }
    };

    const conclusion = totalRevenue > 0
        ? carRevenue >= motoRevenue
            ? `Nguồn thu từ khối phương tiện <strong class="text-blue-custom">Ô tô</strong> hiện đang chiếm ưu thế với tỷ trọng khoảng <strong>${Math.round(carRevenue / totalRevenue * 100)}%</strong> tổng giá trị dòng tiền thu về trong ngày.`
            : `Nguồn thu từ khối phương tiện <strong class="text-green-custom">Xe máy</strong> hiện đang chiếm ưu thế với tỷ trọng khoảng <strong>${Math.round(motoRevenue / totalRevenue * 100)}%</strong> tổng giá trị dòng tiền thu về trong ngày.`
        : "Chưa phát sinh dữ liệu giao dịch thu phí nào trong ngày hôm nay.";

    const formattedDate = new Date().toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });

    // --- 6. HÀM TẢI FILE EXCEL SAU KHỦNG XEM TRƯỚC ---
    const handleDownloadExcel = () => {
        if (!processedSessions || processedSessions.length === 0) {
            alert("⚠️ Không có dữ liệu để xuất file Excel!");
            return;
        }

        const dataToExport = processedSessions.map((ses, index) => ({
            "STT": index + 1,
            "Mã Lượt": `#${ses.sessionId}`,
            "Biển Số Xe": ses.licensePlate || "N/A",
            "Loại Xe": ses.vehicleTypeId === 2 ? "Xe máy" : "Ô tô",
            "Thời Gian Vào": ses.checkInTime ? ses.checkInTime.replace('T', ' ').substring(0, 16) : "-",
            "Thời Gian Ra": ses.checkOutTime ? ses.checkOutTime.replace('T', ' ').substring(0, 16) : "-",
            "Trạng Thái": ses.sessionStatus?.toUpperCase() === 'ACTIVE' ? 'Trong phiên' : 'Xong phiên',
            "Ngoại Lệ": (!ses.exceptionType || ses.exceptionType?.toUpperCase() === 'NONE' || ses.exceptionType?.toUpperCase() === 'NULL') ? '-' : ses.exceptionType,
            "Thành Tiền (đ)": ses.amount || ses.totalPayment || 0
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "NhatKyGiaoDich");

        const fileName = `Bao_Cao_Nhat_Ky_Bai_Xe_${new Date().toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(workbook, fileName);

        setShowPreviewModal(false); // Đóng modal sau khi tải xong
    };

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
                .bg-slate-light { background-color: #F8FAFC !important; }
                
                .filter-select {
                    font-size: 13px; 
                    font-weight: 600; 
                    border-color: #E2E8F0; 
                    height: 36px;
                    border-radius: 8px;
                }
            `}</style>

            <ManagerSidebar />

            <div className="main-content flex-grow-1" style={{ minWidth: 0, padding: '24px 32px', marginLeft: '240px' }}>
                <div className="container-fluid px-0">

                    {/* BANNER ĐỈNH CAO */}
                    <div className="p-4 mb-4 text-white d-flex justify-content-between align-items-center position-relative shadow-sm"
                         style={{
                             background: 'linear-gradient(135deg, #0B1528 0%, #1E2E4A 100%)',
                             borderRadius: '16px',
                             minHeight: '140px'
                         }}>
                        <div>
                   <span className="fw-bold text-uppercase opacity-70" style={{ fontSize: '11px', letterSpacing: '1.5px', color: '#3B82F6' }}>
                      <i className="fa-solid fa-chart-pie me-1.5" /> Financial & Revenue Analytics
                   </span>
                            <h2 className="fw-bold mt-1 mb-2" style={{ fontSize: '26px', letterSpacing: '-0.5px' }}>Thống Kê Báo Cáo Doanh Thu</h2>
                            <p className="mb-0 opacity-70" style={{ fontSize: '13.5px' }}>Tổng hợp dòng tiền giao dịch thu phí và phân tích cơ cấu doanh thu thực tế toàn bãi.</p>
                        </div>

                        <div className="d-flex align-items-center p-2.5 px-3 rounded-3 d-none d-sm-flex"
                             style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            <div className="bg-success rounded-circle me-2.5" style={{ width: '10px', height: '10px', boxShadow: '0 0 8px #10B981' }} />
                        </div>
                    </div>

                    {/* KHỐI THỐNG KÊ 3 Ô DOANH THU */}
                    <div className="row g-3 mb-4">
                        {/* Tổng doanh thu */}
                        <div className="col-md-4">
                            <div className="card p-3 border-0 shadow-sm h-100 d-flex flex-row align-items-center position-relative text-white rounded-3"
                                 style={{ background: 'linear-gradient(135deg, #0B1528 0%, #1E2E4A 100%)', minHeight: '100px' }}>
                                <div className="p-2.5 bg-red-soft rounded-3 me-3 d-flex align-items-center justify-content-center" style={{ width: '46px', height: '46px' }}>
                                    <i className="fa-solid fa-money-bill-trend-up fs-4 text-red-custom"></i>
                                </div>
                                <div>
                         <span className="fw-bold d-block mb-0.5 opacity-60" style={{ fontSize: '10.5px', letterSpacing: '0.5px', color: '#F87171' }}>
                              TỔNG DOANH THU ({formattedDate})
                         </span>
                                    <h3 className="fw-extrabold my-0 lh-1 text-white fs-3" style={{ letterSpacing: '-0.5px' }}>
                                        {Math.round(totalRevenue).toLocaleString('vi-VN')}đ
                                    </h3>
                                    <small className="opacity-40 d-block mt-1" style={{ fontSize: '10px' }}>Toàn bộ hệ thống bãi</small>
                                </div>
                            </div>
                        </div>

                        {/* Doanh thu ô tô */}
                        <div className="col-md-4">
                            <div className="card p-3 border-0 shadow-sm h-100 d-flex flex-row align-items-center position-relative text-white rounded-3"
                                 style={{ background: 'linear-gradient(135deg, #0B1528 0%, #1E2E4A 100%)', minHeight: '100px' }}>
                                <div className="p-2.5 bg-blue-soft rounded-3 me-3 d-flex align-items-center justify-content-center" style={{ width: '46px', height: '46px' }}>
                                    <i className="fa-solid fa-car fs-4 text-blue-custom"></i>
                                </div>
                                <div>
                           <span className="fw-bold d-block mb-0.5 opacity-60" style={{ fontSize: '10.5px', letterSpacing: '0.5px', color: '#93C5FD' }}>
                                 DOANH THU PHÂN HỆ Ô TÔ
                           </span>
                                    <h3 className="fw-extrabold my-0 lh-1 text-white fs-3" style={{ letterSpacing: '-0.5px' }}>
                                        {Math.round(carRevenue).toLocaleString('vi-VN')}đ
                                    </h3>
                                    <small className="opacity-40 d-block mt-1" style={{ fontSize: '10px' }}>Khối Tầng 1</small>
                                </div>
                            </div>
                        </div>

                        {/* Doanh thu xe máy */}
                        <div className="col-md-4">
                            <div className="card p-3 border-0 shadow-sm h-100 d-flex flex-row align-items-center position-relative text-white rounded-3"
                                 style={{ background: 'linear-gradient(135deg, #0B1528 0%, #1E2E4A 100%)', minHeight: '100px' }}>
                                <div className="p-2.5 bg-green-soft rounded-3 me-3 d-flex align-items-center justify-content-center" style={{ width: '46px', height: '46px' }}>
                                    <i className="fa-solid fa-motorcycle fs-4 text-amber-custom"></i>
                                </div>
                                <div>
                       <span className="fw-bold d-block mb-0.5 opacity-60" style={{ fontSize: '10.5px', letterSpacing: '0.5px', color: 'orange' }}>
                               DOANH THU PHÂN HỆ XE MÁY
                       </span>
                                    <h3 className="fw-extrabold my-0 lh-1 text-white fs-3" style={{ letterSpacing: '-0.5px' }}>
                                        {Math.round(motoRevenue).toLocaleString('vi-VN')}đ
                                    </h3>
                                    <small className="opacity-40 d-block mt-1" style={{ fontSize: '10px' }}>Khối Tầng 2</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Khu vực Biểu đồ và Bảng */}
                    <div className="row g-4">
                        {/* BẢNG SAO KÊ NHẬT KÝ */}
                        <div className="col-xl-8">
                            <div className="card shadow-sm border p-4 bg-white rounded-3 h-100" style={{ borderColor: '#E2E8F0' }}>

                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                                    <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '16px' }}>
                                        <i className="fa-solid fa-list-check me-2 text-secondary"></i>Nhật ký sao kê hóa đơn
                                    </h5>

                                    <div className="d-flex flex-wrap align-items-center gap-2">
                                        <select
                                            className="form-select filter-select shadow-sm w-auto"
                                            value={filterVehicleType}
                                            onChange={(e) => setFilterVehicleType(e.target.value)}
                                        >
                                            <option value="ALL">🚙 Tất cả xe</option>
                                            <option value="CAR">🚗 Chỉ Ô tô</option>
                                            <option value="MOTO">🏍️ Chỉ Xe máy</option>
                                        </select>

                                        <select
                                            className="form-select filter-select shadow-sm w-auto"
                                            value={sortOrder}
                                            onChange={(e) => setSortOrder(e.target.value)}
                                        >
                                            <option value="NEWEST">⏳ Mới nhất trước</option>
                                            <option value="OLDEST">⌛ Cũ nhất trước</option>
                                        </select>

                                        {/* Nút bấm Xuất Excel Mở Modal Xem Trước */}
                                        <button
                                            className="btn btn-sm btn-outline-dark fw-bold px-3 py-2 rounded-2 d-inline-flex align-items-center justify-content-center"
                                            style={{ fontSize: '12px', border: '1px solid #E2E8F0', height: '36px', gap: '8px' }}
                                            onClick={() => setShowPreviewModal(true)}
                                        >
                                            <i className="fa-solid fa-file-excel text-green-custom fs-6"></i>
                                            <span>Xuất Excel</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0 text-center w-100" style={{ fontSize: '13.5px' }}>
                                        <thead className="table-light text-uppercase text-secondary" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>
                                        <tr>
                                            <th className="py-2.5">Mã lượt</th>
                                            <th className="text-start">Biển số xe</th>
                                            <th>Loại xe</th>
                                            <th>Thời gian vào</th>
                                            <th>Thời gian ra</th>
                                            <th>Trạng thái</th>
                                            <th>Ngoại lệ</th>
                                            <th className="text-end pe-3">Thành tiền</th>
                                        </tr>
                                        </thead>
                                        <tbody style={{ fontWeight: 500 }}>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="8" className="text-center text-muted py-4">Đang xử lý dữ liệu báo cáo...</td>
                                            </tr>
                                        ) : processedSessions.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="text-center text-muted py-4">Không tìm thấy bản ghi phiên xe nào phù hợp.</td>
                                            </tr>
                                        ) : processedSessions.map((ses, index) => (
                                            <tr key={index} style={{ height: '52px' }}>
                                                <td className="text-muted">#{ses.sessionId}</td>
                                                <td className="fw-bold text-dark text-start">{ses.licensePlate}</td>
                                                <td>
                                                    <span className={`badge px-2 py-1.5 rounded-2 fw-bold ${ses.vehicleTypeId === 2 ? 'bg-blue-soft text-blue-custom' : 'bg-amber-soft text-amber-custom'}`} style={{ minWidth: '70px', fontSize: '11px' }}>
                                                        {ses.vehicleTypeId === 2 ? 'Ô tô' : 'Xe máy'}
                                                    </span>
                                                </td>
                                                <td className="text-muted" style={{ fontSize: '12.5px' }}>
                                                    {ses.checkInTime ? ses.checkInTime.replace('T', ' ').substring(0, 16) : '-'}
                                                </td>
                                                <td className="text-muted" style={{ fontSize: '12.5px' }}>
                                                    {ses.checkOutTime ? ses.checkOutTime.replace('T', ' ').substring(0, 16) : '-'}
                                                </td>
                                                <td>
                                                    <span className={`badge bg-opacity-10 px-2 py-1.5 rounded-2 fw-bold ${ses.sessionStatus?.toUpperCase() === 'ACTIVE' ? 'bg-amber-soft text-amber-custom' : 'bg-green-soft text-green-custom'}`} style={{ fontSize: '11px' }}>
                                                        {ses.sessionStatus?.toUpperCase() === 'ACTIVE' ? 'Trong phiên' : 'Xong phiên'}
                                                    </span>
                                                </td>
                                                <td className={`fw-bold ${ses.exceptionType?.toUpperCase() !== 'NONE' && ses.exceptionType ? 'text-red-custom' : 'text-muted'}`}>
                                                    {!ses.exceptionType || ses.exceptionType?.toUpperCase() === 'NONE' || ses.exceptionType?.toUpperCase() === 'NULL' ? '-' : ses.exceptionType}
                                                </td>

                                                {ses.sessionStatus?.toUpperCase() === 'ACTIVE' ? (
                                                    <td className="text-end text-center">-</td>
                                                ) : (
                                                    <SessionAmount
                                                        sessionId={ses.sessionId}
                                                        fallbackAmount={ses.amount || ses.totalPayment || 0}
                                                    />
                                                )}
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* BIỂU ĐỒ TRÒN */}
                        <div className="col-xl-4">
                            <div className="card shadow-sm border p-4 text-center bg-white rounded-3 d-flex flex-column" style={{ minHeight: '420px', borderColor: '#E2E8F0' }}>
                                <h5 className="fw-bold text-dark text-start mb-4" style={{ fontSize: '16px' }}>
                                    <i className="fa-solid fa-chart-pie me-2 text-secondary"></i>Cơ cấu dòng tiền trong ngày
                                </h5>
                                <div style={{ height: '250px', width: '100%' }} className="my-auto">
                                    <Doughnut data={pieData} options={pieOptions} />
                                </div>
                                <div className="text-secondary mt-4 mb-0 text-start border-top pt-3 fw-medium" style={{ lineHeight: '1.6', fontSize: '13.5px', borderColor: '#E2E8F0' }}>
                                    <span dangerouslySetInnerHTML={{ __html: conclusion }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PHẦN FEEDBACK */}
                    <div className="card shadow-sm border p-4 bg-white rounded-3 mt-4" style={{ borderColor: '#E2E8F0' }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '16px' }}>
                                <i className="fa-solid fa-comments me-2 text-primary"></i>Phản hồi từ khách hàng
                            </h5>
                            <span className="badge bg-blue-soft text-blue-custom px-3 py-1.5 rounded-2 fw-bold" style={{ fontSize: '12px' }}>{managerFeedbacks.length} feedback</span>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0 text-center" style={{ fontSize: '13.5px' }}>
                                <thead className="table-light text-uppercase text-secondary" style={{ fontSize: '11px', fontWeight: 700 }}>
                                <tr>
                                    <th style={{ width: '80px' }}>Mã FB</th>
                                    <th>Nguồn gửi</th>
                                    <th>Phân mục</th>
                                    <th>Nội dung chi tiết</th>
                                    <th>Trạng thái</th>
                                    <th className="text-end pe-3">Thời gian nhận</th>
                                </tr>
                                </thead>
                                <tbody style={{ fontWeight: 500 }}>
                                {managerFeedbacks.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center text-muted py-4">Chưa ghi nhận phản hồi đóng góp nào từ người dùng.</td>
                                    </tr>
                                )}
                                {managerFeedbacks.map((feedback) => (
                                    <tr key={feedback.feedbackId} style={{ height: '50px' }}>
                                        <td className="fw-bold text-secondary">#{feedback.feedbackId}</td>
                                        <td className="text-dark">{feedback.userId ? `User #${feedback.userId}` : feedback.guestPhone || 'Khách vãng lai'}</td>
                                        <td><span className="badge bg-slate-soft text-slate-custom px-2 py-1.5 rounded-2 fw-semibold">{feedback.category}</span></td>
                                        <td className="text-muted text-start" style={{ maxWidth: '420px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{feedback.description}</td>
                                        <td><span className="badge bg-amber-soft text-amber-custom px-2 py-1.5 rounded-2 fw-bold">{feedback.status}</span></td>
                                        <td className="text-muted text-end pe-3" style={{ fontSize: '12.5px' }}>{feedback.createdAt ? feedback.createdAt.replace('T', ' ').substring(0, 16) : '--'}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>

            {/* 🌟 MODAL XEM TRƯỚC BẢNG EXCEL TRƯỚC KHI TẢI DÙNG CẤU TRÚC PHỦ LỚP BOOTSTRAP 🌟 */}
            {showPreviewModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-xl modal-dialog-scrollable modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-3">
                            <div className="modal-header bg-dark text-white p-3">
                                <h5 className="modal-title fw-bold fs-6">
                                    <i className="fa-solid fa-file-excel text-green-custom me-2"></i>
                                    Xem Trước Cấu Trúc Bảng Xuất Excel ({processedSessions.length} bản ghi)
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={() => setShowPreviewModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body p-4" style={{ backgroundColor: '#F8FAFC' }}>
                                <h3 className="text-uppercase text-center highlight-text" style={{color: 'red', fontSize: '30px'}}>Nhật ký sao kê hóa đơn của các phiên xe</h3>
                                <div className="table-responsive bg-white rounded-3 border p-2">
                                    <table className="table table-bordered table-striped align-middle mb-0 text-center" style={{ fontSize: '13px' }}>
                                        <thead className="table-dark">
                                        <tr>
                                            <th>STT</th>
                                            <th>Mã lượt</th>
                                            <th>Biển số xe</th>
                                            <th>Loại xe</th>
                                            <th>Thời gian vào</th>
                                            <th>Thời gian ra</th>
                                            <th>Trạng thái</th>
                                            <th>Ngoại lệ</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {processedSessions.map((ses, idx) => (
                                            <tr key={idx}>
                                                <td>{idx + 1}</td>
                                                <td>#{ses.sessionId}</td>
                                                <td className="fw-bold">{ses.licensePlate || 'N/A'}</td>
                                                <td>{ses.vehicleTypeId === 2 ? 'Xe máy' : 'Ô tô'}</td>
                                                <td>{ses.checkInTime ? ses.checkInTime.replace('T', ' ').substring(0, 16) : '-'}</td>
                                                <td>{ses.checkOutTime ? ses.checkOutTime.replace('T', ' ').substring(0, 16) : '-'}</td>
                                                <td>{ses.sessionStatus?.toUpperCase() === 'ACTIVE' ? 'Trong phiên' : 'Xong phiên'}</td>
                                                <td>{(!ses.exceptionType || ses.exceptionType?.toUpperCase() === 'NONE' || ses.exceptionType?.toUpperCase() === 'NULL') ? '-' : ses.exceptionType}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="modal-footer bg-light p-3">
                                <button
                                    type="button"
                                    className="btn btn-success bg-green-custom fw-bold px-4 py-2 fs-6 shadow-sm"
                                    onClick={handleDownloadExcel}
                                >
                                    <i className="fa-solid fa-download me-2"></i>Tải File Excel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary fw-bold px-3 py-2 fs-6"
                                    onClick={() => setShowPreviewModal(false)}
                                >
                                    <i className="fa-brands fa-x-twitter"></i> Hủy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default ManagerReports;
