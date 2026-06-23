<template>
    <div class="layout-breadcrumb">
        <ElBreadcrumb separator="/">
            <ElBreadcrumbItem v-for="item of breadcrumb" :key="item">{{ item.meta.title }}</ElBreadcrumbItem>
        </ElBreadcrumb>
    </div>
</template>

<script lang="ts" setup>
    import { ref, watch } from 'vue'
    import { useRoute } from 'vue-router'

    const Route = useRoute();
    const breadcrumb: any = ref([]);

    watch(() => Route, (to) => {
        const { matched } = to;
        if (Array.isArray(matched) && matched.length >= 2) {
            const array = matched.slice(1);
            const list: any = [];
            array.map(item => {
                list.push({
                    path: item.path,
                    name: item.name,
                    meta: item.meta
                });
            });
            breadcrumb.value = list;
        }
    }, {
        deep: true,
        immediate: true
    });
</script>

<style lang="scss" scoped>
    .layout-breadcrumb {
        display: flex;
        align-items: center;
        padding: 0 var(--gap) 0 20px;
        white-space: nowrap;
        box-sizing: border-box;
        :deep(.el-breadcrumb) {
            .el-breadcrumb__inner {
                color: var(--el-color-white);
            }
            .el-breadcrumb__separator {
                color: var(--el-color-white);
            }
        }
    }
</style>