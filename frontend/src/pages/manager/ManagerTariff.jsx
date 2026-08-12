// src/pages/manager/ManagerTariff.jsx
import { useState, useEffect } from 'react';
import api from '../../config/Api'; // Sử dụng instance api tập trung từ V2
import ManagerSidebar from '../../components/ManagerSidebar';
import '../../assets/css/managerStyle.css';

function ManagerTariff() {
    // --- 1. TẦNG KHỞI TẠO STATE ---
    const [tariffs, setTariffs] = useState([]);
    const [, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        vehicleTypeId: 'select',
        basePrice: '',
        hourlyRate: ''
    });

    // --- 2. TẦNG GỌI API LẤY DỮ LIỆU BIỂU PHÍ THẬT (Hợp nhất 3 loại xe) ---
    const fetchTariffsData = () => {
        setLoading(true);
        Promise.all([
            api.get('/price-policies/vehicle-type/1'),
            api.get('/price-policies/vehicle-type/2')
        ])
            .then((results) => {
                const dataList = results.map(r => r.data).filter(Boolean);
                setTariffs(dataList);
                setLoading(false);
            })
            .catch(error => {
                console.error("Lỗi khi kéo dữ liệu biểu phí từ Back-end:", error);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchTariffsData();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- 3. HÀM GỬI CẬP NHẬT BIỂU PHÍ (Bảo toàn dữ liệu cũ chống bug mất data) ---
    const handleUpdateTariff = (e) => {
        e.preventDefault();
        if (formData.vehicleTypeId === 'select' || !formData.basePrice || !formData.hourlyRate) {
            alert("Vui lòng điền đầy đủ thông tin biểu phí!");
            return;
        }

        // Tìm chính sách hiện tại để giữ lại thông tin phạt mất vé & phí quá giờ
        const currentPolicy = tariffs.find(t => t.vehicleTypeId === parseInt(formData.vehicleTypeId));

        const payload = {
            vehicleTypeId: parseInt(formData.vehicleTypeId),
            basePrice: parseFloat(formData.basePrice),
            hourlyRate: parseFloat(formData.hourlyRate),
            overtimeRate: currentPolicy?.overtimeRate ?? null,
            lostTicketPenalty: currentPolicy?.lostTicketPenalty ?? null,
            effectiveDate: new Date().toISOString().split('T')[0]
        };

        api.post('/price-policies/update', payload)
            .then(response => {
                if (response.data === true) {
                    alert(`Đã áp dụng định mức biểu phí mới thành công dưới Cơ sở dữ liệu!`);
                    fetchTariffsData();
                    setFormData({ vehicleTypeId: 'select', basePrice: '', hourlyRate: '' });
                } else {
                    alert("Thông số chính sách giá bị trùng với dữ liệu cũ hiện hành. Cập nhật thất bại!");
                }
            })
            .catch(error => {
                console.error("Lỗi khi thực thi cập nhật biểu phí:", error);
                alert("Không thể kết nối đến máy chủ Spring Boot!");
            });
    };

    return (
        <div className="d-flex" style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>

            {/* Màu phẳng hiện đại theo phong cách V2 (Bổ sung thêm màu Emerald cho Xe điện) */}
            <style>{`
                .text-blue-custom { color: #3B82F6 !important; }
                .bg-blue-soft { background-color: rgba(59, 130, 246, 0.08) !important; }
                
                .text-amber-custom { color: #F59E0B !important; }
                .bg-amber-soft { background-color: rgba(245, 158, 11, 0.08) !important; }

                .text-emerald-custom { color: #10B981 !important; }
                .bg-emerald-soft { background-color: rgba(16, 185, 129, 0.08) !important; }

                .text-red-custom { color: #EF4444 !important; }
                .bg-red-soft { background-color: rgba(239, 68, 68, 0.08) !important; }
                
                .text-slate-custom { color: #64748B !important; }
                .bg-slate-light { background-color: #F8FAFC !important; }
            `}</style>

            <ManagerSidebar />

            {/* Nội dung chính dịch lề 240px chống đè layout */}
            <div className="main-content flex-grow-1" style={{ minWidth: 0, padding: '24px 32px', marginLeft: '240px' }}>
                <div className="container-fluid px-0">

                    {/* Header */}
                    {/* 🌟 BANNER ĐỈNH CAO: Đồng bộ hệ Cyber-Tech Header Banner */}
                    <div className="p-4 mb-4 text-white d-flex justify-content-between align-items-center position-relative shadow-sm text-start"
                         style={{
                             background: 'linear-gradient(135deg, #0B1528 0%, #1E2E4A 100%)',
                             borderRadius: '16px',
                             minHeight: '140px'
                         }}>
                        <div>
                    <span className="fw-bold text-uppercase opacity-70" style={{ fontSize: '11px', letterSpacing: '1.5px', color: '#3B82F6' }}>
                       <i className="fa-solid fa-gears me-1.5" /> Rate Matrix & Tariff Controller
                    </span>
                            <h2 className="fw-bold mt-1 mb-2" style={{ fontSize: '26px', letterSpacing: '-0.5px' }}>Cấu Hình Bảng Giá & Chính Sách Phí</h2>
                            <p className="mb-0 opacity-70" style={{ fontSize: '13.5px' }}>Thiết lập định mức thu phí gửi xe lũy tiến và quy định thời hạn đặt trước chỗ đỗ toàn hệ thống.</p>
                        </div>

                        {/* Hộp trạng thái đồng bộ */}
                        <div className="d-flex align-items-center p-2.5 px-3 rounded-3 d-none d-sm-flex"
                             style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            <div className="bg-success rounded-circle me-2.5" style={{ width: '10px', height: '10px', boxShadow: '0 0 8px #10B981' }} />
                        </div>
                    </div>

                    <div className="row g-4">

                        {/* Bảng Chi Tiết Biểu Phí Thực Tế */}
                        <div className="col-xl-8">
                            <div className="card shadow-sm border p-4 rounded-3 bg-white h-100" style={{ borderColor: '#E2E8F0' }}>
                                <h5 className="fw-bold text-dark mb-4" style={{ fontSize: '16px' }}><i className="fa-solid fa-receipt text-blue-custom me-2"></i>Bảng định mức chi phí hiện hành toàn bãi</h5>
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0 w-100 text-center" style={{ fontSize: '14px' }}>
                                        <thead className="table-light text-uppercase text-secondary" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>
                                            <tr>
                                                <th className="py-3 text-start ps-3">Loại Phương Tiện</th>
                                                <th>Phí Cơ Bản (2h đầu)</th>
                                                <th>Phí Lũy Tiến (Mỗi giờ tiếp)</th>
                                                <th>Giới Hạn Giữ Chỗ</th>
                                                <th className="text-end pe-3">Cập Nhật Lần Cuối</th>
                                            </tr>
                                        </thead>
                                        <tbody style={{ fontWeight: 500 }}>
                                            {tariffs.map((item) => {
                                                // FIX BUG: Đồng bộ nhãn hiển thị khớp hoàn toàn với ID thực tế
                                                const isEv = item.vehicleTypeId === 3;
                                                const isCar = item.vehicleTypeId === 2;
                                                const isBike = item.vehicleTypeId === 1;

                                                const vehicleLabel = isBike ? 'Xe máy' : isCar ? 'Ô tô 4-7 chỗ' : isEv ? 'Xe điện' : `Loại ${item.vehicleTypeId}`;
                                                const badgeClass = isBike ? 'bg-amber-soft text-amber-custom' : isCar ? 'bg-blue-soft text-blue-custom' : 'bg-emerald-soft text-emerald-custom';
                                                const holdTime = isBike ? '30 phút' : '45 phút';

                                                return (
                                                    <tr key={item.vehicleTypeId} style={{ height: '55px' }}>
                                                        <td className="text-start ps-3">
                                                            <span className={`badge px-3 py-2 fw-bold ${badgeClass}`} style={{ minWidth: '95px', borderRadius: '6px' }}>
                                                                {vehicleLabel}
                                                            </span>
                                                        </td>
                                                        <td className="fw-bold text-dark fs-6">{Number(item.basePrice).toLocaleString()}đ</td>
                                                        <td className="text-red-custom fw-bold fs-6">+ {Number(item.hourlyRate).toLocaleString()}đ/h</td>
                                                        <td className="text-muted fw-semibold" style={{ fontSize: '13.5px' }}>{holdTime}</td>
                                                        <td className="text-muted text-end pe-3" style={{ fontSize: '12.5px' }}>{item.effectiveDate}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Form Chỉnh Sửa Biểu Phí */}
                        <div className="col-xl-4">
                            <div className="card shadow-sm border p-4 bg-white rounded-3 d-flex flex-column" style={{ minHeight: '380px', borderColor: '#E2E8F0' }}>
                                <h5 className="fw-bold text-dark mb-4" style={{ fontSize: '16px' }}><i className="fa-solid fa-pen-to-square text-red-custom me-2"></i>Chỉnh sửa biểu phí</h5>

                                <form onSubmit={handleUpdateTariff} className="d-flex flex-column flex-grow-1">
                                    <div className="mb-4">
                                        <label className="form-label fw-bold text-slate-custom mb-2" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>LOẠI XE ÁP DỤNG</label>
                                        <select className="form-select py-2 fs-6 shadow-sm text-dark" style={{ borderColor: '#E2E8F0', height: '42px' }} name="vehicleTypeId" value={formData.vehicleTypeId} onChange={handleInputChange}>
                                            <option value="select">-- Chọn loại xe áp dụng</option>
                                            {/* FIX BUG: Đồng bộ chính xác ID: 1-Xe máy, 2-Ô tô, 3-Xe điện giống DB */}
                                        
                                            <option value="2">Ô tô 4-7 chỗ (Khu vực Tầng 1)</option>
                                            <option value="1">Xe máy (Khu vực Tầng 2)</option>
                                        </select>
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label fw-bold text-slate-custom mb-2" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>PHÍ CỐ ĐỊNH (2 GIỜ ĐẦU)</label>
                                        <div className="input-group shadow-sm rounded-3 overflow-hidden">
                                            <input type="number" className="form-control py-2 fw-bold text-dark fs-6" style={{ borderColor: '#E2E8F0', height: '42px' }} name="basePrice" placeholder="Nhập số tiền định mức..." value={formData.basePrice} onChange={handleInputChange} />
                                            <span className="input-group-text bg-slate-light fw-bold text-secondary px-3" style={{ borderColor: '#E2E8F0', fontSize: '13px' }}>VND</span>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label fw-bold text-slate-custom mb-2" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>PHÍ LŨY TIẾN (MỖI GIỜ TIẾP)</label>
                                        <div className="input-group shadow-sm rounded-3 overflow-hidden">
                                            <input type="number" className="form-control py-2 fw-bold text-red-custom fs-6" style={{ borderColor: '#E2E8F0', height: '42px' }} name="hourlyRate" placeholder="Nhập số tiền lũy tiến..." value={formData.hourlyRate} onChange={handleInputChange} />
                                            <span className="input-group-text bg-slate-light fw-bold text-secondary px-3" style={{ borderColor: '#E2E8F0', fontSize: '13px' }}>VND / h</span>
                                        </div>
                                    </div>

                                    <button type="submit" className="btn w-100 py-2.5 fw-bold text-uppercase shadow-sm text-white mt-auto fs-6" style={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '8px' }}>
                                        Áp Dụng Định Mức Mới
                                    </button>
                                </form>

                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default ManagerTariff;
