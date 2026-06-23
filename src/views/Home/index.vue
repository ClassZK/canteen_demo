<template>
    <div class="layout-container fill">
        <IOverview></IOverview>
    </div>
</template>

<script lang="ts" setup>
    import IOverview  from './overview.vue'
</script>

<style lang="scss" scoped>
    .layout-container {
        overflow: hidden;
        display: flex;
        flex-direction: column;
        padding: var(--gap-md);
        box-sizing: border-box;
    }
</style>