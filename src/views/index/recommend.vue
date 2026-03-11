<template>
    <div class="page">
        <Header />
        <main class="main">
            <h2 class="title">猜你喜欢</h2>
            <ThingWaterfall :loading="contentData.loading" :list="contentData.pageData" @select="handleDetail" />
            <div class="pager">
                <a-pagination class="fm-pagination" v-model:current="contentData.page" size="small" @change="changePage"
                    :defaultPageSize="contentData.pageSize" :total="contentData.total" :showSizeChanger="false" />
            </div>
        </main>
        <Footer />
    </div>
</template>

<script setup>
import Header from '/@/views/index/components/header.vue';
import Footer from '/@/views/index/components/footer.vue';
import ThingWaterfall from '/@/views/index/components/thing-waterfall.vue';
import { getRecommendApi } from '/@/api/thing';
import { BASE_URL } from '/@/store/constants';

const router = useRouter();

const contentData = reactive({
    loading: false,
    thingData: [],
    pageData: [],
    page: 1,
    total: 0,
    pageSize: 16,
});

onMounted(() => {
    getThingList();
});

const changePage = (page) => {
    contentData.page = page;
    const start = (page - 1) * contentData.pageSize;
    contentData.pageData = contentData.thingData.slice(start, start + contentData.pageSize);
};

const getThingList = () => {
    contentData.loading = true;
    getRecommendApi({})
        .then((res) => {
            contentData.thingData = (res.data || [])
                .map((item) => ({
                    ...item,
                    cover: item.cover ? BASE_URL + '/api/staticfiles/image/' + item.cover : '',
                }))
                .filter((item) => item.status === '0');
            contentData.total = contentData.thingData.length;
            changePage(1);
        })
        .finally(() => {
            contentData.loading = false;
        });
};

const handleDetail = (item) => {
    router.push({ name: 'detail', query: { id: item.id } });
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
    padding: 18px 20px 8px;
}

.title {
    margin: 4px 0 16px;
    font-size: 22px;
    color: #3a3a24;
}

.pager {
    margin-top: 14px;
    display: flex;
    justify-content: center;
}
</style>
