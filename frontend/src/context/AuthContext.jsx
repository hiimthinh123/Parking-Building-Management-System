// src/context/AuthContext.jsx
import { createContext, useEffect, useState } from 'react';
import api from '../config/Api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('LOGIN_USER');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    // Global register modal state — dùng được ở mọi trang
    const [showRegister, setShowRegister] = useState(false);
    const [showLogin,    setShowLogin]    = useState(false);

    const updateCurrentUser = (userData) => {
        localStorage.setItem('LOGIN_USER', JSON.stringify(userData));
        setUser(userData);
    };

    const loadPermissionKeys = async (roleId) => {
        if (!roleId) return [];
        try {
            const [permissionsRes, rolePermsRes] = await Promise.all([
                api.get('/users/permissions'),
                api.get(`/users/permissions/role/${roleId}`),
            ]);
            const allowedIds = new Set(rolePermsRes.data || []);
            return (permissionsRes.data || [])
                .filter(permission => allowedIds.has(permission.permissionId))
                .map(permission => permission.permissionKey);
        } catch {
            return [];
        }
    };

    useEffect(() => {
        let cancelled = false;
        const refreshStoredPermissions = async () => {
            if (!user || Array.isArray(user.permissionKeys)) return;
            const permissionKeys = await loadPermissionKeys(user.roleId);
            if (!cancelled) updateCurrentUser({ ...user, permissionKeys });
        };
        refreshStoredPermissions();
        return () => { cancelled = true; };
    }, [user]);

    const openRegister = () => { setShowRegister(true); setShowLogin(false); };
    const openLogin    = () => { setShowLogin(true);    setShowRegister(false); };
    const closeAll     = () => { setShowRegister(false); setShowLogin(false); };

    // Hàm xử lý đăng nhập giả lập theo đúng Role tài khoản
    const login = async (username, password) => {
        const response = await api.post('/users/login', { username, password });
        const userData = response.data; // { userId, roleId, username, fullName, roleName, ... }
        localStorage.setItem("USER_TOKEN", userData.accessToken);
        userData.permissionKeys = await loadPermissionKeys(userData.roleId);
        localStorage.setItem('LOGIN_USER', JSON.stringify(userData));
        setUser(userData);
        return userData.roleId; // Trả về role để điều hướng)
    };

    const loginWithGoogleContext = async (userData) => {
        localStorage.setItem('USER_TOKEN', userData.accessToken);
        userData.permissionKeys = await loadPermissionKeys(userData.roleId);
        localStorage.setItem('LOGIN_USER', JSON.stringify(userData));
        setUser(userData);
        return userData.roleId;
    };

    const logout = () => {
        localStorage.removeItem('LOGIN_USER');
        localStorage.removeItem('USER_TOKEN');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user, login, loginWithGoogleContext, logout, updateCurrentUser,
            showRegister, setShowRegister,
            showLogin,    setShowLogin,
            openRegister, openLogin, closeAll
        }}>
            {children}
        </AuthContext.Provider>
    );

}
