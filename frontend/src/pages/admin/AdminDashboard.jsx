// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import api from '../../config/Api';
import AdminSidebar from '../../components/AdminSidebar';

// ── Role badge màu theo roleId (Nâng cấp sang hệ màu Soft) ──────────────────
const ROLE_BADGE = {
    1: 'bg-blue-soft text-blue-custom',
    2: 'bg-slate-soft text-slate-custom',
    3: 'bg-amber-soft text-amber-custom',
    4: 'bg-red-soft text-red-custom',
};

// ── Toast thông báo (Tinh chỉnh UI mượt mà) ─────────────────────────────────
function Toast({ msg, type, onClose }) {
    useEffect(() => {
        if (!msg) return;
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [msg, onClose]);

    if (!msg) return null;
    return (
        <div className={`alert border-0 shadow-lg alert-dismissible fw-medium ${type === 'success' ? 'bg-green-soft text-green-custom' : 'bg-red-soft text-red-custom'}`}
             style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, minWidth: 320, borderRadius: '8px' }}>
            <i className={`fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-xmark'} me-2`} />
            {msg}
            <button type="button" className="btn-close" onClick={onClose} />
        </div>
    );
}

// ── Modal Tạo/Sửa tài khoản (Đồng bộ UI Soft-Tech) ─────────────────────────
function UserModal({ mode, user, roles, onClose, onSaved }) {
    const isEdit = mode === 'edit';
    const [form, setForm] = useState(
        isEdit
            ? { fullName: user.fullName || '', phoneNumber: user.phoneNumber || '', email: user.email || '', roleId: user.roleId }
            : { username: '', passwordHash: '', fullName: '', phoneNumber: '', email: '', roleId: '' }
    );
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState('');

    const handleChange = (e) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isEdit) {
                const res = await api.put(`/users/update/${user.userId}`, { ...form, roleId: Number(form.roleId) });
                if (!res.data) throw new Error('Cập nhật thất bại.');
                onSaved('Cập nhật tài khoản thành công!');
            } else {
                const res = await api.post('/users/create', { ...form, roleId: Number(form.roleId) });
                if (!res.data) throw new Error('Tạo tài khoản thất bại (có thể tên đăng nhập đã tồn tại).');
                onSaved('Tạo tài khoản thành công!');
            }
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Đã xảy ra lỗi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal show d-block" style={{ background: 'rgba(15,23,42,0.5)', zIndex: 1060, backdropFilter: 'blur(3px)' }} onClick={onClose}>
            <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
                <div className="modal-content border shadow-lg p-2 bg-white" style={{ borderRadius: 12, borderColor: '#E2E8F0' }}>
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-bold text-dark" style={{ fontSize: '16px' }}>
                            <i className={`fa-solid ${isEdit ? 'fa-pen-to-square text-blue-custom' : 'fa-user-plus text-green-custom'} me-2`} />
                            {isEdit ? 'Chỉnh Sửa Tài Khoản' : 'Thêm Tài Khoản Mới'}
                        </h5>
                        <button className="btn-close" onClick={onClose} />
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body px-4 pb-2">
                            {error && <div className="alert bg-red-soft text-red-custom border-0 py-2 small fw-medium mb-3">{error}</div>}

                            {!isEdit && (
                                <div className="row g-3 mb-3">
                                    <div className="col-6">
                                        <label className="form-label small fw-bold text-slate-custom">Tên đăng nhập <span className="text-red-custom">*</span></label>
                                        <input name="username" value={form.username} onChange={handleChange}
                                               required className="form-control shadow-sm" style={{ borderColor: '#E2E8F0' }} placeholder="vd: john_doe" />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small fw-bold text-slate-custom">Mật khẩu <span className="text-red-custom">*</span></label>
                                        <input name="passwordHash" type="password" value={form.passwordHash}
                                               onChange={handleChange} required minLength={6}
                                               className="form-control shadow-sm" style={{ borderColor: '#E2E8F0' }} placeholder="Ít nhất 6 ký tự" />
                                    </div>
                                </div>
                            )}

                            {isEdit && (
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-slate-custom">Tên đăng nhập</label>
                                    <input value={user.username} readOnly
                                           className="form-control bg-slate-light text-muted border" style={{ cursor: 'not-allowed', borderColor: '#E2E8F0' }} />
                                </div>
                            )}

                            <div className="mb-3">
                                <label className="form-label small fw-bold text-slate-custom">Họ và Tên</label>
                                <input name="fullName" value={form.fullName} onChange={handleChange}
                                       className="form-control shadow-sm" style={{ borderColor: '#E2E8F0' }} placeholder="Nguyễn Văn A" />
                            </div>

                            <div className="row g-3 mb-3">
                                <div className="col-6">
                                    <label className="form-label small fw-bold text-slate-custom">Số điện thoại</label>
                                    <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange}
                                           maxLength={10} className="form-control shadow-sm" style={{ borderColor: '#E2E8F0' }} placeholder="0901234567" />
                                </div>
                                <div className="col-6">
                                    <label className="form-label small fw-bold text-slate-custom">Email</label>
                                    <input name="email" type="email" value={form.email} onChange={handleChange}
                                           className="form-control shadow-sm" style={{ borderColor: '#E2E8F0' }} placeholder="email@example.com" />
                                </div>
                            </div>

                            <div className="mb-2">
                                <label className="form-label small fw-bold text-slate-custom">Vai trò <span className="text-red-custom">*</span></label>
                                <select name="roleId" value={form.roleId} onChange={handleChange} required className="form-select shadow-sm" style={{ borderColor: '#E2E8F0' }}>
                                    <option value="">— Chọn vai trò —</option>
                                    {roles.map(r => (
                                        <option key={r.roleId} value={r.roleId}>{r.roleName}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="modal-footer border-0 pt-3">
                            <button type="button" className="btn btn-sm fw-bold border text-secondary px-3 btn-white-custom" onClick={onClose} style={{ borderRadius: '6px' }}>Hủy</button>
                            <button type="submit" disabled={loading}
                                    className="btn btn-sm fw-bold px-3 text-white transition-all shadow-sm btn-submit-tech"
                                    style={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '6px' }}>
                                <i className={`fa-solid ${isEdit ? 'fa-save' : 'fa-check'} me-1`} />
                                {loading ? 'Đang xử lý...' : isEdit ? 'LƯU THAY ĐỔI' : 'TẠO TÀI KHOẢN'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
function AdminOverview({ users, roles, onCreateUser }) {
    const totalUsers = users.length;
    const activeUsers = users.filter(
        u => u.status === 1 || u.status === true
    ).length;
    const lockedUsers = totalUsers - activeUsers;

    const roleCount = roles.map(role => ({
        ...role,
        total: users.filter(user => user.roleId === role.roleId).length,
    }));

    const maxRoleCount = Math.max(...roleCount.map(r => r.total), 1);

    return (
        <>
            <section className="admin-hero mb-4">
                <div>
                    <span className="admin-eyebrow">
                        <i className="fa-solid fa-shield-halved me-2" />
                        SYSTEM ADMINISTRATION
                    </span>
                    <h2 className="mb-2">Trung tâm quản trị hệ thống</h2>
                    <p className="mb-0">
                        Theo dõi tài khoản, kiểm soát quyền truy cập và bảo đảm
                        hệ thống vận hành ổn định.
                    </p>
                </div>

                <div className="admin-hero-badge">
                    <i className="fa-solid fa-circle-check" />
                    <div>
                        <small>Trạng thái hệ thống</small>
                        <strong>Đang hoạt động</strong>
                    </div>
                </div>
            </section>

            <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon icon-blue">
                            <i className="fa-solid fa-users" />
                        </div>
                        <div>
                            <span>TỔNG TÀI KHOẢN</span>
                            <h3>{totalUsers}</h3>
                            <small>Toàn hệ thống</small>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon icon-green">
                            <i className="fa-solid fa-user-check" />
                        </div>
                        <div>
                            <span>ĐANG HOẠT ĐỘNG</span>
                            <h3>{activeUsers}</h3>
                            <small className="text-success">
                                {totalUsers
                                    ? Math.round((activeUsers / totalUsers) * 100)
                                    : 0}
                                % tổng tài khoản
                            </small>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon icon-orange">
                            <i className="fa-solid fa-user-lock" />
                        </div>
                        <div>
                            <span>TẠM KHÓA</span>
                            <h3>{lockedUsers}</h3>
                            <small>Cần được kiểm tra</small>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon icon-purple">
                            <i className="fa-solid fa-layer-group" />
                        </div>
                        <div>
                            <span>NHÓM QUYỀN</span>
                            <h3>{roles.length}</h3>
                            <small>Vai trò đang cấu hình</small>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-3 mb-4">
                <div className="col-xl-7">
                    <div className="admin-panel h-100">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h5 className="mb-1">Phân bố tài khoản theo vai trò</h5>
                                <p className="mb-0 text-muted small">
                                    Tổng quan quyền truy cập trong hệ thống.
                                </p>
                            </div>
                            <i className="fa-solid fa-chart-pie text-primary fs-4" />
                        </div>

                        {roleCount.map((role, index) => {
                            const colors = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6'];
                            const color = colors[index % colors.length];
                            const percent = Math.round((role.total / maxRoleCount) * 100);

                            return (
                                <div className="mb-3" key={role.roleId}>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="fw-semibold text-dark">
                                            {role.roleName}
                                        </span>
                                        <span className="text-muted small">
                                            {role.total} tài khoản
                                        </span>
                                    </div>
                                    <div className="progress role-progress">
                                        <div
                                            className="progress-bar"
                                            style={{
                                                width: `${percent}%`,
                                                backgroundColor: color,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="col-xl-5">
                    <div className="admin-panel quick-actions h-100">
                        <h5 className="mb-1">Thao tác nhanh</h5>
                        <p className="text-muted small mb-3">
                            Các tác vụ quản trị thường dùng.
                        </p>

                        <button
                            className="quick-action"
                            onClick={onCreateUser}
                        >
                            <span className="quick-action-icon bg-primary-subtle text-primary">
                                <i className="fa-solid fa-user-plus" />
                            </span>
                            <span>
                                <strong>Tạo tài khoản mới</strong>
                                <small>Thêm người dùng vào hệ thống</small>
                            </span>
                            <i className="fa-solid fa-arrow-right ms-auto text-muted" />
                        </button>

                        <a href="/admin/permissions" className="quick-action text-decoration-none">
                            <span className="quick-action-icon bg-success-subtle text-success">
                                <i className="fa-solid fa-shield-halved" />
                            </span>
                            <span>
                                <strong>Thiết lập phân quyền</strong>
                                <small>Cấu hình quyền theo từng vai trò</small>
                            </span>
                            <i className="fa-solid fa-arrow-right ms-auto text-muted" />
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
// ── MAIN PAGE ───────────────────────────────────────────────
function AdminDashboard() {
    const [users,      setUsers]      = useState([]);
    const [roles,      setRoles]      = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [modal,      setModal]      = useState(null);
    const [toast,      setToast]      = useState({ msg: '', type: 'success' });

    const showToast = (msg, type = 'success') => setToast({ msg, type });
    const closeToast = useCallback(() => setToast({ msg: '', type: 'success' }), []);

    const fetchUsers = useCallback(async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch {
            showToast('Không thể tải danh sách tài khoản.', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
        api.get('/users/roles')
            .then(res => setRoles(res.data))
            .catch(() => {});
    }, [fetchUsers]);

    const handleToggleStatus = async (user) => {
        const isActive = user.status === 1 || user.status === true;
        const action = isActive ? 'Khóa' : 'Mở khóa';
        if (!window.confirm(`${action} tài khoản "${user.username}"?`)) return;
        try {
            const res = await api.patch(`/users/toggle-status/${user.userId}`);
            if (!res.data) throw new Error();
            showToast('Đã cập nhật trạng thái tài khoản.');
            fetchUsers();
        } catch {
            showToast('Cập nhật trạng thái thất bại.', 'error');
        }
    };

    const handleDelete = async (user) => {
        if (!window.confirm(`Xóa tài khoản "${user.username}"? Hành động này không thể hoàn tác!`)) return;
        try {
            const res = await api.delete(`/users/delete/${user.userId}`);
            if (!res.data) throw new Error();
            showToast('Đã xóa tài khoản.');
            fetchUsers();
        } catch {
            showToast('Xóa thất bại! Tài khoản có dữ liệu liên quan.', 'error');
        }
    };

    const handleSaved = (msg) => {
        showToast(msg);
        fetchUsers();
    };

    const getRoleName = (user) => {
        if (user.roleName) return user.roleName;
        const r = roles.find(r => r.roleId === user.roleId);
        return r ? r.roleName : `Role ${user.roleId}`;
    };

    const filtered = users.filter(u => {
        const kw = searchTerm.toLowerCase();
        return (
            (u.username  || '').toLowerCase().includes(kw) ||
            (u.fullName  || '').toLowerCase().includes(kw) ||
            (u.phoneNumber || '').toLowerCase().includes(kw) ||
            (u.email     || '').toLowerCase().includes(kw)
        );
    });

    return (
        <div className="d-flex" style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>

            {/* Inject CSS custom đồng bộ bộ màu Soft phẳng */}
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
                .bg-slate-light { background-color: #F8FAFC !important; }

                /* Thao tác hover nút bấm */
                .btn-white-custom {
                    background-color: #FFFFFF;
                    border-color: #E2E8F0 !important;
                    color: #475569 !important;
                }
                .btn-white-custom:hover {
                    background-color: #F1F5F9;
                }
                .btn-submit-tech:hover {
                    background-color: #1E293B !important;
                }
                .admin-hero {
    background:
        radial-gradient(circle at top right, rgba(59, 130, 246, .34), transparent 32%),
        linear-gradient(120deg, #0F172A, #1E3A5F);
    color: white;
    padding: 30px 32px;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    box-shadow: 0 18px 40px rgba(15, 23, 42, .18);
}

.admin-eyebrow {
    color: #93C5FD;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1.2px;
}

.admin-hero h2 {
    color: white;
    font-size: 26px;
    font-weight: 800;
    margin-top: 8px;
}

.admin-hero p {
    color: #CBD5E1;
    font-size: 14px;
}

.admin-hero-badge {
    min-width: 180px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px 16px;
    border: 1px solid rgba(255,255,255,.16);
    border-radius: 12px;
    background: rgba(255,255,255,.10);
}

.admin-hero-badge i {
    color: #4ADE80;
    font-size: 22px;
}

.admin-hero-badge small,
.admin-hero-badge strong {
    display: block;
}

.admin-hero-badge small {
    color: #CBD5E1;
    font-size: 11px;
}

.admin-hero-badge strong {
    font-size: 13px;
}

.admin-stat-card,
.admin-panel {
    background: #FFF;
    border: 1px solid #E2E8F0;
    border-radius: 16px;
    box-shadow: 0 8px 22px rgba(15, 23, 42, .04);
}

.admin-stat-card {
    height: 100%;
    min-height: 128px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 15px;
    transition: transform .2s ease, box-shadow .2s ease;
}

.admin-stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 30px rgba(15, 23, 42, .10);
}

.admin-stat-icon {
    width: 48px;
    height: 48px;
    display: grid;
    place-items: center;
    border-radius: 14px;
    font-size: 20px;
}

.icon-blue { background: #DBEAFE; color: #2563EB; }
.icon-green { background: #DCFCE7; color: #16A34A; }
.icon-orange { background: #FEF3C7; color: #D97706; }
.icon-purple { background: #EDE9FE; color: #7C3AED; }

.admin-stat-card span {
    display: block;
    color: #64748B;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .65px;
}

.admin-stat-card h3 {
    margin: 2px 0;
    color: #0F172A;
    font-size: 27px;
    font-weight: 800;
}

.admin-stat-card small {
    color: #94A3B8;
    font-size: 11px;
}

.admin-panel {
    padding: 22px;
}

.admin-panel h5 {
    color: #0F172A;
    font-weight: 750;
    font-size: 16px;
}

.role-progress {
    height: 8px;
    border-radius: 99px;
    background: #EEF2F7;
}

.role-progress .progress-bar {
    border-radius: 99px;
    transition: width .5s ease;
}

.quick-action {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px 4px;
    border: 0;
    border-bottom: 1px solid #F1F5F9;
    background: transparent;
    text-align: left;
    color: #0F172A;
}

.quick-action:hover strong {
    color: #2563EB;
}

.quick-action-icon {
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    border-radius: 11px;
}

.quick-action strong,
.quick-action small {
    display: block;
}

.quick-action strong {
    font-size: 13px;
}

.quick-action small {
    color: #94A3B8;
    font-size: 11px;
}

@media (max-width: 768px) {
    .admin-hero {
        padding: 24px;
        align-items: flex-start;
        flex-direction: column;
    }

    .admin-hero-badge {
        width: 100%;
    }
}
            `}</style>

            <AdminSidebar />
            <Toast msg={toast.msg} type={toast.type} onClose={closeToast} />

            {/* Dịch lề trái 240px khớp chuẩn hệ thống AdminSidebar */}
            <div className="main-content flex-grow-1" style={{ minWidth: 0, padding: '24px 32px', marginLeft: '240px' }}>
                <div className="container-fluid px-0">

                    {/* Header */}
                    <AdminOverview users={users} roles={roles} onCreateUser={() => setModal({ mode: 'create' })} />

                    {/* Thanh công cụ tìm kiếm và Thêm mới */}
                    <div className="d-flex justify-content-between align-items-center mb-4 gap-3">
                        <div className="input-group shadow-sm rounded-3 overflow-hidden" style={{ maxWidth: 350 }}>
                            <span className="input-group-text bg-white border-end-0 text-muted" style={{ borderColor: '#E2E8F0' }}>
                                <i className="fa-solid fa-magnifying-glass" />
                            </span>
                            <input type="text" className="form-control border-start-0 border ps-0 py-2"
                                   style={{ borderColor: '#E2E8F0', fontSize: '13.5px' }}
                                   placeholder="Tìm kiếm tài khoản, tên, SĐT..."
                                   value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <button id="add-user-btn" className="btn btn-dark fw-bold px-3 py-2 shadow-sm d-flex align-items-center transition-all btn-submit-tech"
                                style={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '8px', fontSize: '13px' }}
                                onClick={() => setModal({ mode: 'create' })}>
                            <i className="fa-solid fa-plus me-2" /> THÊM TÀI KHOẢN MỚI
                        </button>
                    </div>

                    {/* Bảng Dữ Liệu */}
                    <div className="card shadow-sm border p-4 bg-white rounded-3" style={{ borderColor: '#E2E8F0' }}>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0 text-center" style={{ fontSize: '13.5px' }}>
                                <thead className="table-light text-uppercase text-secondary"
                                       style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>
                                <tr>
                                    <th className="py-2.5 style-th-id">ID</th>
                                    <th className="text-start">Username</th>
                                    <th>Họ và Tên</th>
                                    <th>Vai trò</th>
                                    <th>Số điện thoại</th>
                                    <th>Email</th>
                                    <th>Ngày Tạo</th>
                                    <th>Trạng Thái</th>
                                    <th className="text-end pe-3">Thao tác</th>
                                </tr>
                                </thead>
                                <tbody style={{ fontWeight: 500 }}>
                                {loading ? (
                                    <tr>
                                        <td colSpan={9} className="text-center text-muted py-5">
                                            <i className="fa-solid fa-spinner fa-spin me-2" /> Đang tải danh sách...
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="text-center text-muted py-5">
                                            <i className="fa-solid fa-users-slash d-block mb-2"
                                               style={{ fontSize: '1.8rem', opacity: 0.3 }} />
                                            Không tìm thấy tài khoản nào phù hợp trên cơ sở dữ liệu.
                                        </td>
                                    </tr>
                                ) : filtered.map(u => {
                                    const isActive = u.status === 1 || u.status === true;

                                    return (
                                        <tr key={u.userId} style={{ height: '52px' }}>
                                            <td className="text-muted">#{u.userId}</td>
                                            <td className="text-start"><strong>{u.username}</strong></td>
                                            <td className="text-dark">{u.fullName || '—'}</td>
                                            <td>
                                                    <span className={`badge px-2.5 py-1.5 rounded-2 fw-bold ${ROLE_BADGE[u.roleId] || 'bg-slate-soft text-slate-custom'}`} style={{ fontSize: '11px' }}>
                                                        {getRoleName(u)}
                                                    </span>
                                            </td>
                                            <td className="text-dark">{u.phoneNumber || '—'}</td>
                                            <td className="text-muted" style={{ fontSize: '13px' }}>{u.email || '—'}</td>
                                            <td className="text-muted" style={{ fontSize: '12.5px' }}>
                                                {u.createdAt ? u.createdAt.substring(0, 10) : '—'}
                                            </td>
                                            <td>
                                                    <span className={`badge px-2.5 py-1.5 rounded-2 fw-bold ${isActive
                                                        ? 'bg-green-soft text-green-custom'
                                                        : 'bg-red-soft text-red-custom'}`} style={{ fontSize: '11px' }}>
                                                        {isActive ? 'Hoạt động' : 'Bị Khóa'}
                                                    </span>
                                            </td>
                                            <td className="text-end pe-3">
                                                <div className="btn-group gap-1">
                                                    <button className="btn btn-sm btn-light border-0 text-slate-custom"
                                                            title="Sửa thông tin" onClick={() => setModal({ mode: 'edit', user: u })}>
                                                        <i className="fa-solid fa-pen-to-square" />
                                                    </button>
                                                    <button className="btn btn-sm btn-light border-0"
                                                            title={isActive ? 'Khóa tài khoản' : 'Mở khóa'}
                                                            onClick={() => handleToggleStatus(u)}>
                                                        <i className={`fa-solid ${isActive ? 'fa-lock text-red-custom' : 'fa-lock-open text-green-custom'}`} />
                                                    </button>
                                                    <button className="btn btn-sm btn-light border-0"
                                                            title="Xóa tài khoản" onClick={() => handleDelete(u)}>
                                                        <i className="fa-solid fa-trash-can text-red-custom" />
                                                    </button>
                                                </div>
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

            {modal && (
                <UserModal mode={modal.mode} user={modal.user} roles={roles}
                           onClose={() => setModal(null)} onSaved={handleSaved} />
            )}
        </div>
    );
}

export default AdminDashboard;
