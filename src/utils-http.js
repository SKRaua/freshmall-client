import axios from 'axios';
import { BASE_URL, USER_TOKEN } from '@/constants';

const service = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
});

service.interceptors.request.use((config) => {
    config.headers.TOKEN = localStorage.getItem(USER_TOKEN) || '';
    return config;
});

service.interceptors.response.use(
    (response) => {
        if (response.status === 200 && (response.data.code === 0 || response.data.code === 200)) {
            return response.data;
        }
        return Promise.reject(response.data);
    },
    (error) => Promise.reject(error),
);

export const get = (url, params = {}) => service.get(url, { params });
export const post = (url, params = {}, data = undefined, headers = {}) =>
    service.post(url, data, { params, headers });
