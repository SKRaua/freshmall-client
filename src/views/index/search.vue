<template>
    <div class="page">
        <Header />
        <main class="main">
            <h2 class="title">搜索：{{ tData.keyword || '全部' }}</h2>
            <ThingWaterfall :loading="tData.loading" :list="tData.pageData" :emptyText="'未找到匹配商品'"
                @select="handleDetail" />
            <div class="pager" v-if="tData.total > tData.pageSize">
                <a-pagination class="fm-pagination" v-model:current="tData.page" size="small" @change="changePage"
                    :defaultPageSize="tData.pageSize" :total="tData.total" :showSizeChanger="false" />
            </div>
        </main>
        <Footer />
    </div>
</template>

<script setup>
import Header from '/@/views/index/components/header.vue';
import Footer from '/@/views/index/components/footer.vue';
import ThingWaterfall from '/@/views/index/components/thing-waterfall.vue';
import { listApi as listThingList } from '/@/api/thing';

const router = useRouter();
const route = useRoute();

const tData = reactive({
    loading: false,
    keyword: '',
    thingData: [],
    pageData: [],
    page: 1,
    total: 0,
    pageSize: 16,
});

function search() {
    tData.keyword = (route.query.keyword || '').toString().trim();
    getThingList(tData.keyword ? { keyword: tData.keyword } : {});
}

onMounted(search);

watch(
    () => route.query.keyword,
    () => search(),
);

const changePage = (page) => {
    tData.page = page;
    const start = (page - 1) * tData.pageSize;
    tData.pageData = tData.thingData.slice(start, start + tData.pageSize);
};

const getThingList = (params) => {
    tData.loading = true;
    listThingList(params)
        .then((res) => {
            tData.thingData = (res.data || [])
                .map((item) => ({
                    ...item,
                    cover: item.cover ? '/api/staticfiles/image/' + item.cover : '',
                }))
                .filter((item) => item.status === '0');
            tData.total = tData.thingData.length;
            changePage(1);
        })
        .finally(() => {
            tData.loading = false;
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
    font-size: 20px;
    color: #3a3a24;
}

.pager {
    margin-top: 14px;
    display: flex;
    justify-content: center;
}
</style>
