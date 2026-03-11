import { defineStore } from 'pinia';
import { USER_ID, USER_NAME, USER_TOKEN } from '@/constants';

export const useUserStore = defineStore('user', {
    state: () => ({
        userId: localStorage.getItem(USER_ID) || '',
        userName: localStorage.getItem(USER_NAME) || '',
        token: localStorage.getItem(USER_TOKEN) || '',
    }),
    getters: {
        isLogin: (state) => !!state.token,
    },
    actions: {
        setUser(payload) {
            this.userId = payload.id || '';
            this.userName = payload.username || '';
            this.token = payload.token || '';
            localStorage.setItem(USER_ID, this.userId);
            localStorage.setItem(USER_NAME, this.userName);
            localStorage.setItem(USER_TOKEN, this.token);
        },
        logout() {
            this.userId = '';
            this.userName = '';
            this.token = '';
            localStorage.removeItem(USER_ID);
            localStorage.removeItem(USER_NAME);
            localStorage.removeItem(USER_TOKEN);
        },
    },
});
