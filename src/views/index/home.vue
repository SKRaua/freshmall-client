<template>
    <div class="page">
        <Header />

        <main class="main">
            <section class="toolbar">
                <div class="chips">
                    <button v-for="item in contentData.cData" :key="item.id"
                        :class="['chip', { active: contentData.c === item.id }]" @click="clickCategory(item.id)">
                        {{ item.title }}
                    </button>
                </div>
            </section>

            <a-spin :spinning="contentData.loading" style="min-height: 160px">
                <div v-if="contentData.renderList.length" class="masonry" :class="`cols-${columnCount}`">
                    <div class="col" v-for="(col, colIndex) in columns" :key="`col-${colIndex}`">
                        <article class="card" v-for="item in col" :key="item.id" @click="handleDetail(item)">
                            <img class="cover" :src="item.cover" :alt="item.title" loading="lazy" />
                            <div class="meta">
                                <h3>{{ item.title }}</h3>
                                <div class="row">
                                    <span class="price">¥{{ item.price }}</span>
                                    <span class="sub">{{ item.pv || 0 }} 浏览</span>
                                </div>
                            </div>
                        </article>
                    </div>
                </div>
                <a-empty v-else description="暂无商品" />
            </a-spin>

            <div ref="loadMoreRef" class="load-more" v-if="contentData.renderList.length">
                <span v-if="contentData.hasMore">下拉加载更多...</span>
                <span v-else>没有更多了</span>
            </div>
        </main>

        <Footer />
    </div>
</template>

<script setup>
import Header from '/@/views/index/components/header.vue';
import Footer from '/@/views/index/components/footer.vue';
import { listApi as listClassificationList } from '/@/api/classification';
import { listApi as listThingList } from '/@/api/thing';

const router = useRouter();

const loadMoreRef = ref(null);
const observerRef = ref(null);

const contentData = reactive({
    c: -1,
    cData: [],
    loading: false,
    mode: 'unknown',
    allList: [],
    renderList: [],
    localPage: 1,
    requestPage: 1,
    pageSize: 18,
    hasMore: true,
});

const columnCount = ref(getColumnCount());

const columns = computed(() => {
    const result = Array.from({ length: columnCount.value }, () => []);
    contentData.renderList.forEach((item, index) => {
        result[index % columnCount.value].push(item);
    });
    return result;
});

onMounted(() => {
    initFilter();
    resetAndFetch();
    bindObserver();
    window.addEventListener('resize', onResize);
});

onBeforeUnmount(() => {
    if (observerRef.value) {
        observerRef.value.disconnect();
    }
    window.removeEventListener('resize', onResize);
});

const onResize = () => {
    columnCount.value = getColumnCount();
};

function getColumnCount() {
    const width = window.innerWidth;
    if (width < 680) return 2;
    if (width < 1100) return 3;
    return 4;
}

const initFilter = () => {
    contentData.cData = [{ id: -1, title: '全部' }];
    listClassificationList().then((res) => {
        (res.data || []).forEach((item) => contentData.cData.push(item));
    });
};

const clickCategory = (id) => {
    contentData.c = id;
    resetAndFetch();
};

const mapThing = (item) => {
    const next = { ...item };
    if (next.cover) {
        next.cover = '/api/staticfiles/image/' + next.cover;
    }
    return next;
};

const resetAndFetch = () => {
    contentData.mode = 'unknown';
    contentData.localPage = 1;
    contentData.requestPage = 1;
    contentData.allList = [];
    contentData.renderList = [];
    contentData.hasMore = true;
    fetchFirstPage();
};

const fetchFirstPage = () => {
    contentData.loading = true;
    listThingList({ c: contentData.c, sort: 'recent', page: 1, pageSize: contentData.pageSize })
        .then((res) => {
            const firstBatch = (res.data || []).map(mapThing).filter((item) => item.status === '0');
            if (firstBatch.length > contentData.pageSize) {
                contentData.mode = 'local';
                contentData.allList = firstBatch;
                appendNextLocalPage();
                return;
            }

            contentData.mode = 'server';
            contentData.renderList = firstBatch;
            contentData.requestPage = 2;
            contentData.hasMore = firstBatch.length >= contentData.pageSize;
        })
        .finally(() => {
            contentData.loading = false;
        });
};

const appendNextLocalPage = () => {
    if (!contentData.hasMore) return;
    const start = (contentData.localPage - 1) * contentData.pageSize;
    const end = start + contentData.pageSize;
    const next = contentData.allList.slice(start, end);
    if (!next.length) {
        contentData.hasMore = false;
        return;
    }
    contentData.renderList = contentData.renderList.concat(next);
    contentData.localPage += 1;
    contentData.hasMore = end < contentData.allList.length;
};

const appendNextServerPage = () => {
    if (!contentData.hasMore) return;
    contentData.loading = true;
    listThingList({
        c: contentData.c,
        sort: 'recent',
        page: contentData.requestPage,
        pageSize: contentData.pageSize,
    })
        .then((res) => {
            const next = (res.data || []).map(mapThing).filter((item) => item.status === '0');
            if (!next.length) {
                contentData.hasMore = false;
                return;
            }
            contentData.renderList = contentData.renderList.concat(next);
            contentData.requestPage += 1;
            contentData.hasMore = next.length >= contentData.pageSize;
        })
        .finally(() => {
            contentData.loading = false;
        });
};

const appendNextPage = () => {
    if (contentData.mode === 'local') {
        appendNextLocalPage();
        return;
    }
    appendNextServerPage();
};

const bindObserver = () => {
    observerRef.value = new IntersectionObserver(
        (entries) => {
            const [entry] = entries;
            if (!entry.isIntersecting) return;
            if (contentData.loading || !contentData.hasMore) return;
            appendNextPage();
        },
        { threshold: 0.1 },
    );

    nextTick(() => {
        if (loadMoreRef.value) {
            observerRef.value.observe(loadMoreRef.value);
        }
    });
};

watch(
    () => loadMoreRef.value,
    (el) => {
        if (!observerRef.value || !el) return;
        observerRef.value.disconnect();
        observerRef.value.observe(el);
    },
);

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
    padding: 18px 20px 12px;
}

.toolbar {
    margin-bottom: 14px;
}

.chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.chip {
    border: 1px solid #ececcf;
    background: #fff;
    padding: 6px 12px;
    border-radius: 999px;
    cursor: pointer;
    color: #4f4f4f;
}

.chip.active {
    border-color: #e2df46;
    background: #f7f7cd;
    color: #363617;
}

.masonry {
    display: grid;
    gap: 12px;
}

.masonry.cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
}

.masonry.cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
}

.masonry.cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
}

.col {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.card {
    background: #fff;
    border: 1px solid #efefdc;
    border-radius: 14px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
    }
}

.cover {
    width: 100%;
    height: auto;
    max-height: 360px;
    display: block;
    object-fit: cover;
}

.meta {
    padding: 12px;

    h3 {
        margin: 0;
        font-size: 15px;
        line-height: 1.45;
        color: #2d2d2d;
        word-break: break-word;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        line-clamp: 3;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
    }

    .row {
        margin-top: 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .price {
        color: #f26b1f;
        font-weight: 700;
    }

    .sub {
        color: #9b9b9b;
        font-size: 12px;
    }
}

.load-more {
    height: 52px;
    display: grid;
    place-items: center;
    color: #8b8b75;
    font-size: 13px;
}

@media (max-width: 780px) {
    .main {
        padding: 14px 12px 8px;
    }

    .card {
        border-radius: 12px;
    }
}
</style>
