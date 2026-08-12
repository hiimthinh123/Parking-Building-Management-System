import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true 
});

// 🔥 BỘ LỌC TỰ ĐỘNG ĐÍNH KÈM TOKEN (Axios Interceptor)
api.interceptors.request.use(
    (config) => {
        // Lấy token dùng chung từ localStorage (Được lưu lúc đăng nhập bằng Google hoặc tài khoản thường)
        const token = localStorage.getItem("USER_TOKEN");

        if (token) {
            // Đính kèm tấm vé thông hành vào Header
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;