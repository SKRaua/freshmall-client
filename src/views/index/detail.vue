<template>
    <div class="page">
        <Header />

        <main class="main" v-if="detailData.id">
            <section class="hero">
                <img class="cover" :src="detailData.cover" :alt="detailData.title" />

                <div class="info">
                    <h1>{{ detailData.title }}</h1>
                    <div class="sub">{{ detailData.pv || 0 }} 次浏览</div>
                    <div class="price">¥ {{ detailData.price }}</div>

                    <div class="meta-grid">
                        <span>库存：{{ detailData.repertory || 0 }}</span>
                        <span>品种：{{ detailData.pinzhong || '-' }}</span>
                        <span>保质期：{{ detailData.baozhiqi || '-' }}</span>
                        <span>生产日期：{{ detailData.shengchanriqi || '-' }}</span>
                    </div>

                    <div class="rate-line">
                        <span>评分</span>
                        <a-rate :value="detailData.rate" @change="clickRate" />
                    </div>

                    <div class="actions">
                        <button class="btn primary" @click="openAddCartModal(detailData)">加入购物车</button>
                        <button class="btn" @click="handleOrder(detailData)">立即购买</button>
                        <button class="btn text" @click="addToWish">点赞 {{ detailData.wishCount || 0 }}</button>
                        <button class="btn text" @click="collect">收藏 {{ detailData.collectCount || 0 }}</button>
                    </div>
                </div>
            </section>

            <section class="desc">
                <h3>商品简介</h3>
                <p>{{ detailData.description || '暂无简介' }}</p>
            </section>

            <section class="recommend">
                <h3>相关推荐</h3>
                <div class="recommend-list">
                    <article class="item" v-for="item in recommendData" :key="item.id" @click="handleDetail(item)">
                        <img :src="item.cover" :alt="item.title" />
                        <h4>{{ item.title }}</h4>
                        <p>¥{{ item.price }}</p>
                    </article>
                </div>
            </section>
        </main>

        <a-modal v-model:visible="cartModalVisible" title="加入购物车" ok-text="确认加入" cancel-text="取消"
            wrapClassName="cart-add-modal" @ok="confirmAddToCart">
            <div class="cart-modal">
                <p class="thing-title">{{ selectedCartThing.title || detailData.title }}</p>
                <div class="cart-modal-row">
                    <span>库存</span>
                    <b>{{ maxCartCount === 9999 ? '充足' : maxCartCount }}</b>
                </div>
                <div class="cart-modal-row">
                    <span>购买数量</span>
                    <a-input-number v-model:value="cartCount" :min="1" :max="maxCartCount" />
                </div>
            </div>
        </a-modal>

        <Footer />
    </div>
</template>

<script setup>
import { message } from 'ant-design-vue';
import Header from '/@/views/index/components/header.vue';
import Footer from '/@/views/index/components/footer.vue';
import { detailApi, getRecommendApi, rateApi } from '/@/api/thing';
import { wishApi } from '/@/api/thingWish';
import { collectApi } from '/@/api/thingCollect';
import { useUserStore } from '/@/store';
import { addApi as addCartApi } from '/@/api/cart';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const thingId = ref('');
const detailData = ref({});
const cartModalVisible = ref(false);
const cartCount = ref(1);
const selectedCartThing = ref({});
const recommendData = ref([]);

const resolveStock = (thing) => {
    const stock = Number(thing?.repertory);
    if (Number.isFinite(stock) && stock > 0) {
        return stock;
    }
    return 9999;
};

const maxCartCount = computed(() => {
    return resolveStock(selectedCartThing.value);
});

const normalizeThing = (item) => ({
    ...item,
    cover: item.cover ? '/api/staticfiles/image/' + item.cover : '',
});

const getThingDetail = () => {
    detailApi({ id: thingId.value })
        .then((res) => {
            detailData.value = normalizeThing(res.data || {});
        })
        .catch(() => {
            message.error('获取详情失败');
        });
};

const addToWish = () => {
    const userId = userStore.user_id;
    if (!userId) {
        message.warn('请先登录');
        return;
    }

    wishApi({ thingId: thingId.value, userId })
        .then((res) => {
            message.success(res.msg || '已点赞');
            getThingDetail();
        })
        .catch(() => {
            message.error('点赞失败');
        });
};

const collect = () => {
    const userId = userStore.user_id;
    if (!userId) {
        message.warn('请先登录');
        return;
    }

    collectApi({ thingId: thingId.value, userId })
        .then((res) => {
            message.success(res.msg || '已收藏');
            getThingDetail();
        })
        .catch(() => {
            message.error('收藏失败');
        });
};

const handleOrder = (thing) => {
    if (!userStore.user_id) {
        message.warn('请先登录');
        return;
    }

    router.push({
        name: 'confirm',
        query: {
            id: thing.id,
            title: thing.title,
            cover: thing.cover,
            price: thing.price,
        },
    });
};

const openAddCartModal = (thing) => {
    if (!userStore.user_id) {
        message.warn('请先登录');
        return;
    }

    selectedCartThing.value = thing || {};
    cartCount.value = 1;
    cartModalVisible.value = true;
};

const confirmAddToCart = () => {
    const userId = userStore.user_id;
    const id = selectedCartThing.value.id;

    if (!id) {
        message.warn('未找到商品信息');
        return;
    }

    const count = Number(cartCount.value || 0);
    if (count < 1) {
        message.warn('请选择正确的购买数量');
        return;
    }
    if (count > maxCartCount.value) {
        message.warn('购买数量不能超过库存');
        return;
    }

    addCartApi({ userId, thingId: id, count })
        .then((res) => {
            message.success(res.msg || '加入购物车成功');
            cartModalVisible.value = false;
        })
        .catch((err) => {
            message.error(err.msg || '加入购物车失败');
        });
};

const getRecommendThing = () => {
    getRecommendApi({})
        .then((res) => {
            recommendData.value = (res.data || []).map(normalizeThing).slice(0, 8);
        })
        .catch(() => {
            recommendData.value = [];
        });
};

watch(
    () => route.query.id,
    (id) => {
        thingId.value = (id || '').toString().trim();
        if (!thingId.value) {
            detailData.value = {};
            recommendData.value = [];
            return;
        }
        getThingDetail();
        getRecommendThing();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    { immediate: true },
);

const handleDetail = (item) => {
    router.push({ name: 'detail', query: { id: item.id } });
};

const clickRate = (num) => {
    rateApi({ thingId: thingId.value, rate: num })
        .then(() => {
            message.success('评分成功');
            getThingDetail();
        })
        .catch(() => {
            message.error('评分失败');
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
}

.hero {
    display: grid;
    grid-template-columns: minmax(260px, 420px) 1fr;
    gap: 18px;
}

.cover {
    width: 100%;
    border-radius: 16px;
    aspect-ratio: 4/3;
    object-fit: cover;
    background: #f4f4e5;
}

.info {
    background: #fff;
    border: 1px solid #efefd6;
    border-radius: 16px;
    padding: 18px;

    h1 {
        margin: 0;
        color: #2b2b23;
    }
}

.sub {
    margin-top: 6px;
    color: #9a9a86;
}

.price {
    margin-top: 12px;
    font-size: 30px;
    color: #f07022;
    font-weight: 700;
}

.meta-grid {
    margin-top: 14px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    color: #5d5d48;
}

.rate-line {
    margin-top: 14px;
    display: flex;
    align-items: center;
    gap: 12px;
}

.actions {
    margin-top: 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.btn {
    border: 1px solid #e4e4cb;
    background: #fff;
    padding: 9px 14px;
    border-radius: 999px;
    cursor: pointer;
}

.btn.primary {
    border: none;
    background: #e2df46;
    color: #2f2f1f;
    font-weight: 700;
}

.btn.text {
    color: #596336;
}

.desc,
.recommend {
    margin-top: 18px;
    background: #fff;
    border: 1px solid #efefd6;
    border-radius: 16px;
    padding: 18px;

    h3 {
        margin: 0 0 10px;
        color: #333322;
    }

    p {
        margin: 0;
        line-height: 1.7;
        color: #5e5e4c;
    }
}

.recommend-list {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;

    .item {
        cursor: pointer;
        background: #f9f9ef;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid #ececcf;

        img {
            width: 100%;
            aspect-ratio: 4/3;
            object-fit: cover;
        }

        h4 {
            margin: 8px 10px 4px;
            font-size: 14px;
            color: #373725;
        }

        p {
            margin: 0 10px 10px;
            color: #f07022;
            font-weight: 600;
        }
    }
}

.cart-modal {
    .thing-title {
        margin: 0 0 10px;
        font-weight: 600;
        color: #353525;
    }
}

.cart-modal-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;
}

:deep(.cart-add-modal .ant-btn-primary) {
    background: #e2df46;
    border-color: #e2df46;
    color: #2f2f1f;
}

:deep(.cart-add-modal .ant-btn-primary:hover),
:deep(.cart-add-modal .ant-btn-primary:focus) {
    background: #d5d23f;
    border-color: #d5d23f;
    color: #2f2f1f;
}

@media (max-width: 960px) {
    .hero {
        grid-template-columns: 1fr;
    }

    .recommend-list {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .meta-grid {
        grid-template-columns: 1fr;
    }
}
</style>
