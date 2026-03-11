<template>
    <div class="page">
        <Header />
        <main class="main">
            <OrderView />
        </main>
        <Footer />
    </div>
</template>

<script setup>
import Header from '/@/views/index/components/header.vue';
import Footer from '/@/views/index/components/footer.vue';
import OrderView from '/@/views/index/user/order-view.vue';
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
