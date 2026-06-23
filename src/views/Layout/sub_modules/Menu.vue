<template>
  <div class="menu-container">
    <!-- <div class="collapse">
        <ElIcon @click="onCollapse">
            <template v-if="menuModel.collapse">
                <Expand />
            </template>
            <template v-else>
                <Fold />
            </template>
        </ElIcon>
    </div> -->
    <template v-if="menuModel.visible">
      <ElMenu mode="horizontal" :default-active="menuModel.active" :unique-opened="true" @select="onMenuSelect">
        <template v-for="item of menuModel.data" :key="item.name">
          <ElMenuItem :index="item.name">
            <i class="icon" :class="item.meta.icon"></i>
            <p class="title">{{ item.meta.title }}</p>
          </ElMenuItem>
        </template>
      </ElMenu>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { reactive, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Storage from "tddev/storage";
import { LayoutChildrenRoutes } from "@/router/routes";
import { useMenuStore } from "@/store/modules/menu";
import { useUserStore } from "@/store/modules/user";
import _utils from "@/utils/index";
import _ from "tddev/utils";
const Route = useRoute();
const Router = useRouter();
const MenuStore = useMenuStore();
const UserStore = useUserStore();

const menuModel = reactive({
  visible: false,
  collapse: false,
  active: "",
  data: [] as Obj[],
});

const managerRoleCodes = ["platform_admin", "project_manager", "canteen_manager"];
const getActiveRoleCode = (user: Obj) => {
  const roleId = Storage.get("roleID") || user?.role_id;
  const role = Array.isArray(user?.roles) ? user.roles.find((item: Obj) => item.role_id === roleId || item.id === roleId) : null;
  return role?.role_code || role?.code || user?.role_code;
};

const isRouteVisibleForScope = (route: Obj, user: Obj) => {
  return true;
};

/** 路由菜单 */
const setMenuData = () => {
  const SystemUserinfo: Obj = Storage.get("SystemUserinfo") ?? {};
  let menuData: Obj[] = [];
  menuData = LayoutChildrenRoutes.filter(route => !route.meta?.hiddenMenu && isRouteVisibleForScope(route, SystemUserinfo));
  menuModel.data = menuData;
  menuModel.visible = true;
};

/** 路由选中 */
const setMenuActive = () => {
  const { matched } = Route;
  if (matched.length >= 2) {
    const RouteMatchedChecked = matched[1];
    const RouteMatchedName = RouteMatchedChecked.name?.toString() ?? "";
    if (RouteMatchedName) {
      menuModel.active = RouteMatchedName;
    }
  }
};

const onMenuSelect = (name: string) => {
  if (name !== menuModel.active) {
    menuModel.active = name;
    Router.push({ name });
  }
};

/** 菜单收缩 */
const onCollapse = () => {
  menuModel.collapse = !menuModel.collapse;
  MenuStore.$patch(state => {
    state.collapse = menuModel.collapse;
  });
};

watch(
  () => Route.name,
  () => {
    setMenuActive();
  },
  {
    immediate: true,
  }
);
watch(
  () => MenuStore.refresh,
  () => {
    menuModel.active = "";
  }
);
watch(
  () => UserStore.systemUserinfo,
  () => {
    setMenuData();
  },
  {
    deep: true,
    immediate: true,
  }
);
</script>

<style lang="scss">
.menu-container {
  overflow: hidden;
  flex: auto;
  padding: 0 20px;
  box-sizing: border-box;
  user-select: none;
  .collapse {
    padding-right: var(--gap);
    padding-left: 20px;
    .el-icon {
      font-size: 24px;
      cursor: pointer;
    }
  }

  .el-menu {
    background: transparent;
    border-bottom: none;
    .el-menu-item,
    .el-sub-menu__title {
      border-bottom: none;
      color: var(--el-color-white) !important;
      line-height: var(--line-height);
      .icon {
        margin-right: var(--gap-md);
        svg {
          width: 20px;
          height: 22px;
        }
      }
      .title {
        font-size: var(--font-size-md);
      }
    }
    .el-menu-item {
      &:not(.is-disabled):hover,
      &:not(.is-disabled):focus {
        background: #2177e4;
      }
      &.is-active {
        background: #2177e4;
      }
    }
    .el-sub-menu__title {
      &:hover {
        background: #2177e4;
      }
    }
  }

  .el-sub-menu__hide-arrow {
    &.is-active {
      .el-sub-menu__title {
        border-bottom: none;
        background: #2177e4;
      }
    }
    .el-sub-menu__title {
      padding: 0 var(--el-menu-base-level-padding);
    }
  }
}

.el-menu--popup-container {
  .el-menu-item,
  .el-sub-menu__title {
    line-height: var(--line-height);
    .icon {
      margin-right: var(--gap-md);
      svg {
        width: 20px;
        height: 22px;
      }
    }
    .title {
      font-size: var(--font-size-md);
    }
  }
}
</style>
