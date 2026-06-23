<template>
    <div class="layout-fill-header">
        <img :src="systemModel.systemLogo">
        <a>{{ systemModel.systemTitle }}</a>
    </div>
</template>

<script lang="ts" setup>
    import { reactive } from 'vue'
    import _utils from '@/utils/index';

    const systemModel = reactive({
        systemTitle: '',
        systemLogo: '',
    });

    const getSystemInfo = () => {
        systemModel.systemTitle = _utils.getSystemTitle();
        systemModel.systemLogo = _utils.getSystemLogo();
    };
    getSystemInfo();
</script>

<style lang="scss" scoped>

</style>