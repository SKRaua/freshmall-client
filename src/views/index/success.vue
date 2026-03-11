<template>
    <div class="page">
        <Header />
        <main class="main">
            <div class="card">
                <h2>订单提交成功</h2>
                <p>商品「{{ title }}」已成功下单，感谢你的信任。</p>
                <button @click="handleLook">查看我的订单</button>
            </div>
        </main>
    </div>
</template>

<script setup>
import Header from '/@/views/index/components/header.vue';

const router = useRouter();
const route = useRoute();

const title = ref('');

onMounted(() => {
    title.value = route.query.title || '';
});

const handleLook = () => {
    router.push({ name: 'orderView', replace: true });
};
</script>

<style scoped lang="less">
.page {
    min-height: 100vh;
    background: #fcfcf6;
}

.main {
    min-height: calc(100vh - 64px);
    display: grid;
    place-items: center;
    padding: 20px;
}

.card {
    width: min(560px, 100%);
    background: #fff;
    border: 1px solid #efefd6;
    border-radius: 20px;
    padding: 32px;
    text-align: center;

    h2 {
        margin: 0;
        color: #2f2f20;
    }

    p {
        margin: 12px 0 0;
        color: #666;
        line-height: 1.7;
    }

    button {
        margin-top: 20px;
        border: none;
        border-radius: 999px;
        background: #e2df46;
        color: #2f2f1f;
        font-weight: 700;
        height: 40px;
        padding: 0 22px;
        cursor: pointer;
    }
}
</style>
