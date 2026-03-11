import { createRouter, createWebHistory } from 'vue-router';
import root from './root';
import { USER_TOKEN } from '/@/store/constants';

const allowList = ['login', 'register', 'home', 'recommend', 'search', 'detail', 'success'];
const loginRoutePath = '/index/login';

const router = createRouter({
    history: createWebHistory(),
    routes: root,
});

router.beforeEach(async (to, from, next) => {
    if (to.path.startsWith('/index')) {
        if (localStorage.getItem(USER_TOKEN)) {
            if (to.path === loginRoutePath) {
                next({ path: '/' });
            } else {
                next();
            }
        } else if (allowList.includes(to.name)) {
            next();
        } else {
            next({ path: loginRoutePath, query: { redirect: to.fullPath } });
        }
    } else {
        next();
    }
});

router.afterEach(() => {
    document.getElementById('html')?.scrollTo(0, 0);
});

export default router;
