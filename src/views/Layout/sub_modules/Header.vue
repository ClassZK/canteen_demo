<template>
    <div class="layout-header">
        <ILogo></ILogo>
        <IMenu></IMenu>
        <IInformation></IInformation>
    </div>
</template>

<script lang="ts" setup>
import IMenu from './Menu.vue';
import ILogo from './Logo.vue';
import IInformation from './Information.vue';
</script>

<style lang="scss" scoped>
.layout-header {
    position: relative;
    display: flex;
    flex: none;
    width: 100%;
    height: var(--header-height);
    background: #2684FF;
    box-shadow: 0px 2px 8px 0px rgba(22,24,25,0.05);
}
</style>
