<template>
    <div class="page">
        <Header />

        <main class="main">
            <section class="panel left">
                <h3>订单明细</h3>
                <div class="thing-row">
                    <img :src="pageData.cover" :alt="pageData.title" />
                    <div class="meta">
                        <h4>{{ pageData.title }}</h4>
                        <p>¥{{ pageData.price }}</p>
                    </div>
                    <a-input-number v-model:value="pageData.count" :min="1" :max="10" @change="onCountChange" />
                </div>

                <h3>收货信息</h3>
                <div class="form-grid">
                    <input v-model.trim="pageData.receiverName" placeholder="收货人" />
                    <input v-model.trim="pageData.receiverPhone" placeholder="手机号" />
                    <input v-model.trim="pageData.receiverAddress" placeholder="收货地址" />
                    <input v-model.trim="pageData.remark" placeholder="备注（选填）" />
                </div>
            </section>

            <section class="panel right">
                <h3>结算</h3>
                <div class="line"><span>商品总价</span><b>¥{{ pageData.amount }}</b></div>
                <div class="line"><span>优惠</span><b>¥0</b></div>
                <div class="line total"><span>应付</span><b>¥{{ pageData.amount }}</b></div>

                <div class="actions">
                    <button class="btn" @click="handleBack">返回</button>
                    <button class="btn primary" @click="handleCommit">提交订单</button>
                </div>
            </section>
        </main>
    </div>
</template>

<script setup>
import { message } from 'ant-design-vue';
import Header from '/@/views/index/components/header.vue';
import { createApi } from '/@/api/order';
import { useUserStore } from '/@/store';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const pageData = reactive({
    id: undefined,
    title: undefined,
    cover: undefined,
    price: 0,
    remark: '',
    count: 1,
    amount: 0,
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
});

onMounted(() => {
    pageData.id = route.query.id;
    pageData.title = route.query.title;
    pageData.cover = route.query.cover;
    pageData.price = Number(route.query.price || 0);
    pageData.amount = pageData.price;
});

const onCountChange = (value) => {
    pageData.amount = (Number(pageData.price) * Number(value || 1)).toFixed(2);
};

const handleBack = () => {
    router.back();
};

const handleCommit = () => {
    const userId = userStore.user_id;
    if (!userId) {
        message.warn('请先登录');
        return;
    }
    if (!pageData.receiverName) {
        message.warn('请输入收货人');
        return;
    }

    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('thingId', pageData.id);
    formData.append('count', pageData.count);
    formData.append('remark', pageData.remark || '');
    formData.append('receiverName', pageData.receiverName || '');
    formData.append('receiverPhone', pageData.receiverPhone || '');
    formData.append('receiverAddress', pageData.receiverAddress || '');

    createApi(formData)
        .then(() => {
            message.success('提交成功');
            router.push({ name: 'success', query: { title: pageData.title, amount: pageData.amount }, replace: true });
        })
        .catch((err) => {
            message.error(err.msg || '操作失败');
        });
};
</script>

<style scoped lang="less">
.page {
    min-height: 100vh;
    background: #fcfcf6;
}

.main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 16px;
}

.panel {
    background: #fff;
    border: 1px solid #efefd6;
    border-radius: 16px;
    padding: 18px;

    h3 {
        margin: 0 0 12px;
        color: #2f2f20;
    }
}

.thing-row {
    display: grid;
    grid-template-columns: 72px 1fr auto;
    gap: 12px;
    align-items: center;
    margin-bottom: 18px;

    img {
        width: 72px;
        height: 72px;
        border-radius: 8px;
        object-fit: cover;
    }

    h4 {
        margin: 0;
    }

    p {
        margin: 6px 0 0;
        color: #f07022;
        font-weight: 700;
    }
}

.form-grid {
    display: grid;
    gap: 10px;

    input {
        height: 40px;
        border: 1px solid #ececce;
        border-radius: 10px;
        padding: 0 12px;
    }
}

.line {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    color: #666;

    b {
        color: #333;
    }
}

.line.total {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px dashed #ececce;

    b {
        color: #f07022;
        font-size: 22px;
    }
}

.actions {
    display: flex;
    gap: 10px;
    margin-top: 16px;
}

.btn {
    flex: 1;
    height: 40px;
    border: 1px solid #e4e4cb;
    border-radius: 999px;
    background: #fff;
    cursor: pointer;
}

.btn.primary {
    border: none;
    background: #e2df46;
    color: #2f2f1f;
    font-weight: 700;
}

@media (max-width: 900px) {
    .main {
        grid-template-columns: 1fr;
    }
}
</style>
