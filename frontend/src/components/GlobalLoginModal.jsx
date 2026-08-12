// src/components/GlobalLoginModal.jsx
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../context/AuthContext';
import api from '../config/Api';

function GlobalLoginModal() {
    const { showLogin, setShowLogin, login, loginWithGoogleContext, openRegister } = useContext(AuthContext);
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginErr, setLoginErr] = useState('');
    const [loading, setLoading] = useState(false);

    if (!showLogin) return null;

    const handleClose = () => {
        setShowLogin(false);
        setUsername('');
        setPassword('');
        setLoginErr('');
    };

    const redirectByRole = (roleId) => {
        if (roleId === 1) navigate('/admin/dashboard');
        else if (roleId === 2) navigate('/manager/dashboard');
        else if (roleId === 3) navigate('/staff/dashboard');
        else navigate('/');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoginErr('');
        setLoading(true);
        try {
            const roleId = await login(username, password);
            handleClose();
            redirectByRole(roleId);
        } catch {
            setLoginErr('Tên đăng nhập hoặc mật khẩu không chính xác!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 3000 }}>
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '450px' }}>
                <div className="modal-content border-0 p-3 shadow-lg" style={{
                    borderRadius: '20px',
                    backgroundImage: `linear-gradient(145deg, rgba(15, 23, 42, 0.5), rgba(30, 41, 59, 0.85)), url('/parking_bg.jpg')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 30px rgba(37, 99, 235, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#F8FAFC',
                }}>
                    <div className="modal-header border-0 pb-0">
                        <h4 className="modal-title fw-bold text-white d-flex align-items-center">
                            <i className="fa-solid fa-right-to-bracket me-2" style={{ color: '#60A5FA' }}></i>ĐĂNG NHẬP
                        </h4>
                        <button type="button" className="btn-close btn-close-white" onClick={handleClose}></button>
                    </div>
                    <div className="modal-body px-4 pb-3">
                        {loginErr && <div className="alert alert-danger p-2 mb-3 small fw-bold text-center" style={{ borderRadius: 10 }}>{loginErr}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="form-label fw-semibold text-slate-300 fs-6" style={{ color: '#94A3B8' }}>Tên đăng nhập</label>
                                <input
                                    type="text"
                                    className="form-control py-2 fs-6 text-white"
                                    placeholder="Nhập tài khoản"
                                    style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: 10,
                                        color: '#FFFFFF',
                                    }}
                                    value={username}
                                    onChange={event => setUsername(event.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="form-label fw-semibold fs-6" style={{ color: '#94A3B8' }}>Mật khẩu</label>
                                <input
                                    type="password"
                                    className="form-control py-2 fs-6 text-white"
                                    placeholder="Nhập mật khẩu"
                                    style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: 10,
                                        color: '#FFFFFF',
                                    }}
                                    value={password}
                                    onChange={event => setPassword(event.target.value)}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn text-white w-100 py-2.5 fw-bold fs-6 shadow"
                                style={{
                                    background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                                    border: 'none',
                                    borderRadius: 10,
                                    boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)',
                                }}
                                disabled={loading}
                            >
                                {loading ? <><i className="fa-solid fa-spinner fa-spin me-2"></i>Đang xử lý...</> : 'XÁC NHẬN ĐĂNG NHẬP'}
                            </button>
                        </form>

                        <div className="text-center my-3 text-slate-400 small" style={{ color: '#94A3B8' }}>─ Hoặc ─</div>
                        <div className="d-flex justify-content-center">
                            <GoogleLogin
                                onSuccess={async (credentialResponse) => {
                                    try {
                                        const res = await api.post('/users/auth/google', { idToken: credentialResponse.credential });
                                        if (res.status === 200) {
                                            const roleId = await loginWithGoogleContext(res.data);
                                            handleClose();
                                            redirectByRole(roleId);
                                        }
                                    } catch {
                                        setLoginErr('Đăng nhập bằng Google thất bại!');
                                    }
                                }}
                                onError={() => setLoginErr('Không thể kết nối xác thực với Google.')}
                                useOneTap
                            />
                        </div>

                        <div className="text-center mt-3 small" style={{ color: '#CBD5E1' }}>
                            Chưa có tài khoản?{' '}
                            <button type="button" className="btn btn-link p-0 small fw-bold text-decoration-none" style={{ color: '#60A5FA' }} onClick={() => { handleClose(); openRegister(); }}>
                                Đăng ký ngay
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GlobalLoginModal;
