<template>
    <header class="header">
        <div class="header-inner">
            <div class="brand" @click="$router.push('/')">FreshMall 客户端</div>
            <nav class="menu">
                <a @click.prevent="$router.push('/')">首页</a>
                <a @click.prevent="goAuth('cart')">购物车</a>
                <a @click.prevent="goAuth('orders')">订单</a>
                <a @click.prevent="goAuth('profile')">我的</a>
            </nav>
            <div class="actions">
                <template v-if="userStore.isLogin">
                    <span class="username">{{ userStore.userName }}</span>
                    <a-button size="small" @click="logout">退出</a-button>
                </template>
                <template v-else>
                    <a-button size="small" type="primary" @click="$router.push('/login')">登录</a-button>
                </template>
            </div>
        </div>
    </header>
</template>

<script setup>
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';

const router = useRouter();
const userStore = useUserStore();

const goAuth = (name) => {
    if (!userStore.isLogin) {
        message.warn('请先登录');
        router.push('/login');
        return;
    }
    router.push('/' + name);
};

const logout = () => {
    userStore.logout();
    message.success('已退出');
    router.push('/');
};
</script>

<style scoped lang="less">
.header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid #eaeaea;
}

.header-inner {
    width: min(1180px, 92vw);
    margin: 0 auto;
    height: 62px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.brand {
    font-weight: 700;
    cursor: pointer;
}

.menu {
    display: flex;
    gap: 16px;
}

.menu a {
    color: #555;
}

.actions {
    display: flex;
    align-items: center;
    gap: 10px;
}

.username {
    font-size: 13px;
    color: #666;
}

@media (max-width: 720px) {
    .menu {
        display: none;
    }
}
</style>
