<template>
    <div class="page">
        <Header />
        <main class="main">
            <OrderDetailView />
        </main>
        <Footer />
    </div>
</template>

<script setup>
import Header from '/@/views/index/components/header.vue';
import Footer from '/@/views/index/components/footer.vue';
import OrderDetailView from '/@/views/index/user/order-detail-view.vue';
</script>

<style scoped lang="less">
.page {
    min-height: 100vh;
    background: #fcfcf6;
}

.main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 16px 20px 20px;
}
</style>
