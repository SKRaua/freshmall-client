<template>
    <div class="cart-page">
        <h2 class="title">我的购物车</h2>

        <div class="cart-list" v-if="cartData.length > 0">
            <div class="list-head">
                <a-checkbox :checked="isAllSelected" @change="onSelectAllChange">全选</a-checkbox>
                <span>商品</span>
                <span>价格</span>
                <span>数量</span>
                <span>小计</span>
                <span>操作</span>
            </div>

            <article class="item" v-for="item in cartData" :key="item.id">
                <div class="cell check">
                    <a-checkbox :checked="selectedIdSet.has(item.id)"
                        @change="(e) => onSelectOneChange(item.id, e.target.checked)" />
                </div>

                <div class="cell thing">
                    <img :src="item.cover" />
                    <h3>{{ item.title }}</h3>
                </div>

                <div class="cell price">¥{{ item.price }}</div>

                <div class="cell qty">
                    <a-input-number :value="item.count" :min="1" :max="item.repertory || 999"
                        @change="(v) => onCountChange(item, v)" />
                </div>

                <div class="cell subtotal">¥{{ rowAmount(item) }}</div>

                <div class="cell action">
                    <button class="del" @click="onDelete(item)">删除</button>
                </div>
            </article>
        </div>

        <a-empty v-else description="购物车暂无商品" />

        <div class="address" v-if="cartData.length > 0">
            <div class="line">
                <label>收货人</label>
                <input v-model="form.receiverName" placeholder="请输入姓名" />
            </div>
            <div class="line">
                <label>电话</label>
                <input v-model="form.receiverPhone" placeholder="请输入手机号" />
            </div>
            <div class="line">
                <label>地址</label>
                <input v-model="form.receiverAddress" placeholder="请输入收货地址" />
            </div>
            <div class="line">
                <label>备注</label>
                <input v-model="form.remark" placeholder="选填" />
            </div>
        </div>

        <div class="sticky-submit" v-if="cartData.length > 0">
            <div class="sticky-inner">
                <div class="summary">已选 {{ selectedCount }} 件，合计 <b>¥{{ selectedAmount }}</b></div>
                <button class="submit" :disabled="submitting" @click="checkout">
                    {{ submitting ? '提交中...' : '提交订单' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { message } from 'ant-design-vue';
import { useUserStore } from '/@/store';
import { checkoutApi, deleteApi, listApi, updateCountApi } from '/@/api/cart';

const userStore = useUserStore();

const cartData = ref([]);
const selectedIdSet = ref(new Set());
const submitting = ref(false);
const form = reactive({
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
    remark: '',
});

const selectedItems = computed(() => cartData.value.filter((item) => selectedIdSet.value.has(item.id)));
const selectedCount = computed(() => selectedItems.value.length);
const selectedAmount = computed(() => {
    const amount = selectedItems.value.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.count || 0), 0);
    return amount.toFixed(2);
});
const isAllSelected = computed(() => cartData.value.length > 0 && selectedIdSet.value.size === cartData.value.length);

onMounted(() => {
    loadCart();
});

const rowAmount = (item) => (Number(item.price || 0) * Number(item.count || 0)).toFixed(2);

const loadCart = () => {
    const userId = userStore.user_id;
    listApi({ userId })
        .then((res) => {
            const list = res.data || [];
            list.forEach((item) => {
                item.cover = '/api/staticfiles/image/' + item.cover;
            });
            cartData.value = list;
            selectedIdSet.value = new Set();
        })
        .catch((err) => {
            message.error(err.msg || '获取购物车失败');
        });
};

const onSelectAllChange = (e) => {
    selectedIdSet.value = e.target.checked ? new Set(cartData.value.map((item) => item.id)) : new Set();
};

const onSelectOneChange = (id, checked) => {
    const next = new Set(selectedIdSet.value);
    if (checked) next.add(id);
    else next.delete(id);
    selectedIdSet.value = next;
};

const onCountChange = (item, value) => {
    const userId = userStore.user_id;
    const count = Number(value || 1);
    updateCountApi({ userId, id: item.id, count })
        .then(() => {
            item.count = count;
        })
        .catch((err) => {
            message.error(err.msg || '更新数量失败');
        });
};

const onDelete = (item) => {
    const userId = userStore.user_id;
    deleteApi({ userId, id: item.id })
        .then(() => {
            message.success('删除成功');
            loadCart();
        })
        .catch((err) => {
            message.error(err.msg || '删除失败');
        });
};

const checkout = () => {
    if (submitting.value) {
        return;
    }

    const userId = userStore.user_id;
    const ids = Array.from(selectedIdSet.value);

    if (ids.length < 1) {
        message.warn('请先选择要支付的购物车记录');
        return;
    }
    if (!form.receiverName) {
        message.warn('请输入收货人');
        return;
    }

    submitting.value = true;

    checkoutApi({
        userId,
        ids: ids.join(','),
        receiverName: form.receiverName,
        receiverPhone: form.receiverPhone,
        receiverAddress: form.receiverAddress,
        remark: form.remark,
    })
        .then((res) => {
            message.success(res.msg || '下单成功');
            loadCart();
        })
        .catch((err) => {
            message.error(err.msg || '下单失败');
        })
        .finally(() => {
            submitting.value = false;
        });
};
</script>

<style scoped lang="less">
.cart-page {
    padding-bottom: 110px;
}

.title {
    margin: 2px 0 14px;
    font-size: 22px;
    color: #333324;
}

.cart-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.list-head,
.item {
    display: grid;
    grid-template-columns: 64px minmax(220px, 1fr) 100px 140px 100px 70px;
    gap: 10px;
    align-items: center;
}

.list-head {
    color: #6d6d6d;
    font-size: 13px;
    padding: 0 10px;
}

.item {
    background: #fff;
    border: 1px solid #ececcf;
    border-radius: 14px;
    padding: 12px 10px;
}

.cell {
    color: #4b4b4b;
}

.thing {
    display: flex;
    align-items: center;
    gap: 10px;

    img {
        width: 58px;
        height: 58px;
        border-radius: 8px;
        object-fit: cover;
    }

    h3 {
        margin: 0;
        font-size: 14px;
        color: #2f2f2f;
    }
}

.del {
    border: none;
    background: transparent;
    color: #d66a6a;
    cursor: pointer;
}

.address {
    margin-top: 16px;
    background: #fff;
    border: 1px solid #ececcf;
    border-radius: 14px;
    padding: 14px;
    display: grid;
    gap: 10px;

    .line {
        display: grid;
        grid-template-columns: 66px 1fr;
        align-items: center;
        gap: 10px;
    }

    label {
        color: #7b7b7b;
    }

    input {
        height: 38px;
        border: 1px solid #e6e6c8;
        border-radius: 10px;
        padding: 0 10px;
    }
}

.sticky-submit {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 50;
    background: rgba(255, 255, 255, 0.96);
    border-top: 1px solid #ececcf;
}

.sticky-inner {
    max-width: 1200px;
    margin: 0 auto;
    height: 68px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.summary {
    color: #5f5f4b;

    b {
        color: #ef6d20;
        font-size: 20px;
        margin-left: 6px;
    }
}

.submit {
    border: none;
    background: #e2df46;
    color: #2f2f1f;
    font-weight: 700;
    border-radius: 999px;
    height: 40px;
    padding: 0 22px;
    cursor: pointer;

    &:disabled {
        background: #f0efb0;
        color: #8f8f76;
        cursor: not-allowed;
    }
}

.submit:hover {
    background: #d7d440;
}

:deep(.ant-input-number) {
    border-color: #e6e6c8;
    border-radius: 10px;
    height: 34px;
    box-shadow: none;
}

:deep(.ant-input-number:hover),
:deep(.ant-input-number-focused) {
    border-color: #e2df46;
    box-shadow: 0 0 0 2px rgba(226, 223, 70, 0.15);
}

:deep(.ant-checkbox-wrapper) {
    color: #5e5e49;
}

:deep(.ant-checkbox-checked .ant-checkbox-inner) {
    background-color: #e2df46;
    border-color: #d9d641;
}

@media (max-width: 860px) {

    .list-head,
    .item {
        grid-template-columns: 42px minmax(140px, 1fr) 72px 112px 78px 56px;
        gap: 8px;
    }

    .item {
        padding: 10px 8px;
    }

    .thing {
        gap: 8px;

        img {
            width: 50px;
            height: 50px;
        }

        h3 {
            font-size: 13px;
        }
    }

    :deep(.ant-input-number) {
        width: 100px;
    }

    .sticky-inner {
        height: 64px;
        padding: 0 12px;
    }

    .summary {
        font-size: 13px;
    }

    .summary b {
        font-size: 17px;
    }

    .submit {
        height: 38px;
        padding: 0 18px;
    }
}

@media (max-width: 620px) {
    .list-head {
        display: none;
    }

    .item {
        grid-template-columns: 34px minmax(0, 1fr) 64px 90px 74px 54px;
        grid-template-rows: auto auto;
        column-gap: 6px;
        row-gap: 8px;
        align-items: center;
        padding: 10px 8px;
    }

    .cell.check {
        grid-column: 1;
        grid-row: 1 / 3;
        align-self: flex-start;
        padding-top: 10px;
    }

    .thing {
        grid-column: 2 / 7;
        grid-row: 1;
    }

    .cell.price,
    .cell.qty,
    .cell.subtotal,
    .cell.action {
        grid-row: 2;
        font-size: 12px;
        color: #666;
        white-space: nowrap;
    }

    .cell.price {
        grid-column: 3;
    }

    .cell.qty {
        grid-column: 4;
    }

    .cell.subtotal {
        grid-column: 5;
    }

    .cell.action {
        grid-column: 6;
        text-align: right;
    }

    :deep(.ant-input-number) {
        width: 84px;
        height: 30px;
    }

    :deep(.ant-input-number-input) {
        height: 28px;
    }

    .del {
        padding: 0;
        font-size: 12px;
    }

    .sticky-inner {
        height: 76px;
        flex-direction: column;
        justify-content: center;
        gap: 6px;
        padding: 0 12px;
    }

    .summary b {
        font-size: 18px;
    }
}
</style>
