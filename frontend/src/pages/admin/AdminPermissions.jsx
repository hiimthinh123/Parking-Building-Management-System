// src/pages/admin/AdminPermissions.jsx
import { useState, useEffect, useCallback } from 'react';
import api from '../../config/Api';
import AdminSidebar from '../../components/AdminSidebar';
import { PERMISSION_NAME_BY_KEY } from '../../config/permissions';

// ── Toast thông báo (Đồng bộ mượt mà) ─────────────────────────────────
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

// ── Component Thống Kê & Banner (Đồng bộ y hệt Template mẫu) ──────────────
function PermissionOverview({ roles, counts, permissionsCount }) {
    const STAT_MAP = {
        1: { icon: 'fa-users', color: 'icon-blue', label: 'SYSTEM ADMIN' },
        2: { icon: 'fa-user-tie', color: 'icon-green', label: 'PARKING MANAGER' },
        3: { icon: 'fa-user-gear', color: 'icon-orange', label: 'PARKING STAFF' },
        4: { icon: 'fa-layer-group', color: 'icon-purple', label: 'TOTAL DRIVERS' }
    };

    return (
        <>
            {/* Header Banner */}
            <section className="admin-hero mb-4">
                <div>
                    <span className="admin-eyebrow">
                        <i className="fa-solid fa-shield-halved me-2" />
                        SECURITY & ACCESS MATRIX
                    </span>
                    <h2 className="mb-2">Ma trận phân quyền chức năng</h2>
                    <p className="mb-0">
                        Cấu hình chi tiết quyền hạn truy cập, bật tắt tính năng điều hành cho từng nhóm vai trò trong hệ thống.
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

            {/* 4 Thẻ Thống Kê Đồng Bộ */}
            <div className="row g-3 mb-4">
                {roles.map(role => {
                    const config = STAT_MAP[role.roleId] || { icon: 'fa-user', color: 'icon-blue', label: role.roleName.toUpperCase() };
                    return (
                        <div className="col-12 col-sm-6 col-xl-3" key={role.roleId}>
                            <div className="admin-stat-card">
                                <div className={`admin-stat-icon ${config.color}`}>
                                    <i className={`fa-solid ${config.icon}`} />
                                </div>
                                <div>
                                    <span>{config.label}</span>
                                    <h3>{counts[role.roleId] || 0}</h3>
                                    <small>Tài khoản hiện hành</small>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Ô thứ 4: Thống kê tổng số quyền năng khả dụng */}
                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon icon-purple">
                            <i className="fa-solid fa-unlock-keyhole" />
                        </div>
                        <div>
                            <span>TỔNG CHỨC NĂNG</span>
                            <h3>{permissionsCount}</h3>
                            <small>Quyền hạn đang cấu hình</small>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// ── MAIN PAGE ─────────────────────────────────────────────────
function AdminPermissions() {
    const [roles,       setRoles]       = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [rolePermMap, setRolePermMap] = useState({});
    const [counts,      setCounts]      = useState({ 1: 0, 2: 0, 3: 0, 4: 0 });
    const [loading,     setLoading]     = useState(true);
    const [saving,      setSaving]      = useState(false);
    const [toast,       setToast]       = useState({ msg: '', type: 'success' });

    const showToast  = (msg, type = 'success') => setToast({ msg, type });
    const closeToast = useCallback(() => setToast({ msg: '', type: 'success' }), []);

    // ── Load tất cả dữ liệu từ Backend ──
    useEffect(() => {
        const load = async () => {
            try {
                const [rolesRes, permsRes] = await Promise.all([
                    api.get('/users/roles'),
                    api.get('/users/permissions'),
                ]);
                const rolesData = rolesRes.data;
                const permsData = permsRes.data;

                setRoles(rolesData);
                setPermissions(permsData);

                const mapEntries = await Promise.all(
                    rolesData.map(async (role) => {
                        const res = await api.get(`/users/permissions/role/${role.roleId}`);
                        return [role.roleId, new Set(res.data)];
                    })
                );
                setRolePermMap(Object.fromEntries(mapEntries));

                const countMap = {};
                rolesData.forEach(role => countMap[role.roleId] = 0);

                const usersRes = await api.get('/users');
                usersRes.data.forEach(u => {
                    countMap[u.roleId] = (countMap[u.roleId] || 0) + 1;
                });
                setCounts(countMap);

            } catch (err) {
                console.error(err);
                showToast('Không thể tải dữ liệu ma trận phân quyền.', 'error');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // ── Thay đổi Checkbox cục bộ ──
    const handleToggle = (roleId, permId) => {
        if (roleId === 1) return; // Bảo vệ quyền tối cao của Admin
        setRolePermMap(prev => {
            const updated = { ...prev };
            const set = new Set(updated[roleId] || []);
            set.has(permId) ? set.delete(permId) : set.add(permId);
            updated[roleId] = set;
            return updated;
        });
    };

    // ── Đẩy dữ liệu lưu lên DB ──
    const handleSave = async () => {
        if (!window.confirm('Xác nhận lưu cấu hình phân quyền? Hệ thống sẽ áp dụng ma trận mới ngay lập tức.'))
            return;

        setSaving(true);
        try {
            const editableRoles = roles.filter(r => r.roleId !== 1);
            await Promise.all(
                editableRoles.map(role => {
                    const permIds = [...(rolePermMap[role.roleId] || new Set())];
                    return api.post(`/users/permissions/save/${role.roleId}`, permIds);
                })
            );
            showToast('Lưu cấu hình ma trận phân quyền thành công!');
        } catch {
            showToast('Lưu phân quyền thất bại, vui lòng thử lại!', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => window.location.reload();

    return (
        <div className="d-flex" style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>

            {/* Sử dụng chung hệ thống CSS class từ AdminDashboard template */}
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

                /* Tinh chỉnh riêng Checkbox Ma Trận */
                .matrix-checkbox {
                    width: 1.25rem;
                    height: 1.25rem;
                    border: 1px solid #CBD5E1;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }
                .matrix-checkbox:checked {
                    background-color: #2563EB !important;
                    border-color: #2563EB !important;
                }
                .matrix-checkbox:disabled {
                    background-color: #E2E8F0 !important;
                    border-color: #CBD5E1 !important;
                    cursor: not-allowed;
                    opacity: 0.6;
                }
                
                .btn-submit-tech:hover {
                    background-color: #1E293B !important;
                }
            `}</style>

            <AdminSidebar />
            <Toast msg={toast.msg} type={toast.type} onClose={closeToast} />

            {/* Khối Main Content dịch lề 240px */}
            <div className="main-content flex-grow-1" style={{ minWidth: 0, padding: '24px 32px', marginLeft: '240px' }}>
                <div className="container-fluid px-0">

                    {/* Inject khối Header & Thống kê đồng bộ */}
                    <PermissionOverview roles={roles} counts={counts} permissionsCount={permissions.length} />

                    {/* Khung chứa bảng Ma Trận Phân Quyền */}
                    {loading ? (
                        <div className="admin-panel text-center text-muted py-5">
                            <i className="fa-solid fa-spinner fa-spin me-2" /> Đang tải dữ liệu ma trận bảo mật...
                        </div>
                    ) : (
                        <div className="admin-panel p-4">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <h5 className="mb-1">Cấu hình ma trận chức năng</h5>
                                    <p className="mb-0 text-muted small">Tích chọn để cấp quyền truy cập tính năng tương ứng.</p>
                                </div>
                                <span className="badge bg-light text-secondary border px-2.5 py-1.5 fw-semibold" style={{ fontSize: '12px', borderColor: '#E2E8F0' }}>
                                    Cơ sở dữ liệu Real-time
                                </span>
                            </div>

                            <div className="table-responsive">
                                <table className="table table-bordered align-middle text-center mb-0" style={{ fontSize: '13.5px', borderColor: '#F1F5F9' }}>
                                    <thead className="table-light text-secondary text-uppercase" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>
                                    <tr>
                                        <th className="text-start ps-4 py-3" style={{ width: '40%', borderColor: '#E2E8F0' }}>Phân Hệ / Quyền Chức Năng</th>
                                        {roles.map(role => (
                                            <th key={role.roleId} style={{ width: '15%', borderColor: '#E2E8F0' }}>
                                                {role.roleName}
                                                {role.roleId === 1 && (
                                                    <div className="text-muted fw-normal mt-0.5" style={{ fontSize: '9px', transform: 'scale(0.95)' }}>(Toàn quyền cứng)</div>
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody style={{ fontWeight: 500 }}>
                                    {permissions.map(perm => (
                                        <tr key={perm.permissionId} style={{ height: '50px' }}>
                                            <td className="text-start ps-4 fw-bold text-dark">
                                                <i className={`${perm.icon || 'fa-solid fa-circle'} text-slate-custom opacity-50 me-2.5`} style={{ width: '18px' }} />
                                                {PERMISSION_NAME_BY_KEY[perm.permissionKey] || perm.permissionName}
                                            </td>
                                            {roles.map(role => {
                                                const isAdmin  = role.roleId === 1;
                                                const checked  = (rolePermMap[role.roleId] || new Set()).has(perm.permissionId);
                                                return (
                                                    <td key={role.roleId}>
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input matrix-checkbox"
                                                            checked={checked}
                                                            disabled={isAdmin}
                                                            onChange={() => handleToggle(role.roleId, perm.permissionId)}
                                                        />
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Khu vực điều khiển hành động bên dưới bảng */}
                            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mt-4 pt-2 gap-3">
                                <small className="text-secondary fw-medium" style={{ fontSize: '13px' }}>
                                    <i className="fa-solid fa-circle-info me-1.5 text-blue-custom" />
                                    Mọi thay đổi chỉ có hiệu lực thực tế sau khi nhấn nút áp dụng dữ liệu.
                                </small>
                                <div className="d-flex gap-2">
                                    <button className="btn btn-sm btn-white-custom fw-bold px-3 py-2 border shadow-sm"
                                            onClick={handleReset} disabled={saving} style={{ fontSize: '13px', borderRadius: '8px' }}>
                                        <i className="fa-solid fa-rotate-left me-1.5" /> Khôi phục ban đầu
                                    </button>
                                    <button className="btn btn-dark fw-bold px-4 py-2 shadow-sm transition-all btn-submit-tech"
                                            style={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '8px', fontSize: '13px' }}
                                            onClick={handleSave} disabled={saving}>
                                        <i className="fa-solid fa-floppy-disk me-2" />
                                        {saving ? 'Đang cập nhật DB...' : 'LƯU CẤU HÌNH PHÂN QUYỀN'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminPermissions;
