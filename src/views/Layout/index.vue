<template>
  <div class="layout-app">
    <IHeader></IHeader>
    <RouterView v-slot="{ Component }">
      <KeepAlive :include="['KeepAlive']">
        <component :is="Component"></component>
      </KeepAlive>
    </RouterView>
  </div>
</template>

<script lang="ts" setup>
import Storage from "tddev/storage";
import IHeader from "./sub_modules/Header.vue";
import { useUserStore } from "@/store/modules/user";
import { apiSystemUserinfo } from "@/api/admin";

const UserStore = useUserStore();

/** 登录信息 */
const getApiSystemUserinfo = async () => {
  const { success, data } = await apiSystemUserinfo();
  if (success) {
    Storage.set("SystemUserinfo", data);
    if (data?.user_scope === "platform") {
      Storage.set("orgID", "");
    } else if (!Storage.get("orgID")) {
      Storage.set("orgID", data?.org_id || data?.orgs?.[0]?.org_id || "");
    }

    UserStore.$patch(state => {
      state.systemUserinfo = data;
    });
  }
};
getApiSystemUserinfo();
</script>

<style lang="scss">
.layout-app {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
.layout-container {
  overflow-x: hidden;
  overflow-y: auto;
  flex: auto;
  padding: var(--gap);
  background: #f4f7fb;
  box-sizing: border-box;
  &.fill {
    width: 100%;
    height: 100%;
  }
  &.no-gap {
    padding: 0;
  }
}
</style>
