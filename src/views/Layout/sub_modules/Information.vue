<template>
  <div class="information">
    <div class="header">
      <div v-if="showOrgSwitcher" class="dropdown">
        <ElDropdown popper-class="dropdown-container">
          <div class="trigger">
            <p class="name">{{ currentOrg }}</p>
            <ElIcon><ArrowDown /></ElIcon>
          </div>
          <template #dropdown>
            <ElDropdownMenu>
              <ElDropdownItem @click="onDropdownOrg(item)" v-for="item in orgs" :key="item.org_id">
                {{ item.org_name }}
              </ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
      </div>
      <div v-if="showRoleSwitcher" class="dropdown">
        <ElDropdown popper-class="dropdown-container">
          <div class="trigger">
            <p class="name">{{ currentRole }}</p>
            <ElIcon><ArrowDown /></ElIcon>
          </div>
          <template #dropdown>
            <ElDropdownMenu>
              <ElDropdownItem @click="onDropdownRole(item)" v-for="item in roles" :key="item.role_id">
                {{ item.role_name }}
              </ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
      </div>
      <div class="notification" @click="onNotifyPath">
        <ElIcon><Bell /></ElIcon>
      </div>
      <div class="dropdown">
        <ElDropdown popper-class="dropdown-container" @command="onDropdownCommand">
          <div class="trigger">
            <p class="name">{{ systemUserinfo.nick }}</p>
            <ElIcon><ArrowDown /></ElIcon>
          </div>
          <template #dropdown>
            <ElDropdownMenu>
              <ElDropdownItem command="systemUserinfo">
                <ElIcon><User /></ElIcon>个人中心
              </ElDropdownItem>
              <ElDropdownItem command="passwordChange">
                <ElIcon><Edit /></ElIcon>修改密码
              </ElDropdownItem>
              <!-- <ElDropdownItem command="passwordReset">
                                <ElIcon><Edit /></ElIcon>重置密码
                            </ElDropdownItem> -->
              <ElDropdownItem command="logout">
                <ElIcon><SwitchButton /></ElIcon>退出登录
              </ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
      </div>
    </div>
    <div class="dept">{{ systemUserinfo.org_name }}</div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import Storage from "tddev/storage";
import { useMenuStore } from "@/store/modules/menu";
import _utils from "@/utils/index";
import { apiSystemUserLogout } from "@/api/admin";
import { ElMessageBox } from "element-plus";
/** 下拉菜单 */
enum CommandType {
  systemUserinfo = "systemUserinfo",
  passwordChange = "passwordChange",
  passwordReset = "passwordReset",
  logout = "logout",
}

const Router = useRouter();
const systemUserinfo: Obj = ref({});
const MenuStore = useMenuStore();
const currentOrg = ref("");
const currentRole = ref("");
const orgs: Obj[] = Storage.get("Orgs") ?? [];
const roles = computed<Obj[]>(() => systemUserinfo.value?.roles ?? []);
const activeRoleCode = computed(() => {
  const roleId = Storage.get("roleID") || systemUserinfo.value?.role_id;
  const role = roles.value.find(item => item.role_id === roleId) || {};
  return role.role_code || role.code || systemUserinfo.value?.role_code;
});
const showOrgSwitcher = computed(() => activeRoleCode.value === "project_manager" && orgs.length > 1);
const showRoleSwitcher = computed(() => roles.value.length > 1);
/** 退出登录 */
const onLogout = () => {
  ElMessageBox.alert("确定退出登录吗？", "温馨提示", {
    confirmButtonText: "确定",
    showCancelButton: true,
    cancelButtonText: "取消",
    draggable: true,
    type: "warning",
    customClass: "message-box-custom",
    beforeClose: async (action, instance, done) => {
      if (action === "confirm") {
        await apiSystemUserLogout();
        _utils.loginClear();
        Router.push({ name: "login" });
        done();
      } else {
        done();
      }
    },
  })
    .then(() => {})
    .catch(() => {});
};
const onDropdownCommand = (command: string) => {
  if (command === CommandType.logout) {
    onLogout();
  } else {
    let RouteName = "";
    switch (command) {
      case CommandType.systemUserinfo:
        RouteName = "systemUserinfo";
        break;
      case CommandType.passwordChange:
        RouteName = "passwordChange";
        break;
      case CommandType.passwordReset:
        RouteName = "passwordReset";
        break;
    }
    Router.push({ name: RouteName });
  }
};
/** 切换组织 */
const onDropdownOrg = (data: Obj) => {
  if (data?.org_id === Storage.get("orgID")) {
    return;
  }
  Storage.set("orgID", data.org_id);
  currentOrg.value = data.org_name;
  // 刷新页面
  window.location.reload();
};

/** 切换角色 */
const onDropdownRole = (data: Obj) => {
  if (data?.role_id === Storage.get("roleID")) {
    return;
  }
  const user = Storage.get("SystemUserinfo") ?? {};
  Storage.set("roleID", data.role_id);
  const nextUser = {
    ...user,
    role_id: data.role_id,
    role_code: data.role_code || data.code,
    role_name: data.role_name,
    rule: data.rule,
  };
  Storage.set("SystemUserinfo", nextUser);
  currentRole.value = data.role_name;
  window.location.reload();
};

const onNotifyPath = () => {
  MenuStore.$patch(state => {
    state.refresh = new Date().getTime();
  });
  Router.push({ name: "notification" });
};

onMounted(() => {
  systemUserinfo.value = Storage.get("SystemUserinfo") ?? {};
  currentOrg.value = orgs.find(item => item.org_id === Storage.get("orgID"))?.org_name || "";
  currentRole.value =
    roles.value.find(item => item.role_id === Storage.get("roleID"))?.role_name || systemUserinfo.value?.role_name || "";
});
</script>

<style lang="scss" scoped>
.information {
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  padding: 0 var(--gap);
  box-sizing: border-box;
  .header {
    display: flex;
    align-items: center;
    column-gap: 24px;
  }
  .dept {
    margin-top: var(--gap-sm);
    color: var(--el-color-white);
    font-size: var(--font-size-xs);
  }
}

.department {
  margin: 0 var(--gap);
  padding: var(--gap-lg);
  background: var(--bg-color-md);
  border-radius: var(--radius-md);
  cursor: pointer;
}

.notification {
  margin-right: var(--gap);
  cursor: pointer;
  .el-icon {
    color: var(--el-color-white);
    font-size: 20px;
  }
}

.dropdown {
  .trigger {
    display: flex;
    align-items: center;
    color: var(--el-color-white);
    cursor: pointer;
    &:focus-visible {
      outline: none;
    }
    .name {
      margin-right: var(--gap-xs);
      font-size: var(--font-size-md);
    }
  }
}

// .dropdown-container {
//     .el-dropdown-menu {
//         padding: var(--gap);
//     }
//     .el-dropdown-menu__item {
//         padding: var(--gap-md) var(--gap);
//         .el-icon {
//             margin-right: var(--gap-lg);
//         }
//     }
// }
</style>
