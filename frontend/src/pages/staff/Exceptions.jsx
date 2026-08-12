import { useEffect, useMemo, useState } from 'react';
import api from '../../config/Api';
import StaffSidebar from '../../components/StaffSidebar.jsx';

// ✓ ĐÚNG: Rút ngắn để Axios tự động đính kèm context path qua thực thể api custom
const API_BASE = '/staff';

const incidentTypeLabel = { LOST_TICKET: 'Mất vé', WRONG_PARKING_POSITION: 'Đỗ sai vị trí', OCCUPIED_SLOT: 'Chiếm chỗ', PAYMENT_ERROR: 'Lỗi thanh toán', CUSTOMER_REPORT: 'Phản ánh khách hàng' };
const incidentStatusLabel = { OPEN: 'Chờ xử lý', IN_REVIEW: 'Đang xử lý', RESOLVED: 'Đã xử lý' };

function normalizePlate(value) {
    return value.trim().toUpperCase();
}

function SessionSummary({ session, slotName }) {
    if (!session) return null;

    return (
        <div className="p-3 rounded-3 border mb-4 bg-slate-light" style={{ fontSize: '13.5px', borderColor: '#E2E8F0', fontWeight: 500 }}>
            <div className="d-flex justify-content-between mb-2 pb-2 border-bottom" style={{ borderColor: '#E2E8F0' }}>
                <span className="text-slate-custom fw-bold">Mã phiên</span>
                <strong>#{session.sessionId}</strong>
            </div>
            <div className="d-flex justify-content-between mb-2 pb-2 border-bottom" style={{ borderColor: '#E2E8F0' }}>
                <span className="text-slate-custom fw-bold">Biển số</span>
                <strong className="text-dark">{session.licensePlate}</strong>
            </div>
            <div className="d-flex justify-content-between mb-2 pb-2 border-bottom" style={{ borderColor: '#E2E8F0' }}>
                <span className="text-slate-custom fw-bold">Slot được cấp</span>
                <strong className="text-blue-custom">{slotName || `#${session.slotId}`}</strong>
            </div>
            <div className="d-flex justify-content-between">
                <span className="text-slate-custom fw-bold">Giờ vào</span>
                <strong className="text-dark">{session.checkInTime || '--'}</strong>
            </div>
        </div>
    );
}

function SlotPickerModal({ slots, currentSlotId, onSelect, onClose }) {
    const statusColor = (status) => {
        switch (status) {
            case 'Available':
            case 'Blank':
                return { bg: '#E6F4EA', border: '#CEEAD6', text: '#137333' };
            case 'Occupied':
                return { bg: '#FCE8E6', border: '#FAD2CF', text: '#C5221F' };
            case 'Booked':
                return { bg: '#FEF7E0', border: '#FEEFC3', text: '#B06000' };
            case 'Maintenance':
            case 'Locked':
                return { bg: '#F1F3F4', border: '#E8EAED', text: '#5F6368' };
            default:
                return { bg: '#F1F3F4', border: '#E8EAED', text: '#5F6368' };
        }
    };

    const grouped = useMemo(() => {
        const byFloor = {};
        slots.forEach((slot) => {
            if (!byFloor[slot.floorId]) byFloor[slot.floorId] = [];
            byFloor[slot.floorId].push(slot);
        });
        return byFloor;
    }, [slots]);

    return (
        <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{ background: 'rgba(15,23,42,0.6)', zIndex: 1050, backdropFilter: 'blur(4px)' }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3 shadow-lg p-4 border"
                style={{ width: '92%', maxWidth: '640px', maxHeight: '80vh', overflowY: 'auto', borderColor: '#E2E8F0' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '16px' }}>Chọn slot thực tế</h5>
                    <button className="btn-close" onClick={onClose}></button>
                </div>

                <div className="d-flex flex-wrap gap-3 mb-4 text-secondary" style={{ fontSize: '12px', fontWeight: 600 }}>
                    <span><i className="fa-solid fa-square me-1" style={{ color: '#10B981' }}></i>Trống (chọn được)</span>
                    <span><i className="fa-solid fa-square me-1" style={{ color: '#EF4444' }}></i>Đã đỗ (khóa)</span>
                    <span><i className="fa-solid fa-square me-1" style={{ color: '#F59E0B' }}></i>Đã đặt trước (khóa)</span>
                    <span><i className="fa-solid fa-square me-1" style={{ color: '#94A3B8' }}></i>Bảo trì/Khóa</span>
                </div>

                {Object.entries(grouped).map(([floorId, floorSlots]) => (
                    <div key={floorId} className="mb-4">
                        <div className="fw-bold text-slate-custom mb-2.5" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>TẦNG {floorId}</div>
                        <div className="d-flex flex-wrap gap-2">
                            {floorSlots.map((slot) => {
                                const selectable = slot.status === 'Available' || slot.status === 'Blank';
                                const colors = statusColor(slot.status);
                                const isCurrent = slot.slotId === currentSlotId;
                                return (
                                    <button
                                        key={slot.slotId}
                                        type="button"
                                        disabled={!selectable}
                                        onClick={() => selectable && onSelect(slot)}
                                        className="border fw-bold rounded-2 transition-all d-flex align-items-center justify-content-center shadow-sm"
                                        style={{
                                            width: '64px',
                                            height: '46px',
                                            background: colors.bg,
                                            borderColor: isCurrent ? '#3B82F6' : colors.border,
                                            borderWidth: isCurrent ? '2px' : '1px',
                                            color: colors.text,
                                            fontSize: '11.5px',
                                            cursor: selectable ? 'pointer' : 'not-allowed',
                                            opacity: selectable ? 1 : 0.65,
                                        }}
                                        title={`${slot.slotCode} - ${slot.status}`}
                                    >
                                        {slot.slotCode}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Exceptions() {
    const [timeStr, setTimeStr] = useState('--:--:-- - --/--/----');

    const [lostPlate, setLostPlate] = useState('');
    const [lostSession, setLostSession] = useState(null);
    const [lostNote, setLostNote] = useState('');
    const [verifyOwner, setVerifyOwner] = useState(false);

    const [wrongPlate, setWrongPlate] = useState('');
    const [wrongSession, setWrongSession] = useState(null);
    const [wrongNote, setWrongNote] = useState('');
    const [actualSlot, setActualSlot] = useState(null);
    const [showSlotPicker, setShowSlotPicker] = useState(false);
    const [allSlots, setAllSlots] = useState([]);

    const [paymentPlate, setPaymentPlate] = useState('');
    const [paymentSession, setPaymentSession] = useState(null);
    const [paymentOwner, setPaymentOwner] = useState(null);
    const [paymentNote, setPaymentNote] = useState('');
    const [paymentIncidentId, setPaymentIncidentId] = useState(null);

    const [loading, setLoading] = useState('');
    const [message, setMessage] = useState('');
    const [incidents, setIncidents] = useState([]);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setTimeStr(`${now.toLocaleTimeString('vi-VN', { hour12: false })} - ${now.toLocaleDateString('vi-VN')}`);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const loadIncidents = async () => {
        try {
            const response = await api.get(`${API_BASE}/incidents`);
            setIncidents(response.data || []);
        } catch (error) {
            setIncidents([]);
        }
    };

    const loadAllSlots = async () => {
        try {
            const response = await api.get(`${API_BASE}/slots/all`);
            setAllSlots(response.data || []);
        } catch (error) {
            setAllSlots([]);
        }
    };

    useEffect(() => {
        loadIncidents();
        loadAllSlots();
    }, []);

    const slotNameById = (slotId) => {
        const found = allSlots.find((s) => s.slotId === slotId);
        return found ? found.slotCode : null;
    };

    const searchSession = async (plate, setter, key) => {
        if (!plate.trim()) {
            alert('Vui lòng nhập biển số xe.');
            return;
        }

        setLoading(key);
        setMessage('');
        try {
            const response = await api.get(`${API_BASE}/sessions/search?licensePlate=${encodeURIComponent(normalizePlate(plate))}`);
            setter(response.data);
        } catch (error) {
            setter(null);
            setMessage(`Không tìm thấy phiên đang hoạt động cho biển số ${normalizePlate(plate)}.`);
        } finally {
            setLoading('');
        }
    };

    const searchPaymentOwner = async () => {
        if (!paymentPlate.trim()) {
            alert('Vui lòng nhập biển số xe.');
            return;
        }
        setLoading('payment-search');
        setMessage('');
        try {
            const cleanPlate = normalizePlate(paymentPlate);
            const response = await api.get(`${API_BASE}/sessions/owner?licensePlate=${encodeURIComponent(cleanPlate)}`);
            setPaymentSession(response.data.session);
            setPaymentOwner(response.data);

            // Kiểm tra xem xe này đã có biên bản nào đang chờ xử lý trong danh sách chưa
            const existingPending = incidents.find(i => i.licensePlate === cleanPlate && i.status !== 'RESOLVED');
            if (existingPending) {
                setPaymentIncidentId(existingPending.incidentId);
                setMessage(`ℹ️ Tìm thấy biên bản #${existingPending.incidentId} đang chờ xử lý cho xe ${cleanPlate}.`);
            } else {
                setPaymentIncidentId(null);
            }
        } catch (error) {
            setPaymentSession(null);
            setPaymentOwner(null);
            setPaymentIncidentId(null);
            setMessage(`Không tìm thấy phiên đang hoạt động cho biển số ${normalizePlate(paymentPlate)}.`);
        } finally {
            setLoading('');
        }
    };

    const resolveIncidentDirectly = async (incident) => {
        if (!incident) return;
        setLoading(`resolve-${incident.incidentId}`);
        try {
            await api.put(`${API_BASE}/incidents/${incident.incidentId}/resolve`, {
                status: 'RESOLVED',
                resolutionNote: 'Staff đã xác nhận xử lý thành công trực tiếp từ bảng biên bản.',
            });

            // Tự động đóng các biên bản trùng biển số khác nếu có
            const pendingIncidents = incidents.filter(i => i.licensePlate === incident.licensePlate && i.status !== 'RESOLVED' && i.incidentId !== incident.incidentId);
            for (const p of pendingIncidents) {
                await api.put(`${API_BASE}/incidents/${p.incidentId}/resolve`, {
                    status: 'RESOLVED',
                    resolutionNote: 'Staff đã xác nhận xử lý thành công.',
                });
            }

            setMessage(`Đã duyệt chuyển trạng thái biên bản #${incident.incidentId} (Biển số: ${incident.licensePlate}) sang ĐÃ XỬ LÝ!`);

            if (paymentSession && paymentSession.licensePlate === incident.licensePlate) {
                setPaymentSession(null);
                setPaymentOwner(null);
                setPaymentPlate('');
                setPaymentNote('');
                setPaymentIncidentId(null);
            }

            loadIncidents();
            loadAllSlots();
        } catch (error) {
            console.error("Lỗi khi xác nhận xử lý biên bản:", error);
            const errMsg = error.response?.data?.error || error.response?.data || 'Không thể xác nhận xử lý. Vui lòng thử lại.';
            setMessage(typeof errMsg === 'string' ? errMsg : 'Không thể xác nhận xử lý. Vui lòng thử lại.');
        } finally {
            setLoading('');
        }
    };

    const reportPaymentError = async () => {
        if (!paymentSession) return;
        setLoading('payment-report');
        try {
            const response = await api.post(`${API_BASE}/incidents/payment-error`, {
                licensePlate: paymentSession.licensePlate,
                evidenceNote: paymentNote || 'Staff ghi nhận lỗi thanh toán tại quầy.',
                createdBy: 'STAFF',
            });
            setPaymentIncidentId(response.data.incidentId);
            setMessage(response.status === 200
                ? `Xe ${paymentSession.licensePlate} da co bien ban loi thanh toan dang cho xu ly.`
                : `Da lap bien ban loi thanh toan cho xe ${paymentSession.licensePlate}.`);
            loadIncidents();
        } catch (error) {
            setMessage('Không thể lập biên bản lỗi thanh toán.');
        } finally {
            setLoading('');
        }
    };

    const confirmPaymentSuccess = async () => {
        if (!paymentIncidentId) return;
        setLoading('payment-confirm');
        try {
            await api.put(`${API_BASE}/incidents/${paymentIncidentId}/resolve`, {
                status: 'RESOLVED',
                resolutionNote: 'Staff đã xác nhận thanh toán thành công tại quầy.',
            });
            // Auto resolve pending guest incidents for this plate
            const pendingIncidents = [];
            for (const i of pendingIncidents) {
                await api.put(`${API_BASE}/incidents/${i.incidentId}/resolve`, {
                    status: 'RESOLVED',
                    resolutionNote: 'Staff đã xác nhận thanh toán thành công tại quầy.',
                });
            }
            setMessage(`Đã xác nhận thanh toán thành công cho xe ${paymentSession.licensePlate}.`);
            setPaymentSession(null);
            setPaymentOwner(null);
            setPaymentPlate('');
            setPaymentNote('');
            setPaymentIncidentId(null);
            loadIncidents();
        } catch (error) {
            setMessage('Không thể xác nhận thanh toán. Vui lòng thử lại.');
        } finally {
            setLoading('');
        }
    };

    const submitLostTicket = async (event) => {
        event.preventDefault();
        if (!lostSession || !verifyOwner) return;

        setLoading('lost-submit');
        try {
            await api.post(`${API_BASE}/incidents/lost-ticket`, {
                licensePlate: lostSession.licensePlate,
                penaltyAmount: 100000,
                evidenceNote: lostNote || 'Staff đã đối chiếu giấy tờ xe và thông tin khách hàng.',
                createdBy: 'STAFF',
            });

            setMessage(`Đã lập biên bản mất vé cho xe ${lostSession.licensePlate}. Trạng thái chuyển sang Đã xử lý.`);
            setLostSession(null);
            setLostPlate('');
            setLostNote('');
            setVerifyOwner(false);
            loadIncidents();
        } catch (error) {
            setMessage('Không thể lập biên bản mất vé. Vui lòng kiểm tra backend hoặc dữ liệu phiên xe.');
        } finally {
            setLoading('');
        }
    };

    const submitWrongSlot = async (event) => {
        event.preventDefault();
        if (!wrongSession || !actualSlot) return;

        setLoading('wrong-submit');
        try {
            await api.post(`${API_BASE}/incidents/wrong-slot`, {
                licensePlate: wrongSession.licensePlate,
                actualSlotCode: actualSlot.slotCode,
                evidenceNote: wrongNote || 'Staff ghi nhận xe đang đỗ sai vị trí trên sơ đồ giám sát.',
                createdBy: 'STAFF',
            });

            setMessage(`Đã ghi nhận vị trí thực tế ${actualSlot.slotCode} cho xe ${wrongSession.licensePlate}.`);
            setWrongSession(null);
            setWrongPlate('');
            setActualSlot(null);
            setWrongNote('');
            loadIncidents();
            loadAllSlots();
        } catch (error) {
            setMessage('Không thể cập nhật vị trí thực tế. Hãy kiểm tra mã slot và phiên xe.');
        } finally {
            setLoading('');
        }
    };

    return (
        <div className="d-flex" style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>

            {/* Inject CSS custom đồng bộ hệ thống màu sắc Soft */}
            <style>{`
                .text-green-custom { color: #10B981 !important; }
                .bg-green-soft { background-color: rgba(16, 185, 129, 0.08) !important; }
                
                .text-blue-custom { color: #3B82F6 !important; }
                .bg-blue-soft { background-color: rgba(59, 130, 246, 0.08) !important; }

                .text-red-custom { color: #EF4444 !important; }
                .bg-red-soft { background-color: rgba(239, 68, 68, 0.08) !important; }

                .text-cyan-custom { color: #0EA5E9 !important; }
                .bg-cyan-soft { background-color: rgba(14, 165, 233, 0.08) !important; border: 1px solid rgba(14, 165, 233, 0.15) !important; }

                .text-amber-custom { color: #D97706 !important; }
                .bg-amber-soft { background-color: rgba(245, 158, 11, 0.08) !important; }
                .border-amber-soft { border: 1px solid rgba(245, 158, 11, 0.2) !important; }

                .text-slate-custom { color: #64748B !important; }
                .bg-slate-light { background-color: #F8FAFC !important; }
            `}</style>

            <StaffSidebar />

            {/* Dịch lề trái 240px cố định khớp Sidebar */}
            <div className="main-content flex-grow-1" style={{ minWidth: 0, padding: '24px 32px', marginLeft: '240px' }}>
                <div className="container-fluid px-0">

                    {/* Header */}
                    <div className="p-4 mb-4 text-white d-flex justify-content-between align-items-center position-relative shadow-sm"
                         style={{ background: 'linear-gradient(135deg, #0B1528 0%, #1E2E4A 100%)', borderRadius: '16px', minHeight: '110px' }}>
                        <div>
        <span className="fw-bold text-uppercase opacity-70" style={{ fontSize: '11px', letterSpacing: '1.5px', color: '#F87171' }}>
            <i className="fa-solid fa-triangle-exclamation me-1.5" /> Incident Management
        </span>
                            <h3 className="fw-bold mt-1 mb-2" style={{ fontSize: '22px', letterSpacing: '-0.5px' }}>Lỗi Ngoại Lệ</h3>
                            <p className="mb-0 opacity-70" style={{ fontSize: '13px' }}>Tra cứu biển số, lập biên bản mất vé, lỗi thanh toán và ghi nhận xe đỗ sai vị trí</p>
                        </div>
                        <div className="d-none d-sm-flex align-items-center p-2 px-3 rounded-3 fw-bold"
                             style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '13px' }}>
                            <i className="fa-regular fa-clock me-2"></i>{timeStr}
                        </div>
                    </div>

                    {message && <div className="alert bg-blue-soft text-blue-custom border-0 shadow-sm fw-medium mb-4">{message}</div>}

                    <div className="row g-4">

                        {/* ===== FORM LỖI THANH TOÁN ===== */}
                        <div className="col-lg-6">
                            <div className="card shadow-sm border p-4 bg-white h-100 rounded-3" style={{ borderColor: '#E2E8F0' }}>
                                <h5 className="fw-bold text-cyan-custom mb-4" style={{ fontSize: '16px' }}><i className="fa-solid fa-credit-card me-2"></i>Lỗi thanh toán</h5>
                                <div className="mb-4">
                                    <label className="form-label fw-bold text-slate-custom mb-2" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>BIỂN SỐ XE</label>
                                    <div className="input-group shadow-sm rounded-3 overflow-hidden">
                                        <input className="form-control text-uppercase fw-bold py-2 fs-5" style={{ height: '44px', borderColor: '#E2E8F0', letterSpacing: '0.5px' }} placeholder="VD: 30K-12345" value={paymentPlate} onChange={(e) => setPaymentPlate(e.target.value)} />
                                        <button className="btn btn-info fw-bold text-dark px-4" type="button" onClick={searchPaymentOwner} disabled={loading === 'payment-search'} style={{ backgroundColor: '#0EA5E9', border: 'none', color: '#FFFFFF !important' }}>
                                            {loading === 'payment-search' ? <span className="spinner-border spinner-border-sm me-1"></span> : null}
                                            <span className="text-white">Truy xuất</span>
                                        </button>
                                    </div>
                                </div>

                                <SessionSummary session={paymentSession} slotName={paymentSession ? slotNameById(paymentSession.slotId) : null} />

                                {paymentSession && (
                                    <div className="d-flex flex-column flex-grow-1">
                                        <div className="bg-cyan-soft rounded-3 p-3 mb-3 fs-6" style={{ fontWeight: 500, border: '1px solid rgba(14,165,233,0.15)' }}>
                                            <div className="d-flex justify-content-between mb-2 pb-1 border-bottom" style={{ borderColor: 'rgba(14,165,233,0.1)' }}>
                                                <span className="fw-bold text-slate-custom" style={{ fontSize: '13px' }}>Loại khách</span>
                                                <strong className="text-dark">{paymentOwner?.ownerType === 'USER' ? 'Khách đăng ký' : 'Khách vãng lai'}</strong>
                                            </div>
                                            <div className="d-flex justify-content-between mb-2 pb-1 border-bottom" style={{ borderColor: 'rgba(14,165,233,0.1)' }}>
                                                <span className="fw-bold text-slate-custom" style={{ fontSize: '13px' }}>Tên/Liên hệ</span>
                                                <strong className="text-dark">{paymentOwner?.ownerName || '--'}</strong>
                                            </div>
                                            {paymentOwner?.ownerPhone && (
                                                <div className="d-flex justify-content-between">
                                                    <span className="fw-bold text-slate-custom" style={{ fontSize: '13px' }}>SĐT</span>
                                                    <strong className="text-dark">{paymentOwner.ownerPhone}</strong>
                                                </div>
                                            )}
                                        </div>

                                        <textarea className="form-control mb-3 shadow-sm" style={{ borderColor: '#E2E8F0', fontSize: '13.5px' }} rows="3" placeholder="Ghi chú chi tiết lỗi thanh toán..." value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} />

                                        {!paymentIncidentId ? (
                                            <button className="btn btn-info text-white w-100 fw-bold py-2.5 mt-auto shadow-sm" type="button" onClick={reportPaymentError} disabled={loading === 'payment-report'} style={{ backgroundColor: '#0EA5E9', border: 'none', borderRadius: '8px' }}>
                                                <i className="fa-solid fa-file-circle-exclamation me-2"></i>Lập biên bản lỗi thanh toán
                                            </button>
                                        ) : (
                                            <button className="btn btn-success bg-green-custom w-100 fw-bold py-2.5 mt-auto shadow-sm" type="button" onClick={confirmPaymentSuccess} disabled={loading === 'payment-confirm'} style={{ border: 'none', borderRadius: '8px' }}>
                                                {loading === 'payment-confirm' ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="fa-solid fa-circle-check me-2"></i>}
                                                Xác nhận thanh toán thành công
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ===== FORM MẤT VÉ ===== */}
                        <div className="col-lg-6">
                            <div className="card shadow-sm border p-4 bg-white h-100 rounded-3" style={{ borderColor: '#E2E8F0' }}>
                                <h5 className="fw-bold text-red-custom mb-4" style={{ fontSize: '16px' }}><i className="fa-solid fa-id-card-clip me-2"></i>Báo cáo mất vé</h5>
                                <div className="mb-4">
                                    <label className="form-label fw-bold text-slate-custom mb-2" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>BIỂN SỐ XE</label>
                                    <div className="input-group shadow-sm rounded-3 overflow-hidden">
                                        <input className="form-control text-uppercase fw-bold py-2 fs-5" style={{ height: '44px', borderColor: '#E2E8F0', letterSpacing: '0.5px' }} placeholder="VD: 30K-12345" value={lostPlate} onChange={(e) => setLostPlate(e.target.value)} />
                                        <button className="btn btn-danger fw-bold text-white px-4" type="button" onClick={() => searchSession(lostPlate, setLostSession, 'lost-search')} disabled={loading === 'lost-search'} style={{ backgroundColor: '#EF4444', border: 'none' }}>
                                            {loading === 'lost-search' ? <span className="spinner-border spinner-border-sm me-1"></span> : null}
                                            Truy xuất
                                        </button>
                                    </div>
                                </div>

                                <SessionSummary session={lostSession} slotName={lostSession ? slotNameById(lostSession.slotId) : null} />

                                {lostSession && (
                                    <form onSubmit={submitLostTicket} className="d-flex flex-column flex-grow-1">
                                        <div className="bg-red-soft rounded-3 p-3 mb-3 border border-danger border-opacity-10">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="fw-bold text-slate-custom" style={{ fontSize: '13px' }}>Phí phạt định mức mất vé</span>
                                                <strong className="text-red-custom fs-4 fw-extrabold">100,000 đ</strong>
                                            </div>
                                        </div>

                                        <textarea className="form-control mb-3 shadow-sm" style={{ borderColor: '#E2E8F0', fontSize: '13.5px' }} rows="3" placeholder="Ghi chú xác minh CMND / Giấy tờ sở hữu xe..." value={lostNote} onChange={(e) => setLostNote(e.target.value)} />

                                        <div className="form-check p-3 bg-slate-light rounded-3 border mb-3 d-flex align-items-center shadow-inner" style={{ borderColor: '#E2E8F0' }}>
                                            <input className="form-check-input m-0" type="checkbox" id="verifyOwner" checked={verifyOwner} onChange={(e) => setVerifyOwner(e.target.checked)} style={{ cursor: 'pointer', transform: 'scale(1.1)' }} />
                                            <label className="form-check-label fw-bold ms-2.5 text-dark" htmlFor="verifyOwner" style={{ cursor: 'pointer', fontSize: '13px' }}>Đã kiểm tra giấy tờ đối chiếu và xác minh chủ xe hợp lệ</label>
                                        </div>

                                        <button className="btn btn-danger w-100 fw-bold py-2.5 mt-auto shadow-sm" disabled={!verifyOwner || loading === 'lost-submit'} style={{ backgroundColor: '#EF4444', border: 'none', borderRadius: '8px' }}>
                                            <i className="fa-solid fa-file-signature me-2"></i>Lập biên bản mất vé
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* ===== FORM ĐỖ SAI VỊ TRÍ ===== */}
                        <div className="col-lg-6">
                            <div className="card shadow-sm border p-4 bg-white h-100 rounded-3" style={{ borderColor: '#E2E8F0' }}>
                                <h5 className="fw-bold text-amber-custom mb-3" style={{ fontSize: '16px' }}><i className="fa-solid fa-car-burst me-2"></i>Cập nhật xe đỗ sai vị trí</h5>
                                <div className="alert bg-amber-soft text-amber-custom border-amber-soft rounded-3 fs-7 fw-medium mb-4">
                                    Bộ phận vận hành ghi nhận slot thực tế từ bãi, hệ thống sẽ tự động giải phóng vị trí cũ trên sơ đồ và khóa slot mới.
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-bold text-slate-custom mb-2" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>BIỂN SỐ XE</label>
                                    <div className="input-group shadow-sm rounded-3 overflow-hidden">
                                        <input className="form-control text-uppercase fw-bold py-2 fs-5" style={{ height: '44px', borderColor: '#E2E8F0', letterSpacing: '0.5px' }} placeholder="VD: 59A-11111" value={wrongPlate} onChange={(e) => setWrongPlate(e.target.value)} />
                                        <button className="btn btn-warning fw-bold text-dark px-4" type="button" onClick={() => searchSession(wrongPlate, setWrongSession, 'wrong-search')} // Thêm dấu } để đóng disabled trước khi viết tiếp thuộc tính style
                                                disabled={loading === 'wrong-search'} style={{ backgroundColor: '#F59E0B', border: 'none', color: '#FFFFFF' }}>
                                            {loading === 'wrong-search' ? <span className="spinner-border spinner-border-sm me-1"></span> : null}
                                            <span className="text-white">Truy xuất</span>
                                        </button>
                                    </div>
                                </div>

                                <SessionSummary session={wrongSession} slotName={wrongSession ? slotNameById(wrongSession.slotId) : null} />

                                {wrongSession && (
                                    <form onSubmit={submitWrongSlot} className="d-flex flex-column flex-grow-1">
                                        <div className="row g-3 mb-3">
                                            <div className="col-6">
                                                <div className="p-3 bg-slate-light rounded-3 border text-center" style={{ borderColor: '#E2E8F0 shadow-sm' }}>
                                                    <span className="d-block text-slate-custom fw-bold mb-1.5" style={{ fontSize: '11px' }}>SLOT TRÊN VÉ</span>
                                                    <strong className="fs-4 text-secondary">{slotNameById(wrongSession.slotId) || `#${wrongSession.slotId}`}</strong>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div
                                                    className="p-3 bg-amber-soft rounded-3 border text-center transition-all shadow-sm button-select-hover"
                                                    style={{ cursor: 'pointer', border: '1px solid rgba(245,158,11,0.3)' }}
                                                    onClick={() => { loadAllSlots(); setShowSlotPicker(true); }}
                                                >
                                                    <span className="d-block text-slate-custom fw-bold mb-1.5" style={{ fontSize: '11px' }}>SLOT THỰC TẾ</span>
                                                    <strong className="fs-4 text-red-custom">
                                                        {actualSlot ? actualSlot.slotCode : <span className="text-muted fs-7 fw-semibold"><i className="fa-solid fa-map-location-dot me-1"></i>Xem sơ đồ</span>}
                                                    </strong>
                                                </div>
                                            </div>
                                        </div>

                                        <textarea className="form-control mb-3 shadow-sm" style={{ borderColor: '#E2E8F0', fontSize: '13.5px' }} rows="3" placeholder="Ghi chú xác nhận hiện trường bãi đỗ..." value={wrongNote} onChange={(e) => setWrongNote(e.target.value)} />

                                        <button className="btn btn-warning w-100 fw-bold text-white py-2.5 mt-auto shadow-sm" disabled={!actualSlot || loading === 'wrong-submit'} style={{ backgroundColor: '#F59E0B', border: 'none', borderRadius: '8px' }}>
                                            <i className="fa-solid fa-arrows-rotate me-2"></i>Xác nhận cập nhật vị trí
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bảng danh sách biên bản sự cố */}
                    <div className="card shadow-sm border p-4 bg-white rounded-3 mt-4" style={{ borderColor: '#E2E8F0' }}>
                        <h5 className="fw-bold text-dark mb-3" style={{ fontSize: '16px' }}><i className="fa-solid fa-clock-rotate-left me-2 text-secondary"></i>Biên bản gần đây</h5>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0 text-center" style={{ fontSize: '13.5px' }}>
                                <thead className="table-light text-uppercase text-secondary" style={{ fontSize: '11px', fontWeight: 700 }}>
                                <tr>
                                    <th style={{ width: '70px' }} className="text-center">Mã BB</th>
                                    <th style={{ width: '120px' }} className="text-center">Biển số</th>
                                    <th style={{ width: '150px' }} className="text-center">Loại ngoại lệ</th>
                                    <th className="text-start">Nội dung minh chứng</th>
                                    <th style={{ width: '110px' }} className="text-center">Trạng thái</th>
                                    <th style={{ width: '140px' }} className="text-center">Thời gian lập</th>
                                    <th style={{ width: '150px' }} className="text-center">Thao tác</th>
                                </tr>
                                </thead>
                                <tbody>
                                {incidents.length === 0 && (
                                    <tr><td colSpan="7" className="text-center text-muted py-4">Chưa có biên bản ngoại lệ nào ghi nhận trong phiên.</td></tr>
                                )}
                                {incidents.map((incident) => {
                                    const isStaff = !incident.createdBy || incident.createdBy.toUpperCase() === 'STAFF';
                                    const sourceTag = isStaff
                                        ? <span className="badge bg-secondary-subtle text-secondary border px-2 py-1 rounded-2 fw-bold flex-shrink-0" style={{ fontSize: '11px' }}>Staff</span>
                                        : <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 rounded-2 fw-bold flex-shrink-0" style={{ fontSize: '11px' }}>Khách phản ánh</span>;

                                    const rawNote = incident.evidenceNote || '';
                                    const parsedNote = rawNote.includes(' | ') ? rawNote.split(' | ').pop().replace(/^Biển số:?\s*/i, '').trim() : rawNote;

                                    const cleanVietnameseText = (text) => {
                                        if (!text || typeof text !== 'string') return text || '';
                                        let cleaned = text;
                                        cleaned = cleaned
                                            .replace(/Staff ghi nh[?:\uFFFD\s]*n l[?:\uFFFD\s]*i thanh to[áa]n t[?:\uFFFD\s]*i qu[?:\uFFFD\s]*y\.?/gi, 'Staff ghi nhận lỗi thanh toán tại quầy.')
                                            .replace(/Staff d[ãa] d[?:\uFFFD\s]*i chi[?:\uFFFD\s]*u gi[?:\uFFFD\s]*y t[?:\uFFFD\s]*xe v[àa] th[?:\uFFFD\s]*ng tin kh[áa]ch h[àa]ng\.?/gi, 'Staff đã đối chiếu giấy tờ xe và thông tin khách hàng.')
                                            .replace(/Staff ghi nh[?:\uFFFD\s]*n xe dang d[?:\uFFFD\s]*sai v[?:\uFFFD\s]*tr[íi] tr[êe]n so d[?:\uFFFD\s]*gi[áa]m s[áa]t\.?/gi, 'Staff ghi nhận xe đang đỗ sai vị trí trên sơ đồ giám sát.')
                                            .replace(/Kh[?:\uFFFD\s]*ng ch[?:\uFFFD\s]*p h[?:\uFFFD\s]*nh d[?:\uFFFD\s]*ng quy d[?:\uFFFD\s]*nh/gi, 'Không chấp hành đúng quy định')
                                            .replace(/M[?:\uFFFD\s]*t th[?:\uFFFD\s]*xe [?:\uFFFD\s]*t[òo]a nh[àa] 2/gi, 'Mất thẻ xe ở tòa nhà 2')
                                            .replace(/Noi dung:\s*M[?:\uFFFD\s]*t th[?:\uFFFD\s]*xe/gi, 'Noi dung: Mất thẻ xe')
                                            .replace(/\bnh\?n\b/gi, 'nhận')
                                            .replace(/\bl\?i\b/gi, 'lỗi')
                                            .replace(/\bt\?i\b/gi, 'tại')
                                            .replace(/\bqu\?y\b/gi, 'quầy')
                                            .replace(/\bd\?i\b/gi, 'đối')
                                            .replace(/\bchi\?u\b/gi, 'chiếu')
                                            .replace(/\bgi\?y\b/gi, 'giấy')
                                            .replace(/\bxe dang d\?\b/gi, 'xe đang đỗ')
                                            .replace(/\bv\? tr\?/gi, 'vị trí')
                                            .replace(/\bso d\?\b/gi, 'sơ đồ')
                                            .replace(/\bch\?p\b/gi, 'chấp')
                                            .replace(/\bd\?nh\b/gi, 'định')
                                            .replace(/\bM\?t\b/gi, 'Mất')
                                            .replace(/\bth\?\b/gi, 'thẻ')
                                            .replace(/\bxe \?\b/gi, 'xe ở')
                                            .replace(/\bgi\?y t\?\b/gi, 'giấy tờ');
                                        return cleaned;
                                    };

                                    const cleanNote = cleanVietnameseText(parsedNote);

                                    return (
                                        <tr key={incident.incidentId}>
                                            <td className="fw-bold text-secondary text-center">#{incident.incidentId}</td>
                                            <td className="fw-bold text-dark text-center">{incident.licensePlate}</td>
                                            <td className="text-center"><span className="badge bg-slate-light text-dark border px-2 py-1.5 rounded-2 fw-semibold" style={{ fontSize: '11px', borderColor: '#E2E8F0' }}>{incidentTypeLabel[incident.incidentType] || incident.incidentType}</span></td>
                                            <td style={{ minWidth: '280px' }} className="text-start">
                                                <div className="d-flex align-items-center gap-2">
                                                    {sourceTag}
                                                    <span className="text-dark fw-medium" style={{ fontSize: '13px' }}>{cleanNote || '--'}</span>
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <span className={`badge px-2.5 py-1.5 rounded-2 fw-bold ${incident.status === 'RESOLVED' ? 'bg-green-soft text-green-custom' : 'bg-amber-soft text-amber-custom'}`} style={{ fontSize: '11px' }}>
                                                    {incidentStatusLabel[incident.status] || incident.status}
                                                </span>
                                            </td>
                                            <td className="text-muted text-center" style={{ fontSize: '12.5px' }}>{incident.createdAt || '--'}</td>
                                            <td className="text-center">
                                                {incident.status !== 'RESOLVED' ? (
                                                    <button
                                                        className="btn btn-sm btn-success fw-bold px-2.5 py-1 text-white shadow-sm"
                                                        style={{ fontSize: '11.5px', borderRadius: '6px', backgroundColor: '#10B981', border: 'none' }}
                                                        disabled={loading === `resolve-${incident.incidentId}`}
                                                        onClick={() => resolveIncidentDirectly(incident)}
                                                        title="Nhấn để chuyển ngay sang Đã xử lý"
                                                    >
                                                        {loading === `resolve-${incident.incidentId}` ? (
                                                            <span className="spinner-border spinner-border-sm me-1"></span>
                                                        ) : (
                                                            <i className="fa-solid fa-check me-1"></i>
                                                        )}
                                                        Xác nhận xử lý
                                                    </button>
                                                ) : (
                                                    <span className="text-muted" style={{ fontSize: '11.5px', fontWeight: 500 }}>
                                                        <i className="fa-solid fa-circle-check text-success me-1"></i>Hoàn tất
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {showSlotPicker && (
                <SlotPickerModal
                    slots={allSlots}
                    currentSlotId={wrongSession?.slotId}
                    onSelect={(slot) => { setActualSlot({ slotId: slot.slotId, slotCode: slot.slotCode }); setShowSlotPicker(false); }}
                    onClose={() => setShowSlotPicker(false)}
                />
            )}
        </div>
    );
}

export default Exceptions;

