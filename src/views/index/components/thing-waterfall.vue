<template>
    <a-spin :spinning="loading" style="min-height: 180px">
        <div v-if="list.length" class="waterfall">
            <article class="card" v-for="item in list" :key="item.id" @click="onSelect(item)">
                <img class="cover" :src="item.cover" :alt="item.title" />
                <div class="meta">
                    <h3>{{ item.title }}</h3>
                    <div class="row">
                        <span class="price">¥{{ item.price }}</span>
                        <span class="sub">{{ item.pv || 0 }} 浏览</span>
                    </div>
                </div>
            </article>
        </div>
        <a-empty v-else :description="emptyText" />
    </a-spin>
</template>

<script setup>
defineProps({
    loading: {
        type: Boolean,
        default: false,
    },
    list: {
        type: Array,
        default: () => [],
    },
    emptyText: {
        type: String,
        default: '暂无商品',
    },
});

const emit = defineEmits(['select']);

const onSelect = (item) => {
    emit('select', item);
};
</script>

<style scoped lang="less">
.waterfall {
    column-count: 4;
    column-gap: 16px;
}

.card {
    break-inside: avoid;
    margin-bottom: 16px;
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
    display: block;
    aspect-ratio: 4/3;
    object-fit: cover;
}

.meta {
    padding: 12px;

    h3 {
        margin: 0;
        font-size: 15px;
        line-height: 1.45;
        color: #2d2d2d;
        word-break: break-all;
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

@media (max-width: 1100px) {
    .waterfall {
        column-count: 3;
    }
}

@media (max-width: 780px) {
    .waterfall {
        column-count: 2;
        column-gap: 10px;
    }

    .card {
        margin-bottom: 10px;
        border-radius: 12px;
    }
}
</style>
