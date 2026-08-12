// src/pages/manager/ManagerFloors.jsx
import { useState, useEffect } from 'react';
import api from '../../config/Api';
import ManagerSidebar from '../../components/ManagerSidebar';
import '../../assets/css/managerStyle.css';

const SLOT_CODE_PATTERN = /^(XM|OT)-.+$/i;

function ManagerFloors() {
    // --- 1. TẦNG KHỞI TẠO STATE ---
    const [floor1Data, setFloor1Data] = useState([]);
    const [floor2Data, setFloor2Data] = useState([]);
    const [activeFloor, setActiveFloor] = useState('1');
    const [, setLoading] = useState(true);

    const [selectedSlot, setSelectedSlot] = useState('select');
    const [selectedStatus, setSelectedStatus] = useState('select');
    const [currentVehiclePlate, setCurrentVehiclePlate] = useState('');

    // State phục vụ tính năng Thêm & Sửa tên slot mới bổ sung
    const [newSlotCode, setNewSlotCode] = useState('');
    const [newSlotStatus, setNewSlotStatus] = useState('Available');
    const [editSlotCode, setEditSlotCode] = useState('');

    // --- 2. TẦNG GỌI API LẤY DỮ LIỆU THỜI GIAN THỰC ---
    const fetchFloorData = () => {
        setLoading(true);
        Promise.all([
            api.get('/slots/floor/1'),
            api.get('/slots/floor/2')
        ])
            .then(([floor1Res, floor2Res]) => {
                setFloor1Data(floor1Res.data || []);
                setFloor2Data(floor2Res.data || []);
                setLoading(false);
            })
            .catch(error => {
                console.error("Lỗi đồng bộ sơ đồ mặt bằng từ Backend:", error);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchFloorData();
    }, []);

    const currentData = activeFloor === '1' ? floor1Data : floor2Data;

    const stats = {
        available: currentData.filter(s => s.status?.toLowerCase() === 'available').length,
        occupied: currentData.filter(s => s.status?.toLowerCase() === 'occupied').length,
        booked: currentData.filter(s => s.status?.toLowerCase() === 'booked').length,
        maintenance: currentData.filter(s => s.status?.toLowerCase() === 'maintenance').length,
    };

    // Hàm bổ trợ khi người dùng click trực tiếp vào ô đỗ trên sơ đồ
    const handleSlotClick = (slot) => {
        setSelectedSlot(slot.slotId.toString());
        setSelectedStatus(slot.status);
        setCurrentVehiclePlate(slot.currentVehiclePlate || '');
        setEditSlotCode(slot.slotCode);
    };

    // --- 3. CÁC HÀM XỬ LÝ TÁC VỤ API VỚI SPRING BOOT ---

    // ── CẬP NHẬT TRẠNG THÁI SLOT
    const handleUpdateSlot = (e) => {
        e.preventDefault();
        if (selectedSlot === 'select' || selectedStatus === 'select') {
            alert("Vui lòng chọn Vị trí và Trạng thái cần cập nhật!");
            return;
        }

        const slotTarget = currentData.find(s => s.slotId === parseInt(selectedSlot));
        if (!slotTarget) return;

        if (selectedStatus === 'Occupied' && !currentVehiclePlate.trim()) {
            alert('Vui lòng nhập biển số xe khi chuyển slot sang trạng thái Có xe.');
            return;
        }

        api.put('/slots/update-status', null, {
            params: {
                slotId: slotTarget.slotId,
                status: selectedStatus,
                currentVehiclePlate: selectedStatus === 'Occupied' ? currentVehiclePlate.trim().toUpperCase() : undefined,
            },
        })
            .then(response => {
                if (response.data === true) {
                    alert(`Đã cập nhật Slot ${slotTarget.slotCode} thành công dưới Cơ sở dữ liệu!`);
                    fetchFloorData();
                    setSelectedSlot('select');
                    setSelectedStatus('select');
                    setCurrentVehiclePlate('');
                    setEditSlotCode('');
                } else {
                    alert("Cập nhật thất bại! Vui lòng kiểm tra lại logic hệ thống.");
                }
            })
            .catch(error => {
                console.error("Lỗi khi thực thi cập nhật trạng thái slot:", error);
                alert("Không thể kết nối đến máy chủ Spring Boot!");
            });
    };

    // ── THÊM SLOT MỚI
    const handleCreateSlot = (e) => {
        e.preventDefault();
        if (!newSlotCode.trim()) {
            alert("Vui lòng nhập tên/mã vị trí ô đỗ mới!");
            return;
        }

        if (!SLOT_CODE_PATTERN.test(newSlotCode.trim())) {
            alert('Tên slot phải theo định dạng XM-... hoặc OT-....');
            return;
        }

        api.post(`/slots/create?slotCode=${newSlotCode.trim()}&floorId=${activeFloor}&status=${newSlotStatus}`)
            .then(() => {
                alert(`Khởi tạo vị trí đỗ [${newSlotCode.trim()}] thành công!`);
                fetchFloorData();
                setNewSlotCode('');
            })
            .catch(error => {
                console.error("Lỗi thêm ô đỗ mới:", error);
                const errMsg = error.response?.data?.error || error.response?.data?.message || "Không thể tạo slot mới! Vui lòng kiểm tra kết nối server.";
                alert(errMsg);
            });
    };

    // ── ĐỔI TÊN / MÃ SLOT
    const handleRenameSlot = (e) => {
        e.preventDefault();
        if (selectedSlot === 'select' || !editSlotCode.trim()) {
            alert("Vui lòng chọn một slot và nhập tên mới cần đổi!");
            return;
        }

        if (!SLOT_CODE_PATTERN.test(editSlotCode.trim())) {
            alert('Tên slot phải theo định dạng XM-... hoặc OT-....');
            return;
        }

        api.put(`/slots/rename?slotId=${selectedSlot}&newSlotCode=${editSlotCode.trim()}`)
            .then(() => {
                alert("Đổi tên mã ô đỗ thành công!");
                fetchFloorData();
            })
            .catch(error => {
                console.error("Lỗi đổi tên slot:", error);
                const errMsg = error.response?.data?.error || error.response?.data?.message || "Thay đổi định danh mã ô đỗ thất bại!";
                alert(errMsg);
            });
    };

    // ── XÓA BỎ SLOT KHỎI HỆ THỐNG
    const handleDeleteSlot = () => {
        if (selectedSlot === 'select') return alert("Vui lòng chọn ô đỗ cần xóa trên sơ đồ!");

        const slotTarget = currentData.find(s => s.slotId === parseInt(selectedSlot));
        if (!slotTarget) return;

        if (!window.confirm(`Bạn có chắc chắn muốn XÓA VĨNH VIỄN vị trí [${slotTarget.slotCode}] không?\nHành động này không thể hoàn tác.`)) return;

        api.delete(`/slots/delete/${selectedSlot}`)
            .then(() => {
                alert(`Đã loại bỏ vị trí đỗ ${slotTarget.slotCode} khỏi cơ sở dữ liệu!`);
                fetchFloorData();
                setSelectedSlot('select');
                setSelectedStatus('select');
                setEditSlotCode('');
            })
            .catch(error => {
                console.error("Lỗi khi thực hiện xóa vị trí đỗ:", error);
                const errMsg = error.response?.data?.error || error.response?.data?.message || "Xóa thất bại! Không thể xóa slot đang được sử dụng.";
                alert(errMsg);
            });
    };

    // --- 4. HÀM TRỢ GIÚP ĐỔI STYLE THEO TRẠNG THÁI ---
    const getSlotStyle = (status) => {
        switch(status?.toLowerCase()) {
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

    return (
        <div className="d-flex" style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>

            {/* Inject CSS custom hệ thống màu Soft-Tech phẳng và mịn */}
            <style>{`
                .text-green-custom { color: #10B981 !important; }
                .text-blue-custom { color: #3B82F6 !important; }
                .text-amber-custom { color: #F59E0B !important; }
                .text-red-custom { color: #EF4444 !important; }
                .text-slate-custom { color: #64748B !important; }

                /* Định dạng các ô vuông hiển thị vị trí đỗ xe */
                .slot-available { background-color: #E6F4EA !important; color: #137333 !important; border: 1px solid #CEEAD6 !important; }
                .slot-occupied { background-color: #FCE8E6 !important; color: #C5221F !important; border: 1px solid #FAD2CF !important; }
                .slot-booked { background-color: #FEF7E0 !important; color: #B06000 !important; border: 1px solid #FEEFC3 !important; }
                .slot-maintenance { background-color: #F1F3F4 !important; color: #5F6368 !important; border: 1px solid #E8EAED !important; }

                /* Hiệu ứng hover ô đỗ phản hồi nhanh */
                .slot-item-box:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
                }

                /* Nút chọn tầng phẳng hiện đại */
                .floor-btn-group .btn {
                    border: 1px solid #E2E8F0;
                    color: #475569;
                    background-color: #FFFFFF;
                    transition: all 0.2s ease;
                }
                .floor-btn-group .btn.btn-active-custom {
                    background-color: #0F172A !important;
                    color: #FFFFFF !important;
                    border-color: #0F172A !important;
                }
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
                      <i className="fa-solid fa-layer-group me-1.5" /> Real-time Slot & Space Control
                   </span>
                            <h2 className="fw-bold mt-1 mb-2" style={{ fontSize: '26px', letterSpacing: '-0.5px' }}>Sơ Đồ Vị Trí & Trạng Thái Slot Đỗ Xe</h2>
                            <p className="mb-0 opacity-70" style={{ fontSize: '13.5px' }}>Theo dõi, điều phối trực quan và thiết lập bảo trì các vị trí ô đỗ xe theo thời gian thực.</p>
                        </div>

                        {/* Hộp trạng thái đồng bộ */}
                        <div className="d-flex align-items-center p-2.5 px-3 rounded-3 d-none d-sm-flex"
                             style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            <div className="bg-success rounded-circle me-2.5" style={{ width: '10px', height: '10px', boxShadow: '0 0 8px #10B981' }} />
                        </div>
                    </div>

                    {/* Thanh chọn tầng và Thống kê */}
                    <div className="card border p-3 mb-4 rounded-3 bg-white shadow-sm" style={{ borderColor: '#E2E8F0' }}>
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">

                            {/* Điều hướng chuyển đổi Tầng */}
                            <div className="btn-group floor-btn-group gap-2">
                                <button
                                    className={`btn fw-bold px-4 py-2 rounded-2 ${activeFloor === '1' ? 'btn-active-custom' : ''}`}
                                    onClick={() => { setActiveFloor('1'); setSelectedSlot('select'); setEditSlotCode(''); }}
                                    style={{ fontSize: '12.5px' }}
                                >
                                    TẦNG 1 (Khu Vực Ô Tô)
                                </button>
                                <button
                                    className={`btn fw-bold px-4 py-2 rounded-2 ${activeFloor === '2' ? 'btn-active-custom' : ''}`}
                                    onClick={() => { setActiveFloor('2'); setSelectedSlot('select'); setEditSlotCode(''); }}
                                    style={{ fontSize: '12.5px' }}
                                >
                                    TẦNG 2 (Khu Vực Xe Máy)
                                </button>
                            </div>

                            {/* Thống kê động dạng chấm bi mờ */}
                            <div className="d-flex flex-wrap gap-4 fw-bold text-secondary" style={{ fontSize: '12.5px', fontWeight: 600 }}>
                                <span><i className="fa-solid fa-circle text-green-custom me-1"></i> Trống ({stats.available})</span>
                                <span><i className="fa-solid fa-circle text-red-custom me-1"></i> Có xe ({stats.occupied})</span>
                                <span><i className="fa-solid fa-circle text-amber-custom me-1"></i> Đặt trước ({stats.booked})</span>
                                <span><i className="fa-solid fa-circle text-muted me-1"></i> Bảo trì ({stats.maintenance})</span>
                            </div>

                        </div>
                    </div>

                    <div className="row g-4">
                        {/* CỘT TRÁI: SƠ ĐỒ MẶT BẰNG DỮ LIỆU THẬT */}
                        <div className="col-xl-8">
                            <div className="card shadow-sm border p-4 rounded-3 bg-white" style={{ borderColor: '#E2E8F0' }}>
                                <h5 className="fw-bold text-dark mb-4" style={{ fontSize: '16px' }}><i className="fa-solid fa-map-location-dot text-primary me-2"></i>Sơ đồ mặt bằng bãi đỗ ({activeFloor === '1' ? 'Tầng 1' : 'Tầng 2'})</h5>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))', gap: '12px' }}>
                                    {currentData.map(slot => (
                                        <div
                                            key={slot.slotId}
                                            className={`p-2.5 text-center rounded-3 shadow-sm border fw-bold slot-item-box ${getSlotStyle(slot.status)}`}
                                            style={{ cursor: 'pointer', transition: 'all 0.2s', minHeight: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                                            onClick={() => handleSlotClick(slot)}
                                        >
                                            <div className="mb-0.5" style={{ fontSize: '13.5px' }}>{slot.slotCode}</div>
                                            {slot.currentVehiclePlate && (
                                                <div className="text-truncate mx-auto" style={{ fontSize: '10.5px', fontWeight: 700, maxWidth: '100%' }}>
                                                    {slot.currentVehiclePlate}
                                                </div>
                                            )}
                                            <div className="opacity-85 text-truncate mx-auto" style={{ fontSize: '10px', fontWeight: 500, maxWidth: '100%' }}>
                                                {getSlotLabel(slot)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                            </div>
                        </div>

                        {/* CỘT PHẢI: FORM ĐIỀU KHIỂN ĐA NHIỆM (CẬP NHẬT / SỬA / XÓA / THÊM) */}
                        <div className="col-xl-4 d-flex flex-column gap-4">

                            {/* KHỐI 1: ĐIỀU CHỈNH & SỬA TÊN / XÓA Ô ĐỖ ĐANG CHỌN */}
                            <div className="card shadow-sm border p-4 bg-white rounded-3" style={{ borderColor: '#E2E8F0' }}>
                                <h5 className="fw-bold text-dark mb-4" style={{ fontSize: '16px' }}>
                                    <i className="fa-solid fa-sliders text-red-custom me-2"></i>Quản lý ô đỗ đã chọn
                                </h5>

                                <div className="mb-3">
                                    <label className="form-label fw-bold text-slate-custom mb-1" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>VỊ TRÍ ĐANG CHỌN</label>
                                    <select className="form-select fw-bold py-2 fs-6 shadow-sm text-dark" style={{ borderColor: '#E2E8F0', height: '42px' }} value={selectedSlot} onChange={(e) => {
                                        const slot = currentData.find(s => s.slotId === parseInt(e.target.value));
                                        if (slot) handleSlotClick(slot);
                                        else { setSelectedSlot('select'); setEditSlotCode(''); }
                                    }}>
                                        <option value="select">-- Chọn ô hoặc nhấn vào sơ đồ</option>
                                        {currentData.map(slot => (
                                            <option key={slot.slotId} value={slot.slotId}>{slot.slotCode} ({getSlotLabel(slot)})</option>
                                        ))}
                                    </select>
                                </div>

                                {selectedSlot !== 'select' && (
                                    <>
                                        {/* Form sửa đổi mã / tên ô đỗ */}
                                        <form onSubmit={handleRenameSlot} className="mb-3 border-top pt-3">
                                            <label className="form-label fw-bold text-slate-custom mb-1" style={{ fontSize: '11px' }}>ĐỔI TÊN / MÃ VỊ TRÍ Ô ĐỖ</label>
                                            <div className="input-group shadow-sm">
                                                <input type="text" className="form-control fw-bold" style={{ borderColor: '#E2E8F0', fontSize: '13.5px' }} value={editSlotCode} onChange={(e) => setEditSlotCode(e.target.value)} placeholder="Nhập định danh mới..." required />
                                                <button type="submit" className="btn btn-dark fw-bold" style={{ backgroundColor: '#475569', border: 'none', fontSize: '12.5px' }}>Đổi tên</button>
                                            </div>
                                        </form>

                                        {/* Form cập nhật trạng thái ô đỗ */}
                                        <form onSubmit={handleUpdateSlot} className="mb-3">
                                            <label className="form-label fw-bold text-slate-custom mb-1" style={{ fontSize: '11px' }}>CẬP NHẬT TRẠNG THÁI MỚI</label>
                                             <select className="form-select fw-bold py-2 shadow-sm text-dark mb-2" style={{ borderColor: '#E2E8F0', fontSize: '14px' }} value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                                                 <option value="select">-- Chọn trạng thái mới</option>
                                                 <option value="Available">Giải phóng (Trống)</option>
                                                 <option value="Occupied">Có xe</option>
                                                 <option value="Booked">Đặt trước</option>
                                                 <option value="Maintenance">Khóa Bảo trì</option>
                                             </select>
                                             {selectedStatus === 'Occupied' && (
                                                 <div className="mb-2">
                                                     <label className="form-label fw-bold text-slate-custom mb-1" style={{ fontSize: '11px' }}>
                                                         BIỂN SỐ XE <span className="text-danger">*</span>
                                                     </label>
                                                     <input
                                                         type="text"
                                                         className="form-control fw-bold shadow-sm text-uppercase"
                                                         style={{ borderColor: '#E2E8F0', fontSize: '14px' }}
                                                         placeholder="Ví dụ: 30K-123.45"
                                                         value={currentVehiclePlate}
                                                         onChange={(e) => setCurrentVehiclePlate(e.target.value.toUpperCase())}
                                                         maxLength={15}
                                                         required
                                                     />
                                                 </div>
                                             )}
                                             <button type="submit" className="btn btn-dark w-100 py-2 fw-bold text-uppercase shadow-sm mb-2" style={{ fontSize: '12.5px', backgroundColor: '#0F172A', border: 'none', borderRadius: '6px' }}>
                                                Cập nhật trạng thái
                                            </button>
                                        </form>

                                        {/* Nút xóa ô đỗ */}
                                        <button type="button" onClick={handleDeleteSlot} className="btn btn-outline-danger w-100 py-2 fw-bold text-uppercase shadow-sm" style={{ fontSize: '12.5px', borderRadius: '6px' }}>
                                            <i className="fa-solid fa-trash-can me-1.5"></i> Xóa ô đỗ khỏi bãi xe
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* KHỐI 2: FORM THÊM MỚI VỊ TRÍ ĐỖ XE KHỚP THEO TẦNG ĐANG CHỌN */}
                            <div className="card shadow-sm border p-4 bg-white rounded-3" style={{ borderColor: '#E2E8F0' }}>
                                <h5 className="fw-bold text-dark mb-4" style={{ fontSize: '16px' }}>
                                    <i className="fa-solid fa-square-plus text-green-custom me-2"></i>Thêm vị trí mới vào {activeFloor === '1' ? 'Tầng 1' : 'Tầng 2'}
                                </h5>
                                <form onSubmit={handleCreateSlot}>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold text-slate-custom mb-1" style={{ fontSize: '11px' }}>TÊN VỊ TRÍ / MÃ Ô ĐỖ MỚI</label>
                                        <input type="text" className="form-control fw-bold shadow-sm" style={{ borderColor: '#E2E8F0', height: '40px', fontSize: '14px' }} placeholder="Ví dụ: XM-01, OT-01..." value={newSlotCode} onChange={(e) => setNewSlotCode(e.target.value)} required />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label fw-bold text-slate-custom mb-1" style={{ fontSize: '11px' }}>TRẠNG THÁI KHỞI TẠO</label>
                                        <select className="form-select fw-bold shadow-sm" style={{ borderColor: '#E2E8F0', height: '40px', fontSize: '14px' }} value={newSlotStatus} onChange={(e) => setNewSlotStatus(e.target.value)}>
                                            <option value="Available">Trống (Available)</option>
                                            <option value="Maintenance">Bảo trì (Maintenance)</option>
                                        </select>
                                    </div>
                                    <button type="submit" className="btn btn-success bg-green-custom w-100 py-2.5 fw-bold text-uppercase shadow-sm" style={{ border: 'none', borderRadius: '8px', fontSize: '13px' }}>
                                        <i className="fa-solid fa-plus me-1.5"></i>Khởi tạo vị trí đỗ
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

export default ManagerFloors;
