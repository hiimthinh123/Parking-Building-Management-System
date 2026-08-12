import { useEffect, useMemo, useState } from 'react';
import api from '../../config/Api';
import StaffSidebar from '../../components/StaffSidebar.jsx';

const API_BASE = '/staff/monitoring';

const fallbackSessions = [
    { sessionId: 101, slotId: 1, licensePlate: '30K-123.45', vehicleTypeId: 2, checkInTime: '2026-06-28 07:30:00', checkOutTime: null, sessionStatus: 'ACTIVE' },
    { sessionId: 102, slotId: 2, licensePlate: '29C-567.89', vehicleTypeId: 2, checkInTime: '2026-06-28 08:10:00', checkOutTime: '2026-06-28 10:20:00', sessionStatus: 'COMPLETED' },
    { sessionId: 103, slotId: 4, licensePlate: '59A-111.11', vehicleTypeId: 1, checkInTime: '2026-06-28 09:15:00', checkOutTime: null, sessionStatus: 'EXCEPTION', exceptionType: 'LOST_TICKET' },
];

const fallbackSlots = [
    { slotId: 1, floorId: 1, slotCode: 'A-01', status: 'Occupied', currentVehiclePlate: '30K-123.45' },
    { slotId: 2, floorId: 1, slotCode: 'A-02', status: 'Available', currentVehiclePlate: null },
    { slotId: 3, floorId: 1, slotCode: 'A-03', status: 'Booked', currentVehiclePlate: null },
    { slotId: 4, floorId: 1, slotCode: 'A-04', status: 'Occupied', currentVehiclePlate: '59A-111.11' },
    { slotId: 5, floorId: 1, slotCode: 'A-05', status: 'Maintenance', currentVehiclePlate: null },
    { slotId: 6, floorId: 2, slotCode: 'B-01', status: 'Available', currentVehiclePlate: null },
];

const fallbackCameras = [
    { cameraCode: 'CAM-01', areaName: 'Cổng vào ô tô C1', status: 'ONLINE', streamUrl: 'rtsp://camera.local/parking/c1' },
    { cameraCode: 'CAM-02', areaName: 'Cổng ra ô tô C2', status: 'ONLINE', streamUrl: 'rtsp://camera.local/parking/c2' },
    { cameraCode: 'CAM-03', areaName: 'Tầng 1 khu A', status: 'MAINTENANCE', streamUrl: null },
];

function statusBadge(status) {
    const value = (status || '').toUpperCase();
    if (value === 'ACTIVE') return 'bg-blue-soft text-blue-custom';
    if (value === 'COMPLETED') return 'bg-green-soft text-green-custom';
    if (value === 'EXCEPTION') return 'bg-red-soft text-red-custom';
    return 'bg-slate-soft text-slate-custom';
}

const sessionStatusLabel = { ACTIVE: 'Đang trong bãi', COMPLETED: 'Đã ra bãi', PAID: 'Đã thanh toán', EXCEPTION: 'Ngoại lệ', CANCELLED: 'Đã hủy' };
const incidentTypeLabel = { LOST_TICKET: 'Mất vé', WRONG_PARKING_POSITION: 'Đỗ sai vị trí', OCCUPIED_SLOT: 'Chiếm chỗ', PAYMENT_ERROR: 'Lỗi thanh toán', CUSTOMER_REPORT: 'Phản ánh khách hàng' };
const incidentStatusLabel = { OPEN: 'Mới tạo', IN_REVIEW: 'Đang xử lý', RESOLVED: 'Đã xử lý' };
function slotClass(status) {
    const value = (status || '').toLowerCase();
    if (value === 'available') return 'slot-available';
    if (value === 'occupied') return 'slot-occupied';
    if (value === 'booked' || value === 'reserved') return 'slot-booked';
    return 'slot-maintenance';
}

function StaffDashboard() {
    const [timeStr, setTimeStr] = useState('--:--:-- - --/--/----');
    const [sessions, setSessions] = useState(fallbackSessions);
    const [slots, setSlots] = useState(fallbackSlots);
    const [openIncidentCount, setOpenIncidentCount] = useState(1);
    const [recentIncidents, setRecentIncidents] = useState([]);
    const [, setCameras] = useState(fallbackCameras);
    const [, setSelectedCamera] = useState(fallbackCameras[0]);
    const [, setLoading] = useState(false);
    const [apiNote, setApiNote] = useState('');
    const [vehicleFilter, setVehicleFilter] = useState('ALL');

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setTimeStr(`${now.toLocaleTimeString('vi-VN', { hour12: false })} - ${now.toLocaleDateString('vi-VN')}`);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const loadMonitoring = async () => {
        setLoading(true);
        try {
            const response = await api.get(API_BASE);
            setSessions(response.data.sessions || []);
            setSlots(response.data.slots || []);
            setOpenIncidentCount(response.data.openIncidentCount || 0);
            setRecentIncidents(response.data.recentIncidents || []);
            const nextCameras = response.data.cameras || [];
            setCameras(nextCameras);
            setSelectedCamera(nextCameras[0] || null);
            setApiNote('');
        } catch (error) {
            setApiNote('Đang hiển thị dữ liệu mẫu vì chưa kết nối được hệ thống.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMonitoring();
    }, []);

    const stats = useMemo(() => {
        const carSlots = slots.filter((slot) => slot.floorId === 1);
        const bikeSlots = slots.filter((slot) => slot.floorId === 2);
        return {
            carAvailable: carSlots.filter((slot) => slot.status === 'Available').length,
            carTotal: carSlots.length,
            bikeAvailable: bikeSlots.filter((slot) => slot.status === 'Available').length,
            bikeTotal: bikeSlots.length,
        };
    }, [slots]);

    const slotsByFloor = useMemo(() => ({
        1: slots.filter((slot) => slot.floorId === 1),
        2: slots.filter((slot) => slot.floorId === 2),
    }), [slots]);

    const filteredSessions = useMemo(() => sessions
        .filter((session) => vehicleFilter === 'ALL' || String(session.vehicleTypeId) === vehicleFilter)
        .sort((a, b) => new Date(b.checkInTime || 0) - new Date(a.checkInTime || 0)), [sessions, vehicleFilter]);

    return (
        <div className="d-flex" style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>

            <style>{`
                .text-green-custom { color: #10B981 !important; }
                .bg-green-soft { background-color: rgba(16, 185, 129, 0.08) !important; }
                .text-blue-custom { color: #3B82F6 !important; }
                .bg-blue-soft { background-color: rgba(59, 130, 246, 0.08) !important; }
                .text-red-custom { color: #EF4444 !important; }
                .bg-red-soft { background-color: rgba(239, 68, 68, 0.08) !important; }
                .text-slate-custom { color: #64748B !important; }
                .bg-slate-soft { background-color: rgba(100, 116, 139, 0.08) !important; }

                .slot-available { background-color: #E6F4EA !important; color: #137333 !important; border: 1px solid #CEEAD6 !important; }
                .slot-occupied { background-color: #FCE8E6 !important; color: #C5221F !important; border: 1px solid #FAD2CF !important; }
                .slot-booked { background-color: #FEF7E0 !important; color: #B06000 !important; border: 1px solid #FEEFC3 !important; }
                .slot-maintenance { background-color: #F1F3F4 !important; color: #5F6368 !important; border: 1px solid #E8EAED !important; }

                .camera-list-group .list-group-item.active {
                    background-color: #3B82F6 !important;
                    border-color: #3B82F6 !important;
                    color: #FFFFFF !important;
                }
                .camera-list-group .list-group-item.active .badge {
                    background-color: rgba(255, 255, 255, 0.25) !important;
                    color: #FFFFFF !important;
                }
            `}</style>

            <StaffSidebar />

            <div className="main-content flex-grow-1" style={{ minWidth: 0, padding: '24px 32px', marginLeft: '240px' }}>
                <div className="container-fluid px-0">

                    {/* Header — y hệt Manager */}
                    <div className="p-4 mb-4 text-white d-flex justify-content-between align-items-center position-relative shadow-sm"
                         style={{
                             background: 'linear-gradient(135deg, #0B1528 0%, #1E2E4A 100%)',
                             borderRadius: '16px',
                             minHeight: '140px'
                         }}>
                        <div>
                            <span className="fw-bold text-uppercase opacity-70" style={{ fontSize: '11px', letterSpacing: '1.5px', color: '#3B82F6' }}>
                                <i className="fa-solid fa-desktop me-1.5" /> Operations & Gate Monitoring
                            </span>
                            <h2 className="fw-bold mt-1 mb-2" style={{ fontSize: '26px', letterSpacing: '-0.5px' }}>Giám Sát Bãi Xe</h2>
                            <p className="mb-0 opacity-70" style={{ fontSize: '13.5px' }}>Theo dõi cổng ra vào, slot, CCTV và các sự cố tại quầy theo thời gian thực.</p>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                            <div className="d-none d-sm-flex align-items-center p-2 px-3 rounded-3 fw-bold"
                                 style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '13px' }}>
                                <i className="fa-regular fa-clock me-2"></i>{timeStr}
                            </div>
                        </div>
                    </div>

                    {apiNote && <div className="alert bg-blue-soft text-blue-custom border-0 shadow-sm fw-medium mb-4">{apiNote}</div>}

                    {/* 3 thẻ số liệu — y hệt cấu trúc + màu gradient của Manager */}
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3 mb-4">
                        <div className="col">
                            <div className="card p-3 border-0 shadow-sm h-100 d-flex flex-row align-items-center rounded-3 text-white"
                                 style={{ background: 'linear-gradient(135deg, #0B1528 0%, #1E2E4A 100%)', minHeight: '100px' }}>
                                <div className="bg-green-soft rounded-3 me-3 d-flex align-items-center justify-content-center" style={{ width: '46px', height: '46px' }}>
                                    <i className="fa-solid fa-car fs-4 text-green-custom"></i>
                                </div>
                                <div>
                                    <span className="fw-bold d-block mb-0.5 opacity-60" style={{ fontSize: '10.5px', letterSpacing: '0.5px', color: '#4ADE80' }}>SLOT Ô TÔ TRỐNG</span>
                                    <h3 className="fw-extrabold my-0 lh-1 text-white fs-3" style={{ letterSpacing: '-0.5px' }}>{stats.carAvailable} / {stats.carTotal}</h3>
                                    <small className="opacity-40 d-block mt-1" style={{ fontSize: '10px' }}>Hiện hành</small>
                                </div>
                            </div>
                        </div>

                        <div className="col">
                            <div className="card p-3 border-0 shadow-sm h-100 d-flex flex-row align-items-center rounded-3 text-white"
                                 style={{ background: 'linear-gradient(135deg, #0B1528 0%, #1E2E4A 100%)', minHeight: '100px' }}>
                                <div className="bg-blue-soft rounded-3 me-3 d-flex align-items-center justify-content-center" style={{ width: '46px', height: '46px' }}>
                                    <i className="fa-solid fa-motorcycle fs-4 text-blue-custom"></i>
                                </div>
                                <div>
                                    <span className="fw-bold d-block mb-0.5 opacity-60" style={{ fontSize: '10.5px', letterSpacing: '0.5px', color: '#93C5FD' }}>SLOT XE MÁY TRỐNG</span>
                                    <h3 className="fw-extrabold my-0 lh-1 text-white fs-3" style={{ letterSpacing: '-0.5px' }}>{stats.bikeAvailable} / {stats.bikeTotal}</h3>
                                    <small className="opacity-40 d-block mt-1" style={{ fontSize: '10px' }}>Hiện hành</small>
                                </div>
                            </div>
                        </div>

                        <div className="col">
                            <div className="card p-3 border-0 shadow-sm h-100 d-flex flex-row align-items-center rounded-3 text-white"
                                 style={{ background: 'linear-gradient(135deg, #0B1528 0%, #1E2E4A 100%)', minHeight: '100px' }}>
                                <div className="bg-red-soft rounded-3 me-3 d-flex align-items-center justify-content-center" style={{ width: '46px', height: '46px' }}>
                                    <i className="fa-solid fa-triangle-exclamation fs-4 text-red-custom"></i>
                                </div>
                                <div>
                                    <span className="fw-bold d-block mb-0.5 opacity-60" style={{ fontSize: '10.5px', letterSpacing: '0.5px', color: '#F87171' }}>NGOẠI LỆ CẦN XỬ LÝ</span>
                                    <h3 className="fw-extrabold my-0 lh-1 text-white fs-3" style={{ letterSpacing: '-0.5px' }}>{openIncidentCount}</h3>
                                    <small className="opacity-40 d-block mt-1" style={{ fontSize: '10px' }}>Cần xử lý</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row g-4">
                        <div className="col-xl-8">
                            <div className="card shadow-sm border p-4 mb-4 rounded-3 bg-white" style={{ borderColor: '#E2E8F0' }}>
                                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3"><h5 className="fw-bold text-dark mb-0" style={{ fontSize: '16px' }}><i className="fa-solid fa-list-check me-2 text-secondary"></i>Lịch sử điều phối cổng bãi</h5><select className="form-select form-select-sm w-auto" value={vehicleFilter} onChange={(event) => setVehicleFilter(event.target.value)} aria-label="Lọc loại xe"><option value="ALL">Tất cả phương tiện</option><option value="2">Ô tô</option><option value="1">Xe máy</option></select></div>
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0 text-center" style={{ fontSize: '13.5px' }}>
                                        <thead className="table-light text-uppercase text-secondary" style={{ fontSize: '11px', fontWeight: 700 }}>
                                        <tr>
                                            <th>Mã phiên</th>
                                            <th>Biển số</th>
                                            <th>Loại xe</th>
                                            <th>Giờ vào</th>
                                            <th>Giờ ra</th>
                                            <th>Trạng thái</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {filteredSessions.map((session) => (
                                            <tr key={session.sessionId}>
                                                <td className="fw-bold text-secondary">#{session.sessionId}</td>
                                                <td className="fw-bold text-dark">{session.licensePlate}</td>
                                                <td>{session.vehicleTypeId === 2 ? 'Ô tô' : 'Xe máy'}</td>
                                                <td className="text-muted" style={{ fontSize: '13px' }}>{session.checkInTime || '--'}</td>
                                                <td className="text-muted" style={{ fontSize: '13px' }}>{session.checkOutTime || '--'}</td>
                                                <td><span className={`badge ${statusBadge(session.sessionStatus)} px-2.5 py-1.5 rounded-2 fw-bold`} style={{ fontSize: '11px' }}>{sessionStatusLabel[(session.sessionStatus || '').toUpperCase()] || session.sessionStatus}</span></td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="card shadow-sm border p-4 rounded-3 bg-white" style={{ borderColor: '#E2E8F0' }}>
                                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 border-bottom pb-3 gap-2" style={{ borderColor: '#E2E8F0' }}>
                                    <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '16px' }}><i className="fa-solid fa-map-location-dot me-2 text-primary"></i>Sơ đồ giám sát nhanh</h5>
                                    <div className="d-flex flex-wrap gap-3 text-secondary" style={{ fontSize: '12px', fontWeight: 600 }}>
                                        <span><i className="fa-solid fa-square text-green-custom me-1"></i>Trống</span>
                                        <span><i className="fa-solid fa-square text-red-custom me-1"></i>Có xe</span>
                                        <span><i className="fa-solid fa-square text-warning me-1" style={{ color: '#F59E0B' }}></i>Giữ chỗ</span>
                                        <span><i className="fa-solid fa-square text-muted me-1"></i>Bảo trì</span>
                                    </div>
                                </div>
                                <div className="row g-4">
                                    {[
                                        { floorId: 1, title: 'Tầng 1 – Khu vực ô tô', icon: 'fa-car', color: '#3B82F6' },
                                        { floorId: 2, title: 'Tầng 2 – Khu vực xe máy', icon: 'fa-motorcycle', color: '#F59E0B' },
                                    ].map((floor) => (
                                        <div className="col-12" key={floor.floorId}>
                                                <div className="d-flex align-items-center justify-content-between mb-3">
                                                    <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '14px' }}>
                                                        <i className={`fa-solid ${floor.icon} me-2`} style={{ color: floor.color }}></i>
                                                        {floor.title}
                                                    </h6>
                                                </div>

                                                {slotsByFloor[floor.floorId].length > 0 ? (
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))', gap: '12px' }}>
                                                        {slotsByFloor[floor.floorId].map((slot) => (
                                                            <div key={slot.slotId} className={`rounded-3 text-center p-2 fw-bold shadow-sm d-flex flex-column justify-content-center ${slotClass(slot.status)}`} style={{ fontSize: '13px', minHeight: '60px' }}>
                                                                <div>{slot.slotCode}</div>
                                                                {slot.currentVehiclePlate && (
                                                                    <span className="mt-0.5 text-truncate mx-auto" style={{ fontSize: '10.5px', fontWeight: 700, maxWidth: '100%' }}>
                                                                        {slot.currentVehiclePlate}
                                                                    </span>
                                                                )}
                                                                <span className="mt-0.5 opacity-80" style={{ fontSize: '10px', fontWeight: 500 }}>
                                                                    {{ Available: 'Trống', Occupied: 'Có xe', Booked: 'Giữ chỗ', Maintenance: 'Bảo trì' }[slot.status] || slot.status}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center text-secondary py-3 small">Chưa có slot ở khu vực này.</div>
                                                )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="col-xl-4">
                            <div className="card shadow-sm border p-4 mb-4 bg-white rounded-3" style={{ borderColor: '#E2E8F0' }}>
                                <h5 className="fw-bold text-dark mb-3" style={{ fontSize: '16px' }}><i className="fa-solid fa-triangle-exclamation text-red-custom me-2"></i>Hỗ trợ sự cố tại quầy</h5>
                                {(recentIncidents.length ? recentIncidents : [{ incidentId: 'demo', licensePlate: '30K-123.45', incidentType: 'LOST_TICKET', status: 'IN_REVIEW' }]).slice(0, 3).map((incident) => (
                                    <div className="border-bottom py-3 d-flex justify-content-between align-items-center" key={incident.incidentId} style={{ borderColor: '#F1F5F9' }}>
                                        <div>
                                            <strong className="text-dark d-block fs-6">{incident.licensePlate}</strong>
                                            <small className="text-secondary fw-medium" style={{ fontSize: '12px' }}>{incidentTypeLabel[incident.incidentType] || incident.incidentType}</small>
                                        </div>
                                        <span className="badge bg-red-soft text-red-custom px-2 py-1.5 rounded-2 fw-bold" style={{ fontSize: '11px' }}>{incidentStatusLabel[incident.status] || incident.status}</span>
                                    </div>
                                ))}
                            </div>

                            
                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StaffDashboard;
