<template>
  <ElConfigProvider :locale="locale">
    <RouterView v-slot="{ Component }">
        <component :is="Component"></component>
    </RouterView>
  </ElConfigProvider>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router'
import Storage from 'tddev/storage';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import { apiConfigInfo } from '@/api/admin';

const Route = useRoute();
const locale = ref(zhCn);

sessionStorage.removeItem('RouteName');

/** 系统名称 */
const getApiSystemName = async () => {
  const { success, data } = await apiConfigInfo({
    key: 'SystemName',
  });
  if (success) {
    const title = data?.value ?? '';
    Storage.set('SystemTitle', title);
  }
};
getApiSystemName();

/** 系统logo */
const getApiSystemLogo = async () => {
  const { success, data } = await apiConfigInfo({
    key: 'SystemLogo',
  });
  if (success) {
    const logo = data?.value ?? '';
    Storage.set('SystemLogo', logo);
  }
};
getApiSystemLogo();

window.addEventListener('beforeunload', function() {
  const RouteName = Route.name?.toString() ?? '';
  if (Route.meta?.discardRouteName) {
    return;
  }
  sessionStorage.setItem('RouteName', RouteName);
  return;
});
</script>

<style lang="scss">

</style>