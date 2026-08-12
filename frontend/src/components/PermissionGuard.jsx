import { useContext, useEffect, useState } from 'react';
import api from '../config/Api';
import { AuthContext } from '../context/AuthContext';
import { ACCESS_DENIED_MESSAGE, hasPermission } from '../config/permissions';

function AccessDenied() {
    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3">
            <div className="bg-white border rounded-3 shadow-sm p-4 text-center" style={{ maxWidth: 560 }}>
                <i className="fa-solid fa-lock text-danger fs-1 mb-3" />
                <h5 className="fw-bold text-dark mb-2">Không có quyền truy cập</h5>
                <p className="text-secondary mb-0">{ACCESS_DENIED_MESSAGE}</p>
            </div>
        </div>
    );
}

function PermissionGuard({ roleId, permissionKey, children }) {
    const { user, updateCurrentUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(Boolean(user && !Array.isArray(user.permissionKeys)));

    useEffect(() => {
        let cancelled = false;
        const refreshPermissions = async () => {
            if (!user || Array.isArray(user.permissionKeys)) return;
            setLoading(true);
            try {
                const [permissionsRes, rolePermsRes] = await Promise.all([
                    api.get('/users/permissions'),
                    api.get(`/users/permissions/role/${user.roleId}`),
                ]);
                const allowedIds = new Set(rolePermsRes.data || []);
                const permissionKeys = (permissionsRes.data || [])
                    .filter(permission => allowedIds.has(permission.permissionId))
                    .map(permission => permission.permissionKey);
                if (!cancelled) updateCurrentUser({ ...user, permissionKeys });
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        refreshPermissions();
        return () => { cancelled = true; };
    }, [user, updateCurrentUser]);

    if (!user || user.roleId !== roleId) return <AccessDenied />;
    if (loading) return null;
    if (!hasPermission(user, permissionKey)) return <AccessDenied />;
    return children;
}

export default PermissionGuard;
