<template>
    <div class="auth-page">
        <div class="card">
            <h1>创建账号</h1>
            <p>注册后即可使用完整购物功能</p>

            <div class="form-item">
                <label>用户名</label>
                <input v-model.trim="tData.loginForm.username" placeholder="请输入用户名" />
            </div>

            <div class="form-item">
                <label>密码</label>
                <input v-model.trim="tData.loginForm.password" type="password" placeholder="请输入密码" />
            </div>

            <div class="form-item">
                <label>确认密码</label>
                <input v-model.trim="tData.loginForm.rePassword" type="password" placeholder="请再次输入密码" />
            </div>

            <button class="submit" @click="handleRegister">注册</button>
            <button class="sub-link" @click="router.push({ name: 'login' })">已有账号？去登录</button>
        </div>
    </div>
</template>

<script setup>
import { userRegisterApi } from '/@/api/user';
import { message } from 'ant-design-vue';

const router = useRouter();

const tData = reactive({
    loginForm: {
        username: '',
        password: '',
        rePassword: '',
    },
});

const handleRegister = () => {
    const { username, password, rePassword } = tData.loginForm;
    if (!username || !password || !rePassword) {
        message.warn('请填写完整信息');
        return;
    }
    if (password !== rePassword) {
        message.warn('两次密码不一致');
        return;
    }

    userRegisterApi({ username, password, rePassword })
        .then(() => {
            message.success('注册成功');
            router.push({ name: 'login' });
        })
        .catch((err) => {
            message.error(err.msg || '注册失败');
        });
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
