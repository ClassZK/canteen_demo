<template>
    <div class="logo-container" :class="{ 'collapse': systemModel.menuCollapse }">
        <!-- <div class="logo" @click="onHome">
            <img :src="systemModel.systemLogo">
            <a>{{ systemModel.systemTitle }}</a>
        </div> -->
        <div class="logo-cover" @click="onHome">
            <img src="@/assets/image/logo-cover.png">
        </div>
    </div>
</template>

<script lang="ts" setup>
import { reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useMenuStore } from '@/store/modules/menu';
import _utils from '@/utils/index';

const Router = useRouter();
const MenuStore = useMenuStore();

const systemModel = reactive({
    menuCollapse: false,
    systemTitle: '',
    systemLogo: '',
});

const onHome = () => {
    Router.push({ name: 'home' });
};

const getSystemInfo = () => {
    systemModel.systemTitle = _utils.getSystemTitle();
    systemModel.systemLogo = _utils.getSystemLogo();
};
getSystemInfo();

watch(() => MenuStore.collapse, (boolean) => {
    systemModel.menuCollapse = boolean;
}, {
    immediate: true
});
</script>

<style lang="scss" scoped>
.logo-container {
    overflow: hidden;
    position: relative;
    display: flex;
    align-items: center;
    flex: none;
    padding: 0 var(--gap);
    box-sizing: border-box;
    transition: all 0.3s;

    &.collapse {
        width: var(--menu-collapse-width);
        justify-content: center;

        a {
            display: none;
        }
    }

    .logo {
        display: flex;
        align-items: center;
        cursor: pointer;

        img {
            width: 30px;
            height: 30px;
            border-radius: var(--radius-lg);
        }

        a {
            margin-left: var(--gap);
            white-space: nowrap;
            color: var(--el-color-white);
            font-size: var(--font-size-lg);
            font-weight: bold;
        }
    }

    .logo-cover {
        height: 50px;
        cursor: pointer;
        img {
            width: 100%;
            height: 100%;
        }
    }
}
</style>
