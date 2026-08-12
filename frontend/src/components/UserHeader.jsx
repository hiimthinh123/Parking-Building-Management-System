import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../config/Api';
import { getGuestProfile, saveGuestProfile } from '../utils/guestIdentity';

function ProfileModal({ user, onClose }) {
    const { updateCurrentUser } = useContext(AuthContext);
    const guest = !user;
    const [form, setForm] = useState(() => {
        const profile = guest ? getGuestProfile() : user;
        return { fullName: profile.fullName || profile.guestName || '', phoneNumber: profile.phoneNumber || profile.guestPhone || '', email: profile.email || '', passwordHash: '' };
    });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const save = async (event) => {
        event.preventDefault();
        setError('');
        if (!form.fullName.trim() || !form.phoneNumber.trim() || !form.email.trim()) {
            setError('Vui lòng nhập đầy đủ tên, số điện thoại và email.');
            return;
        }
        setSaving(true);
        try {
            if (guest) {
                saveGuestProfile({ guestName: form.fullName.trim(), guestPhone: form.phoneNumber.trim(), email: form.email.trim(), passwordHash: form.passwordHash || undefined });
            } else {
                const response = await api.put(`/users/profile/${user.userId}`, form);
                updateCurrentUser({ ...user, ...response.data });
            }
            onClose();
        } catch (err) {
            setError(err.response?.data || 'Cập nhật thông tin thất bại.');
        } finally {
            setSaving(false);
        }
    };

    return <div className="modal d-block user-profile-modal" onClick={onClose}>
        <div className="modal-dialog modal-dialog-centered" onClick={(event) => event.stopPropagation()}>
            <form className="modal-content border-0 shadow-lg" style={{ borderRadius: 16 }} onSubmit={save}>
                <div className="modal-header border-0 pb-0">
                    <h5 className="modal-title fw-bold"><i className="fa-solid fa-user-pen me-2 text-primary" />Thông tin cá nhân</h5>
                    <button type="button" className="btn-close" onClick={onClose} aria-label="Đóng" />
                </div>
                <div className="modal-body pt-3">
                    {error && <div className="alert alert-danger py-2 small">{error}</div>}
                    <div className="mb-3"><label className="form-label fw-semibold">Tên hiển thị</label><input className="form-control" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></div>
                    <div className="mb-3"><label className="form-label fw-semibold">Số điện thoại</label><input type="tel" className="form-control" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} required /></div>
                    <div className="mb-3"><label className="form-label fw-semibold">Email</label><input type="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
                    <div><label className="form-label fw-semibold">Mật khẩu mới</label><input type="password" className="form-control" minLength="6" placeholder="Để trống nếu không đổi" value={form.passwordHash} onChange={(e) => setForm({ ...form, passwordHash: e.target.value })} /></div>
                </div>
                <div className="modal-footer border-0 pt-0">
                    <button type="button" className="btn btn-light" onClick={onClose}>Hủy</button>
                    <button className="btn btn-primary fw-bold" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
                </div>
            </form>
        </div>
    </div>;
}

function UserHeader() {
    const { user, logout, openLogin, openRegister } = useContext(AuthContext);
    const navigate = useNavigate();
    const [showAuthMenu, setShowAuthMenu] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('USER_THEME') === 'dark');

    useEffect(() => {
        document.body.classList.toggle('user-dark-mode', darkMode);
        localStorage.setItem('USER_THEME', darkMode ? 'dark' : 'light');
        return () => document.body.classList.remove('user-dark-mode');
    }, [darkMode]);

    return <>
        <nav className="sticky-top shadow-md" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="d-flex justify-content-between align-items-center position-relative py-3.5 px-4 px-md-5">
                <div className="d-flex align-items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="d-flex align-items-center justify-content-center rounded-3 bg-primary text-white p-2 shadow-sm" style={{ width: 50, height: 70, background: 'linear-gradient(135deg, #2563EB, #1D4ED8)' }}>
                        <i className="fa-solid fa-square-parking fs-3" />
                    </div>
                    <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <span className="badge rounded-pill bg-success text-white px-2.5 py-1" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                                <i className="fa-solid fa-circle me-1" style={{ fontSize: '6px' }} />SMART PARKING
                            </span>
                        </div>
                        <h4 className="fw-extrabold text-white m-0" style={{ fontSize: '21px', letterSpacing: '0.5px', fontStyle: 'oblique' }}>PARKING BUILDING PORTAL</h4>
                    </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                    <button className="btn rounded-circle user-theme-toggle d-flex align-items-center justify-content-center" type="button" style={{ width: 40, height: 40 }} title={darkMode ? 'Giao diện sáng' : 'Giao diện tối'} onClick={() => setDarkMode(!darkMode)}>
                        <i className={`fa-solid ${darkMode ? 'fa-sun text-warning fs-5' : 'fa-moon text-white fs-5'}`} />
                    </button>

                    {!user ? <div className="dropdown position-relative">
                        <button className="btn dropdown-toggle fw-bold py-2.5 px-4 text-white rounded-3 d-flex align-items-center gap-2 shadow-sm" onClick={() => setShowAuthMenu(!showAuthMenu)} style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', fontSize: '15px' }}>
                            <i className="fa-solid fa-right-to-bracket" style={{ color: '#60A5FA'}} />Đăng Nhập / Đăng Ký
                        </button>
                        <ul className={`dropdown-menu p-3 shadow-lg border-0 mt-2 ${showAuthMenu ? 'show' : ''}`} style={{ minWidth: '320px', right: 0, left: 'auto', borderRadius: 16}}>
                            <li className="d-flex align-items-center gap-2.5 mb-3 pb-2 border-bottom">
                                <div className="rounded-circle bg-primary-subtle text-primary p-2 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 38, height: 38 }}>
                                    <i className="fa-solid fa-user-shield fs-5" />
                                </div>
                                <div>
                                    <div className="fw-bold text-dark ms-2" style={{ fontSize: '14px', lineHeight: '1.2'}}>Tài Khoản Tài Xế</div>
                                    <div className="text-muted mt-0.5 ms-2" style={{ fontSize: '11.5px' }}>Đăng nhập để xem vị trí & đặt chỗ</div>
                                </div>
                            </li>
                            <li className="d-flex gap-2 mb-2">
                                <button className="btn btn-primary w-50 fw-bold py-2.5 d-flex align-items-center justify-content-center gap-1.5 shadow-sm" 
                                        style={{ borderRadius: 10, fontSize: '13px', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', border: 'none', gap: '4px' }}
                                        onClick={() => { setShowAuthMenu(false); openLogin(); }}>
                                    <i className="fa-solid fa-right-to-bracket" /> ĐĂNG NHẬP
                                </button>
                                <button className="btn btn-outline-primary w-50 fw-bold py-2.5 d-flex align-items-center justify-content-center gap-1.5" 
                                        style={{ borderRadius: 10, fontSize: '13px', gap: '4px'}}
                                        onClick={() => { setShowAuthMenu(false); openRegister(); }}>
                                    <i className="fa-solid fa-user-plus" /> ĐĂNG KÝ
                                </button>
                            </li>
                        </ul>
                    </div> : <div className="dropdown position-relative">
                        <button className="btn btn-link text-decoration-none dropdown-toggle p-0 d-flex flex-column align-items-end" onClick={() => setShowUserMenu(!showUserMenu)}>
                            <span className="fw-semibold" style={{ fontSize: '0.85rem', color: '#94A3B8' }}><i className="fa-regular fa-circle-user me-1 text-info" />{user.roleName || 'Tài xế'}</span>
                            <span className="fw-bold text-white" style={{ fontSize: '1.1rem' }}>{user.fullName}</span>
                        </button>
                        <ul className={`dropdown-menu dropdown-menu-end shadow-lg border-0 p-2 mt-2 ${showUserMenu ? 'show' : ''}`} style={{ minWidth: '200px', right: 0, left: 'auto', borderRadius: 14 }}>
                            <li>
                                <button className="dropdown-item py-2 fw-semibold" onClick={() => { setShowUserMenu(false); setShowProfile(true); }}>
                                    <i className="fa-solid fa-user-pen me-2 text-primary" />Thông tin cá nhân
                                </button>
                            </li>
                            <li><hr className="dropdown-divider my-1" /></li>
                            <li>
                                <button onClick={() => { setShowUserMenu(false); logout(); navigate('/'); }} className="dropdown-item py-2 text-danger fw-bold">
                                    <i className="fa-solid fa-arrow-right-from-bracket me-2" />Đăng xuất
                                </button>
                            </li>
                        </ul>
                    </div>}
                </div>
            </div>
        </nav>
        {showProfile && <ProfileModal user={user} onClose={() => setShowProfile(false)} />}
    </>;
}

export default UserHeader;
