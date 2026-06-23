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
    Storage.set("Orgs", data?.orgs || []);
    if (!Storage.get("roleID")) {
      Storage.set("roleID", data?.role_id || data?.roles?.[0]?.role_id || "");
    }
    const orgs = data?.orgs || [];
    const orgID = Storage.get("orgID");
    if (!orgID || (orgs.length > 0 && !orgs.some((item: Obj) => item.org_id === orgID))) {
      Storage.set("orgID", data?.org_id || orgs?.[0]?.org_id || "");
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
