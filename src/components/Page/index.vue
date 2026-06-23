<template>
    <div class="page-container">
        <ElPagination
            background
            :layout="pageModel.layout"
            :pager-count="5"
            :page-sizes="pageModel.sizes"
            :total="pageModel.total"
            :hide-on-single-page="pageModel.hideOnSinglePage"
            v-model:current-page="pageModel.page"
            v-model:page-size="pageModel.size"
            @size-change="onSizeChange"
            @current-change="onCurrentChange">
        </ElPagination>
    </div>
</template>

<script lang="ts" setup>
import { reactive, watch } from 'vue';

const emits = defineEmits(['change']);
const props = defineProps({
    layout: {
        type: String,
        default: ''
    },
    page: {
        type: Number,
        default: 1
    },
    size: {
        type: Number,
        default: 20
    },
    total: {
        type: [Number, String],
        default: 0
    },
    hideOnSinglePage: {
        type: Boolean,
        default: false
    },
});
const pageModel = reactive({
    layout: 'total, sizes, prev, pager, next',
    sizes: [20, 30, 50, 100],
    total: 0,
    page: 1,
    size: 20,
    hideOnSinglePage: false,
});

const onPageChange = () => {
    emits('change', {
        page: pageModel.page,
        size: pageModel.size,
    });
};
const onSizeChange = () => {
    onPageChange();
};
const onCurrentChange = () => {
    onPageChange();
};

watch(() => props.layout, (value) => {
    if (value) {
        pageModel.layout = value;
    }
}, {
    immediate: true
});
watch(() => props.total, (value) => {
    const total = (typeof value === 'string')? Number(value):value;
    pageModel.total = total;
}, {
    immediate: true
});
watch(() => props.page, (value) => {
    pageModel.page = value;
}, {
    immediate: true
});
watch(() => props.size, (value) => {
    pageModel.size = value;
}, {
    immediate: true
});
watch(() => props.hideOnSinglePage, (boolean) => {
    pageModel.hideOnSinglePage = boolean;
}, {
    immediate: true
});
</script>

<style lang="scss" scoped>
.table-container + .page-container {
    padding-top: var(--gap);
    padding-bottom: var(--gap-xs);
}
.page-container {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    flex: none;
    box-sizing: border-box;

    :deep(.el-pagination) {
        overflow-x: auto;
    }
}
</style>
