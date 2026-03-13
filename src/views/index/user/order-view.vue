<template>
    <div class="order-page">
        <h2 class="title">我的订单</h2>

        <div class="tabs">
            <button v-for="item in tabList" :key="item.key" :class="['tab', { active: activeTab === item.key }]"
                @click="activeTab = item.key">
                {{ item.label }}
            </button>
        </div>

        <a-spin :spinning="loading" style="min-height: 160px">
            <div v-if="filteredOrders.length" class="list">
                <article class="card" v-for="item in filteredOrders" :key="item.id">
                    <header class="card-header">
                        <div>
                            <span class="label">订单号</span>
                            <b>#{{ item.orderNumber }}</b>
                            <span class="time">{{ item.orderTime }}</span>
                        </div>
                        <div class="state-wrap">
                            <a-popconfirm v-if="item.viewStatus === 'toShip'" title="确定取消订单？" ok-text="是"
                                cancel-text="否" @confirm="handleCancel(item)">
                                <button class="cancel-btn">取消订单</button>
                            </a-popconfirm>
                            <span :class="['state', stateClass(item.viewStatus)]">{{ statusText(item.viewStatus)
                                }}</span>
                        </div>
                    </header>

                    <div class="item-row" @click="handleDetail(item.thingId)">
                        <img :src="item.cover" class="cover" />
                        <div class="meta">
                            <h3>{{ item.title }}</h3>
                            <p>x{{ item.count }}</p>
                        </div>
                        <div class="amount">¥{{ Number(item.price || 0) * Number(item.count || 0) }}</div>
                    </div>
                </article>
            </div>
            <a-empty v-else description="暂无订单" />
        </a-spin>
    </div>
</template>

<script setup>
import { message } from 'ant-design-vue';
import { userOrderListApi, cancelUserOrderApi } from '/@/api/order';
import { BASE_URL } from '/@/store/constants';
import { useUserStore } from '/@/store';
import { getFormatTime } from '/@/utils';

const router = useRouter();
const userStore = useUserStore();

const loading = ref(false);
const orderData = ref([]);
const activeTab = ref('all');

const tabList = [
    { key: 'all', label: '全部' },
    { key: 'toShip', label: '待发货' },
    { key: 'toReceive', label: '待收货' },
    { key: 'finished', label: '已完成' },
    { key: 'canceled', label: '已取消' },
];

const normalizeStatus = (status) => {
    const value = String(status ?? '').trim();
    if (['0', 'canceled', 'cancelled', '已取消'].includes(value)) {
        return 'canceled';
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
    if (status === 'toShip') return '待发货';
    if (status === 'toReceive') return '待收货';
    if (status === 'finished') return '已完成';
    if (status === 'canceled') return '已取消';
    return '待发货';
};

const stateClass = (status) => {
    if (status === 'toShip') return 'state-to-ship';
    if (status === 'toReceive') return 'state-to-receive';
    if (status === 'finished') return 'state-finished';
    if (status === 'canceled') return 'state-canceled';
    return 'state-to-ship';
};

const filteredOrders = computed(() => {
    if (activeTab.value === 'all') {
        return orderData.value;
    }
    return orderData.value.filter((item) => item.viewStatus === activeTab.value);
});

onMounted(() => {
    getOrderList();
});

const getOrderList = () => {
    loading.value = true;
    const userId = userStore.user_id;
    userOrderListApi({ userId, orderStatus: '' })
        .then((res) => {
            orderData.value = (res.data || []).map((item) => ({
                ...item,
                cover: item.cover ? BASE_URL + '/api/staticfiles/image/' + item.cover : '',
                orderTime: getFormatTime(item.orderTime, true),
                viewStatus: normalizeStatus(item.status),
            }));
        })
        .finally(() => {
            loading.value = false;
        });
};

const handleDetail = (thingId) => {
    router.push({ name: 'detail', query: { id: thingId } });
};

const handleCancel = (item) => {
    cancelUserOrderApi({ id: item.id, userId: userStore.user_id })
        .then(() => {
            message.success('取消成功');
            item.status = '0';
            item.viewStatus = 'canceled';
            getOrderList();
        })
        .catch((err) => {
            message.error(err.msg || '取消失败');
        });
};
</script>

<style scoped lang="less">
.order-page {
    min-height: 60vh;
}

.title {
    margin: 2px 0 14px;
    font-size: 22px;
    color: #333324;
}

.tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 14px;
}

.tab {
    border: 1px solid #ececcf;
    background: #fff;
    border-radius: 999px;
    padding: 7px 14px;
    cursor: pointer;
    color: #60604a;
}

.tab.active {
    border-color: #e2df46;
    background: #f5f5cc;
    color: #2f2f1f;
    font-weight: 600;
}

.list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.card {
    background: #fff;
    border: 1px solid #ededcf;
    border-radius: 14px;
    padding: 14px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid #f1f1d9;

    .label {
        color: #888;
        margin-right: 6px;
    }

    .time {
        margin-left: 10px;
        color: #999;
        font-size: 12px;
    }
}

.state-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
}

.cancel-btn {
    border: 1px solid #f3b6b6;
    background: #ffeaea;
    color: #c95d5d;
    border-radius: 999px;
    height: 28px;
    padding: 0 12px;
    cursor: pointer;
}

.state {
    font-weight: 600;
}

.state-to-ship {
    color: #b28a1a;
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

.item-row {
    margin-top: 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
}

.cover {
    width: 64px;
    height: 64px;
    border-radius: 10px;
    object-fit: cover;
}

.meta {
    flex: 1;

    h3 {
        margin: 0;
        font-size: 15px;
        color: #2f2f2f;
    }

    p {
        margin: 8px 0 0;
        color: #8a8a8a;
    }
}

.amount {
    color: #ef6d20;
    font-weight: 700;
}

@media (max-width: 760px) {
    .card-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .item-row {
        align-items: flex-start;
    }
}
</style>
