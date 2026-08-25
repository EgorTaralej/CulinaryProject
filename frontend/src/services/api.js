import axios from 'axios';

const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

const api = axios.create({
    baseURL: `http://${currentHost}:5000/api`
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['x-auth-token'] = token;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.clear();
            window.location.replace('/login'); 
        }
        return Promise.reject(error);
    }
);

export default api;