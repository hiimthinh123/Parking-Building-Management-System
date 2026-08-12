export const ROLE_IDS = {
    ADMIN: 1,
    MANAGER: 2,
    STAFF: 3,
    DRIVER: 4,
};

export const ACCESS_DENIED_MESSAGE =
    'Bạn hiện không có quyền truy cập chức năng này. Vui lòng liên hệ Admin để được hỗ trợ !!!!';

export const ROUTE_PERMISSIONS = {
    '/admin/dashboard': { roleId: ROLE_IDS.ADMIN, permissionKey: 'manage_users' },
    '/admin/permissions': { roleId: ROLE_IDS.ADMIN, permissionKey: 'manage_perms' },

    '/manager/floors': { roleId: ROLE_IDS.MANAGER, permissionKey: 'dispatch' },
    '/manager/tariff': { roleId: ROLE_IDS.MANAGER, permissionKey: 'config_tariff' },
    '/manager/reports': { roleId: ROLE_IDS.MANAGER, permissionKey: 'reports' },

    '/staff/checkin': { roleId: ROLE_IDS.STAFF, permissionKey: 'dispatch' },
    '/staff/checkout': { roleId: ROLE_IDS.STAFF, permissionKey: 'dispatch' },
    '/staff/exceptions': { roleId: ROLE_IDS.STAFF, permissionKey: 'dispatch' },
};

export const PERMISSION_NAME_BY_KEY = {
    manage_users: 'Quản lý tài khoản người dùng',
    manage_perms: 'Cấu hình phân quyền hệ thống',
    config_tariff: 'Thiết lập cấu hình bảng giá bãi xe',
    dispatch: 'Điều phối tạo ca xe vào/ra bốt bảo vệ',
    booking: 'Đặt vị trí đỗ trước',
    reports: 'Xem báo cáo thống kê & doanh thu',
};

export function hasPermission(user, permissionKey) {
    if (!permissionKey) return true;
    if (!user) return false;
    if (user.roleId === ROLE_IDS.ADMIN) return true;
    return Array.isArray(user.permissionKeys) && user.permissionKeys.includes(permissionKey);
}
