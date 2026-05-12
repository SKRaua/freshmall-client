<template>
    <div class="order-detail-page">
        <h2 class="title">订单详情</h2>

        <a-spin :spinning="loading" style="min-height: 180px">
            <template v-if="order">
                <section class="card goods-card">
                    <h3>商品信息</h3>
                    <div class="goods-row">
                        <img :src="order.cover" class="cover" />
                        <div class="meta">
                            <h4>{{ order.title || '商品' }}</h4>
                            <p>单价: ¥{{ Number(order.price || 0).toFixed(2) }}</p>
                            <p>数量: x{{ order.count }}</p>
                        </div>
                        <div class="amount">¥{{ totalAmount }}</div>
                    </div>
                </section>

                <section class="card order-card">
                    <h3>订单信息</h3>

                    <div class="info-grid">
                        <div class="label">订单编号</div>
                        <div class="value">{{ order.orderNumber }}</div>

                        <div class="label">订单状态</div>
                        <div class="value">
                            <span :class="['state', stateClass(order.viewStatus)]">{{ statusText(order.viewStatus)
                            }}</span>
                        </div>

                        <div class="label">下单时间</div>
                        <div class="value">{{ order.orderTimeText }}</div>

                        <div class="label">支付时间</div>
                        <div class="value">{{ order.payTimeText || '-' }}</div>

                        <div class="label">收货人</div>
                        <div class="value">{{ order.receiverName || '-' }}</div>

                        <div class="label">联系电话</div>
                        <div class="value">{{ order.receiverPhone || '-' }}</div>

                        <div class="label">收货地址</div>
                        <div class="value">{{ order.receiverAddress || '-' }}</div>

                        <div class="label">订单备注</div>
                        <div class="value">{{ order.remark || '-' }}</div>
                    </div>
                </section>

                <section v-if="showPayPanel" class="card pay-card">
                    <h3>付款</h3>
                    <div class="countdown">请在 <b>{{ countdownText }}</b> 内完成支付</div>
                    <div class="pay-options">
                        <button v-for="item in payOptions" :key="item.value"
                            :class="['pay-option', { active: selectedPayChannel === item.value }]"
                            @click="selectedPayChannel = item.value">
                            {{ item.label }}
                        </button>
                    </div>
                    <div class="pay-actions">
                        <button class="pay-btn" @click="handlePay">确认付款</button>
                        <button class="back-btn" @click="router.push({ name: 'orderView' })">返回订单列表</button>
                    </div>
                </section>
            </template>

            <a-empty v-else description="订单不存在或已不可见" />
        </a-spin>
    </div>
</template>

<script setup>
import { message } from 'ant-design-vue';
import { payByPaymentNoApi, userOrderListApi, updateStatusApi } from '/@/api/order';
import { useUserStore } from '/@/store';
import { getFormatTime } from '/@/utils';

const PAY_TIMEOUT_MS = 30 * 60 * 1000;

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const loading = ref(false);
const order = ref(null);
const selectedPayChannel = ref('alipay');
const remainMs = ref(0);
let countdownTimer = null;

const payOptions = [
    { value: 'alipay', label: '支付宝' },
    { value: 'wechat', label: '微信支付' },
    { value: 'bank', label: '银行卡' },
];

const normalizeStatus = (status) => {
    const value = String(status ?? '').trim();
    if (['0', 'canceled', 'cancelled', '已取消'].includes(value)) {
        return 'canceled';
    }
    if (['4', 'toPay', '待支付'].includes(value)) {
        return 'toPay';
    }
    if (['1', 'toShip', '待发货'].includes(value)) {
        return 'toShip';
    }
    if (['2', 'toReceive', '待收货'].includes(value)) {
        return 'toReceive';
    }
    if (['3', 'finished', 'completed', '已完成', '已收货'].includes(value)) {
        return 'finished';
    }
    return 'toShip';
};

const statusText = (status) => {
    if (status === 'toPay') return '待支付';
    if (status === 'toShip') return '待发货';
    if (status === 'toReceive') return '待收货';
    if (status === 'finished') return '已完成';
    if (status === 'canceled') return '已取消';
    return '待发货';
};

const stateClass = (status) => {
    if (status === 'toPay') return 'state-to-pay';
    if (status === 'toShip') return 'state-to-ship';
    if (status === 'toReceive') return 'state-to-receive';
    if (status === 'finished') return 'state-finished';
    if (status === 'canceled') return 'state-canceled';
    return 'state-to-ship';
};

const totalAmount = computed(() => {
    if (!order.value) return '0.00';
    return (Number(order.value.price || 0) * Number(order.value.count || 0)).toFixed(2);
});

const showPayPanel = computed(() => {
    return order.value?.viewStatus === 'toPay' && remainMs.value > 0;
});

const countdownText = computed(() => {
    const ms = Math.max(0, Number(remainMs.value || 0));
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
});

onMounted(() => {
    loadOrder();
});

onBeforeUnmount(() => {
    stopCountdown();
});

const stopCountdown = () => {
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }
};

const startCountdown = (rawOrderTime) => {
    stopCountdown();
    if (!rawOrderTime) {
        remainMs.value = 0;
        return;
    }

    const deadline = Number(rawOrderTime) + PAY_TIMEOUT_MS;
    const tick = () => {
        remainMs.value = Math.max(0, deadline - Date.now());
        if (remainMs.value <= 0) {
            stopCountdown();
        }
    };

    tick();
    countdownTimer = setInterval(tick, 1000);
};

const decorateOrder = (item) => {
    return {
        ...item,
        cover: item.cover ? '/api/staticfiles/image/' + item.cover : '',
        viewStatus: normalizeStatus(item.status),
        orderTimeText: getFormatTime(item.orderTime, true),
        payTimeText: item.payTime ? getFormatTime(item.payTime, true) : '',
    };
};

const loadOrder = () => {
    const userId = userStore.user_id;
    if (!userId) {
        message.warn('请先登录');
        router.push({ name: 'login' });
        return;
    }

    loading.value = true;
    userOrderListApi({ userId, orderStatus: '' })
        .then((res) => {
            const list = (res.data || []).map(decorateOrder);
            const orderId = String(route.query.orderId || '').trim();
            const orderNumber = String(route.query.orderNumber || '').trim();

            if (orderId) {
                order.value = list.find((item) => String(item.id) === orderId) || null;
            } else if (orderNumber) {
                order.value = list.find((item) => String(item.orderNumber) === orderNumber) || null;
            } else {
                order.value = list[0] || null;
            }

            if (order.value?.viewStatus === 'toPay') {
                startCountdown(order.value.orderTime);
            } else {
                remainMs.value = 0;
                stopCountdown();
            }

            if (!order.value) {
                message.warn('未找到对应订单');
            }
        })
        .catch((err) => {
            message.error(err.msg || '获取订单失败');
            order.value = null;
        })
        .finally(() => {
            loading.value = false;
        });
};

const handlePay = () => {
    if (!order.value) {
        return;
    }
    if (remainMs.value <= 0) {
        message.warn('该订单支付超时，请返回订单列表刷新状态');
        return;
    }

    const payLabel = payOptions.find((i) => i.value === selectedPayChannel.value)?.label || '所选方式';
    const paymentNo = String(order.value.paymentNo || '').trim();
    const payRequest = paymentNo
        ? payByPaymentNoApi({ paymentNo, userId: userStore.user_id })
        : updateStatusApi({ id: order.value.id, status: '1', payTime: Date.now() });

    payRequest
        .then((res) => {
            const paidCount = Number(res?.data?.paidCount || 0);
            if (paidCount > 1) {
                message.success(`已使用${payLabel}完成${paidCount}笔订单支付`);
            } else {
                message.success(`已使用${payLabel}付款`);
            }
            router.push({ name: 'orderView' });
        })
        .catch((err) => {
            message.error(err.msg || '付款失败');
        });
};
</script>

<style scoped lang="less">
.order-detail-page {
    min-height: 60vh;
}

.title {
    margin: 2px 0 14px;
    font-size: 22px;
    color: #333324;
}

.card {
    background: #fff;
    border: 1px solid #ececcf;
    border-radius: 14px;
    padding: 14px;
}

.goods-card {
    margin-bottom: 12px;
}

.order-card {
    margin-bottom: 12px;
}

h3 {
    margin: 0 0 12px;
    color: #2f2f1f;
}

.goods-row {
    display: grid;
    grid-template-columns: 72px 1fr auto;
    gap: 12px;
    align-items: center;
}

.cover {
    width: 72px;
    height: 72px;
    border-radius: 8px;
    object-fit: cover;
}

.meta {
    h4 {
        margin: 0;
        font-size: 15px;
        color: #2f2f2f;
    }

    p {
        margin: 6px 0 0;
        color: #777;
    }
}

.amount {
    color: #ef6d20;
    font-size: 20px;
    font-weight: 700;
}

.info-grid {
    display: grid;
    grid-template-columns: 96px 1fr;
    row-gap: 10px;
    column-gap: 12px;
}

.label {
    color: #8b8b74;
}

.value {
    color: #3d3d31;
    word-break: break-word;
}

.state {
    font-weight: 700;
}

.state-to-ship {
    color: #b28a1a;
}

.state-to-pay {
    color: #d48806;
}

.state-to-receive {
    color: #2e8a86;
}

.state-finished {
    color: #4f8f3e;
}

.state-canceled {
    color: #9a7f7f;
}

.countdown {
    color: #6a6449;

    b {
        color: #d48806;
    }
}

.pay-options {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 12px;
}

.pay-option {
    border: 1px solid #ececcf;
    background: #fff;
    border-radius: 999px;
    padding: 7px 14px;
    color: #5c5c44;
    cursor: pointer;
}

.pay-option.active {
    border-color: #e2df46;
    background: #f5f5cc;
    color: #2f2f1f;
    font-weight: 600;
}

.pay-actions {
    display: flex;
    gap: 10px;
    margin-top: 14px;
}

.pay-btn,
.back-btn {
    border-radius: 999px;
    height: 38px;
    padding: 0 18px;
    cursor: pointer;
}

.pay-btn {
    border: none;
    background: #e2df46;
    color: #2f2f1f;
    font-weight: 700;
}

.back-btn {
    border: 1px solid #e8e8cd;
    background: #fff;
    color: #555;
}

@media (max-width: 760px) {
    .goods-row {
        grid-template-columns: 60px 1fr;
    }

    .amount {
        grid-column: 1 / -1;
    }

    .info-grid {
        grid-template-columns: 78px 1fr;
    }

    .pay-actions {
        flex-direction: column;
    }
}
</style>
