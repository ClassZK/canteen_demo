<template>
  <div class="layout-horizontal">
    <template v-if="menuModel.data.length > 0">
      <div class="layout-menu-sub" :class="{ collapse: menuModel.collapse }">
        <div class="menu-sub-container">
          <ElMenu
            :default-active="menuModel.active"
            :collapse="menuModel.collapse"
            :unique-opened="true"
            @select="menuSelectChange"
          >
            <template v-for="item of menuModel.data" :key="item.name">
              <template v-if="Array.isArray(item.children) && item.children.length > 0">
                <ElSubMenu :index="item.name" popper-class="menu-sub-popup">
                  <template #title>
                    <template v-if="item.meta.icon">
                      <!-- <span class="icon">
                        <ISVG :icon="item.meta.icon"></ISVG>
                      </span> -->
                    </template>
                    <p class="title">{{ item.meta.title }}</p>
                  </template>
                  <template v-for="el of item.children" :key="el.name">
                    <ElMenuItem :index="el.name">
                      <p class="title">{{ el.meta.title }}</p>
                    </ElMenuItem>
                  </template>
                </ElSubMenu>
              </template>
              <template v-else>
                <ElMenuItem :index="item.name">
                  <template v-if="item.meta.icon">
                    <!-- <span class="icon">
                      <ISVG :icon="item.meta.icon"></ISVG>
                    </span> -->
                  </template>
                  <p class="title">{{ item.meta.title }}</p>
                </ElMenuItem>
              </template>
            </template>
          </ElMenu>
        </div>
        <div class="menu-version">
          <div class="version">{{ menuModel.version }}</div>
        </div>
      </div>
    </template>
    <div class="layout-container" :class="{ 'no-gap': menuModel.layoutNoGap }">
      <RouterView v-slot="{ Component }">
        <KeepAlive :include="['KeepAlive']">
          <component :is="Component"></component>
        </KeepAlive>
      </RouterView>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, watch, onBeforeUnmount, onMounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
// import ISVG from '@/views/Layout/sub_modules/SVG.vue';
import { useMenuStore } from "@/store/modules/menu";
import _utils from "@/utils/index";
import _ from "tddev/utils";
import Storage from "tddev/storage";
const Route = useRoute();
const Router = useRouter();
const MenuStore = useMenuStore();
let readonlyObserver: MutationObserver | null = null;

const menuModel = reactive({
  active: "",
  data: [] as Obj[],
  collapse: false,
  layoutNoGap: false,
  version: "",
});

const managerRoleCodes = ["platform_admin", "project_manager", "canteen_manager"];
const getActiveRoleCode = (user: Obj) => {
  const roleId = Storage.get("roleID") || user?.role_id;
  const role = Array.isArray(user?.roles) ? user.roles.find((item: Obj) => item.role_id === roleId || item.id === roleId) : null;
  return role?.role_code || role?.code || user?.role_code;
};

const menuRoutesFilter = (routes: Obj[]): Obj[] => {
  return routes.reduce<Obj[]>((result, route) => {
    if (route.meta?.hiddenMenu) return result;
    result.push({
      ...route,
      children: route.children ? menuRoutesFilter(route.children) : undefined,
    });
    return result;
  }, []);
};

const systemUserinfo = computed<Obj>(() => Storage.get("SystemUserinfo") ?? {});
const businessManagementNames = [
  "canteenManagement",
  "storeManagement",
  "reportStatisticsManagement",
  "forewarningManagement",
  "foodSafetyManagement",
  "supervisionManagement",
];
const showPlatformOrgFilter = computed(() => {
  return false;
});

const readonlyActionTexts = ["新增", "新增下级", "编辑", "删除", "导入", "提交", "保存", "确 定", "确定"];
const readonlyKeepTexts = ["查询", "重置", "查看", "查看全部", "详情", "取消", "关闭"];

const applyPlatformReadonlyActions = async () => {
  return;
  await nextTick();
  const root = document.querySelector(".layout-container");
  if (!root) return;
  const buttons = Array.from(root.querySelectorAll("button")) as HTMLButtonElement[];
  for (const button of buttons) {
    const text = (button.textContent || "").replace(/\s+/g, "");
    const hiddenByReadonly = button.dataset.platformReadonlyHidden === "1";
    if (!showPlatformOrgFilter.value) {
      if (hiddenByReadonly) {
        button.style.display = "";
        delete button.dataset.platformReadonlyHidden;
      }
      continue;
    }
    const shouldKeep = readonlyKeepTexts.some(item => text.includes(item));
    const shouldHide = !shouldKeep && readonlyActionTexts.some(item => text.includes(item.replace(/\s+/g, "")));
    if (shouldHide) {
      button.style.display = "none";
      button.dataset.platformReadonlyHidden = "1";
    } else if (hiddenByReadonly) {
      button.style.display = "";
      delete button.dataset.platformReadonlyHidden;
    }
  }
};

/** 设置路由菜单 */
const setMenuData = () => {
  const { name, matched, query, params } = Route;
  let menuActive = name?.toString() ?? "";

  if (matched.length >= 2) {
    const RouteMatchedChecked = matched[1];
    const RouteMatchedName = RouteMatchedChecked.name?.toString() ?? "";
    if (RouteMatchedName && RouteMatchedName.includes("Management")) {
      const RouteChildren = RouteMatchedChecked?.children ?? [];
      menuModel.data = menuRoutesFilter(RouteChildren);
    }

    if (RouteMatchedName === menuActive && menuActive.includes("Management")) {
      menuActive = menuModel?.data[0]?.name;
    }
    const RouteName = sessionStorage.getItem("RouteName");
    if (RouteName) {
      menuActive = RouteName;
      sessionStorage.removeItem("RouteName");
    }

    menuModel.active = menuActive;

    if (menuActive && menuActive !== name) {
      Router.replace({
        name: menuActive,
        query: { ...query },
        params: { ...params },
      });
    }
  }
};
setMenuData();

const menuSelectChange = (name: string) => {
  if (name !== Route.name) {
    Router.push({ name });
  }
};

onMounted(() => {
  menuModel.version = `V${window.majorVersion}`;
  readonlyObserver = new MutationObserver(() => {
    applyPlatformReadonlyActions();
  });
  const root = document.querySelector(".layout-container");
  if (root) {
    readonlyObserver.observe(root, { childList: true, subtree: true });
  }
  applyPlatformReadonlyActions();
});

onBeforeUnmount(() => {
  readonlyObserver?.disconnect();
  readonlyObserver = null;
});

watch(
  () => Route.name,
  name => {
    menuModel.active = name?.toString() ?? "";
    applyPlatformReadonlyActions();
  },
  {
    immediate: true,
  }
);
watch(
  () => MenuStore.collapse,
  boolean => {
    menuModel.collapse = boolean;
  },
  {
    immediate: true,
  }
);
watch(
  () => MenuStore.layoutNoGap,
  boolean => {
    menuModel.layoutNoGap = boolean;
  },
  {
    immediate: true,
  }
);
</script>

<style lang="scss">
.layout-menu-sub {
  overflow-x: hidden;
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  flex: none;
  width: var(--menu-width);
  background: #343e42;
  transition: all 0.3s;
  &.collapse {
    width: var(--menu-collapse-width);
    .menu-sub-container {
      .el-menu-item {
        border: none;
      }
    }
    .menu-version {
      display: none;
    }
  }
}

.menu-sub-container {
  overflow: hidden;
  flex: auto;
  user-select: none;

  & > .el-menu {
    overflow-x: hidden;
    overflow-y: auto;
    width: var(--menu-width);
    height: 100%;
    padding: var(--gap) 0;
    box-sizing: border-box;
    border: none;
  }
}
.menu-sub-container,
.menu-sub-popup {
  .el-menu {
    background: transparent;
  }
  .el-menu-item,
  .el-sub-menu__title {
    height: 56px;
    color: var(--el-color-white);

    .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: none;
      margin-right: var(--gap);
      transition: all 0.3s;
      svg {
        width: 26px;
        height: 28px;
      }
    }

    .title {
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: var(--font-size-sm);
      line-height: var(--line-height-sm);
    }

    .el-icon {
      width: 20px;
      margin-right: -12px;
    }
  }

  .el-menu-item {
    &:hover {
      background: #525a61;
    }
    &.is-active {
      background: #525a61;
    }
  }

  .el-menu--collapse {
    width: var(--menu-collapse-width);

    .el-menu-item,
    .el-sub-menu__title {
      padding: 0;
    }

    .el-sub-menu {
      &.is-active {
        background: #525a61;

        .el-sub-menu__title {
          background: inherit;
        }
      }
    }
  }
}
.menu-sub-popup {
  .el-menu {
    padding: var(--gap);
  }
  .el-menu-item {
    padding: var(--gap) !important;
    &.is-active {
      border: none;
    }
  }
}

.menu-version {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  height: var(--version-height);
  padding: 0 var(--gap);
  border-top: 1px solid #666666;
  box-sizing: border-box;

  .version {
    color: var(--el-color-white);
    text-align: center;
    white-space: nowrap;
  }
}
</style>

