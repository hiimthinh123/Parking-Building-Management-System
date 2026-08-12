// src/components/GlobalRegisterModal.jsx
import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../config/Api';

function GlobalRegisterModal() {
    const { showRegister, setShowRegister, openLogin } = useContext(AuthContext);
    const [regForm,    setRegForm]    = useState({ username: '', passwordHash: '', fullName: '', phoneNumber: '', email: '' });
    const [regError,   setRegError]   = useState('');
    const [regSuccess, setRegSuccess] = useState('');
    const [regLoading, setRegLoading] = useState(false);

    if (!showRegister) return null;

    const handleClose = () => {
        setShowRegister(false);
        setRegError('');
        setRegSuccess('');
        setRegForm({ username: '', passwordHash: '', fullName: '', phoneNumber: '', email: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setRegError(''); setRegSuccess('');

        const trimmedUsername = regForm.username.trim();
        const trimmedEmail = regForm.email.trim();
        const trimmedPhone = regForm.phoneNumber.trim();
        const trimmedFullName = regForm.fullName.trim();

        if (trimmedUsername.length < 3 || trimmedUsername.length > 50) {
            setRegError('Tên đăng nhập phải từ 3 đến 50 ký tự.');
            return;
        }
        if (regForm.passwordHash.length < 6) {
            setRegError('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            setRegError('Email không đúng định dạng!');
            return;
        }
        if (trimmedPhone && !/^0\d{9}$/.test(trimmedPhone)) {
            setRegError('Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.');
            return;
        }

        setRegLoading(true);
        try {
            const res = await api.post('/users/register', {
                username: trimmedUsername,
                passwordHash: regForm.passwordHash,
                email: trimmedEmail,
                fullName: trimmedFullName,
                phoneNumber: trimmedPhone,
                roleId: 4
            });
            if (res.data === true) {
                setRegSuccess('Đăng ký thành công! Đang chuyển sang đăng nhập...');
                setRegForm({ username: '', passwordHash: '', fullName: '', phoneNumber: '', email: '' });
                setTimeout(() => {
                    handleClose();
                    openLogin();
                }, 1800);
            } else {
                setRegError('Tên đăng nhập, email hoặc số điện thoại đã được sử dụng.');
            }
        } catch (err) {
            setRegError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        } finally {
            setRegLoading(false);
        }
    };

    const inputStyle = {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: 10,
        color: '#FFFFFF'
    };

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 3000 }}>
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '450px' }}>
                <div className="modal-content border-0 p-3 shadow-lg" style={{
                    borderRadius: '20px',
                    backgroundImage: `linear-gradient(145deg, rgba(15, 23, 42, 0.5), rgba(30, 41, 59, 0.92)), url('/parking_bg.jpg')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 30px rgba(37, 99, 235, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#F8FAFC'
                }}>
                    <div className="modal-header border-0 pb-0">
                        <h4 className="modal-title fw-bold text-white d-flex align-items-center">
                            <i className="fa-solid fa-user-plus me-2" style={{ color: '#60A5FA' }}></i>TẠO TÀI KHOẢN
                        </h4>
                        <button type="button" className="btn-close btn-close-white" onClick={handleClose}></button>
                    </div>
                    <div className="modal-body px-4 pb-3">
                        {regError   && <div className="alert alert-danger  p-2 mb-3 small fw-bold text-center" style={{ borderRadius: 10 }}>{regError}</div>}
                        {regSuccess && <div className="alert alert-success p-2 mb-3 small fw-bold text-center" style={{ borderRadius: 10 }}>{regSuccess}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label fw-semibold fs-6" style={{ color: '#94A3B8' }}>Tên đăng nhập *</label>
                                <input type="text" className="form-control py-2 fs-6 text-white" placeholder="vd: nguyenvana" required
                                       style={inputStyle}
                                       value={regForm.username} onChange={e => setRegForm(p => ({ ...p, username: e.target.value }))} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold fs-6" style={{ color: '#94A3B8' }}>Email *</label>
                                <input type="email" className="form-control py-2 fs-6 text-white" placeholder="email@example.com" required
                                       style={inputStyle}
                                       value={regForm.email} onChange={e => setRegForm(p => ({ ...p, email: e.target.value }))} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold fs-6" style={{ color: '#94A3B8' }}>Mật khẩu *</label>
                                <input type="password" className="form-control py-2 fs-6 text-white" placeholder="Ít nhất 6 ký tự" required minLength={6}
                                       style={inputStyle}
                                       value={regForm.passwordHash} onChange={e => setRegForm(p => ({ ...p, passwordHash: e.target.value }))} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold fs-6" style={{ color: '#94A3B8' }}>Họ và tên</label>
                                <input type="text" className="form-control py-2 fs-6 text-white" placeholder="Nguyễn Văn A"
                                       style={inputStyle}
                                       value={regForm.fullName} onChange={e => setRegForm(p => ({ ...p, fullName: e.target.value }))} />
                            </div>
                            <div className="mb-4">
                                <label className="form-label fw-semibold fs-6" style={{ color: '#94A3B8' }}>Số điện thoại</label>
                                <input type="tel" className="form-control py-2 fs-6 text-white" placeholder="09xxxxxxxx" maxLength={10}
                                       style={inputStyle}
                                       value={regForm.phoneNumber} onChange={e => setRegForm(p => ({ ...p, phoneNumber: e.target.value }))} />
                            </div>
                            <button type="submit" className="btn text-white w-100 py-2.5 fw-bold fs-6 shadow"
                                    style={{
                                        background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                                        border: 'none',
                                        borderRadius: 10,
                                        boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)'
                                    }} disabled={regLoading}>
                                {regLoading ? <><i className="fa-solid fa-spinner fa-spin me-2"></i>Đang xử lý...</> : 'TẠO TÀI KHOẢN'}
                            </button>
                            <div className="text-center mt-3 small" style={{ color: '#CBD5E1' }}>
                                Đã có tài khoản?{' '}
                                <button type="button" className="btn btn-link p-0 small fw-bold text-decoration-none" style={{ color: '#60A5FA' }}
                                        onClick={() => { handleClose(); openLogin(); }}>
                                    Đăng nhập
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GlobalRegisterModal;