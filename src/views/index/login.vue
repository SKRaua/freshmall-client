<template>
    <div class="auth-page">
        <div class="card">
            <h1>欢迎回来</h1>
            <p>登录后可管理购物车、订单和个人信息</p>

            <div class="form-item">
                <label>用户名</label>
                <input v-model.trim="pageData.loginForm.username" placeholder="请输入用户名" />
            </div>

            <div class="form-item">
                <label>密码</label>
                <input v-model.trim="pageData.loginForm.password" type="password" placeholder="请输入密码" />
            </div>

            <button class="submit" @click="handleLogin">登录</button>
            <button class="sub-link" @click="handleCreateUser">没有账号？立即注册</button>
        </div>
    </div>
</template>

<script setup>
import { useUserStore } from '/@/store';
import { message } from 'ant-design-vue';

const router = useRouter();
const userStore = useUserStore();

const pageData = reactive({
    loginForm: {
        username: '',
        password: '',
    },
});

const handleLogin = () => {
    if (!pageData.loginForm.username || !pageData.loginForm.password) {
        message.warn('请输入完整账号和密码');
        return;
    }

    userStore
        .login({
            username: pageData.loginForm.username,
            password: pageData.loginForm.password,
        })
        .then(() => {
            message.success('登录成功');
            router.push({ name: 'home' });
        })
        .catch((err) => {
            message.warn(err.msg || '登录失败');
        });
};

const handleCreateUser = () => {
    router.push({ name: 'register' });
};
</script>

<style scoped lang="less">
.auth-page {
    min-height: 100vh;
    background: linear-gradient(160deg, #fcfce9 0%, #f6f8da 45%, #f0f4cf 100%);
    display: grid;
    place-items: center;
    padding: 16px;
}

.card {
    width: min(420px, 100%);
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid #ededcc;
    border-radius: 18px;
    padding: 28px 24px;

    h1 {
        margin: 0;
        color: #2f2f1f;
        font-size: 26px;
    }

    p {
        margin: 8px 0 20px;
        color: #7b7b66;
    }
}

.form-item {
    margin-bottom: 14px;

    label {
        display: block;
        margin-bottom: 6px;
        font-size: 13px;
        color: #666;
    }

    input {
        width: 100%;
        height: 40px;
        border: 1px solid #e9e9cf;
        border-radius: 10px;
        padding: 0 12px;
    }
}

.submit {
    width: 100%;
    height: 42px;
    border: none;
    border-radius: 999px;
    background: #e2df46;
    color: #282818;
    font-weight: 700;
    cursor: pointer;
}

.sub-link {
    margin-top: 10px;
    width: 100%;
    height: 36px;
    border: none;
    background: transparent;
    color: #68723a;
    cursor: pointer;
}
</style>
