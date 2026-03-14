import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add the auth token to requests
api.interceptors.request.use(
    (config) => {
        // We can also retrieve the token from Zustand store directly if needed
        // But for simplicity, we'll try localStorage if running in browser
        if (typeof window !== 'undefined') {
            const auth = localStorage.getItem('auth-storage');
            if (auth) {
                const parsed = JSON.parse(auth);
                const token = parsed?.state?.token;
                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token expiry or global errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 403 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const res = await api.post('/auth/refresh-token');
                const newToken = res.data.accessToken;
                if (newToken && typeof window !== 'undefined') {
                    const auth = localStorage.getItem('auth-storage');
                    if (auth) {
                        const parsed = JSON.parse(auth);
                        parsed.state.token = newToken;
                        localStorage.setItem('auth-storage', JSON.stringify(parsed));
                    }
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed — clear auth and redirect to login
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('auth-storage');
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
