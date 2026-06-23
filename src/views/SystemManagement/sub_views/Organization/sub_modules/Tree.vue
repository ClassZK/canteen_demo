<template>
  <div class="tree-custom mgr" v-loading="treeModel.loading" element-loading-text="数据加载中">
    <div class="header">
      <ElInput v-model="treeModel.keyword" maxlength="10" show-word-limit clearable placeholder="组织名称"></ElInput>
    </div>
    <ElTree
      ref="treeRef"
      :data="treeModel.data"
      highlight-current
      default-expand-all
      :expand-on-click-node="false"
      node-key="id"
      :props="treeModel.props"
      :current-node-key="currentNodeKey"
      :filter-node-method="onTreeFilterNodeMethod"
      @node-click="onTreeNodeClick"
    >
    </ElTree>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import _utils from "@/utils/index";
import _ from "tddev/utils";
import { ElMessageBox, ElMessage } from "element-plus";
import { useOrganizationAuxStore } from "../aux_modules/store";
import { apiAdminDistrictTreePage } from "@/api/management";
const emits = defineEmits(["change"]);
const OrganizationAuxStore = useOrganizationAuxStore();
const treeRef = ref();
const props = defineProps({
  changdata: {
    type: Boolean,
  },
});
const treeModel = reactive<Obj>({
  loading: false,
  nodeKey: "id",
  props: {
    label: "name",
    value: "id",
    children: "child",
  },
  keyword: "",
  data: [],
  checked: {
    id: "",
    name: "",
    children: [],
  } as Obj,
});

const contextmenuModel = reactive({
  visible: false,
  top: "",
  left: "",
});
const defaultCheckedKeys = ref<string[]>([]);
const currentNodeKey = ref<string>("");
/** 组织 */
const getApiOrganizationTree = async () => {
  treeModel.loading = true;
  const { success, data } = await apiAdminDistrictTreePage();
  if (success) {
    treeModel.data = _.getArray(data.list, []) || [];
    if (_.isNotEmptyArray(treeModel.data)) {
      const currentNode = currentNodeKey.value ? findCheckedNode(treeModel.data, currentNodeKey.value) : null;
      if (currentNode) {
        currentNodeKey.value = currentNode.id;
        defaultCheckedKeys.value = [currentNode.id];
        await nextTick();
        treeRef.value?.setCurrentKey(currentNode.id);
      } else {
        currentNodeKey.value = "";
        defaultCheckedKeys.value = [];
        treeModel.checked = {
          id: "",
          name: "",
          children: [],
        };
      }
    } else {
      currentNodeKey.value = "";
      defaultCheckedKeys.value = [];
      treeModel.checked = {
        id: "",
        name: "",
        children: [],
      };
    }
  }

  treeModel.loading = false;
};

const findCheckedNode = (data: Obj[], id: string): Obj | null => {
  let result: Obj | null = null;
  for (const item of data) {
    if (item.id === id) {
      result = item;
    } else if (item[treeModel.props.children] && item[treeModel.props.children].length > 0) {
      result = findCheckedNode(item[treeModel.props.children], id);
    }
  }
  return result;
};

const onTreeFilterNodeMethod = (value: string, data: Obj) => {
  if (!value) return true;
  return data[treeModel.props.label].includes(value);
};

const onTreeNodeClick = (data: Obj) => {
  treeModel.checked = data;
  currentNodeKey.value = data.id;
  OrganizationAuxStore.$patch(state => {
    state.checked = data;
  });
  emits("change", data);
};

const documentElementClick = (event: Event) => {
  if (contextmenuModel.visible) {
    const contextmenuEl = document.querySelector(".tree-contextmenu");
    const targetEl = event.target;
    if (!contextmenuEl?.contains(targetEl as Node)) {
      contextmenuModel.visible = false;
    }
  }
};

onMounted(async () => {
  getApiOrganizationTree();
  document.documentElement.addEventListener("click", documentElementClick, false);
});
onBeforeUnmount(() => {
  document.documentElement.removeEventListener("click", documentElementClick, false);
});
watch(
  () => treeModel.keyword,
  value => {
    treeRef.value?.filter(value);
  }
);
watch(
  () => OrganizationAuxStore.getOrg,
  value => {
    getApiOrganizationTree();
  }
);

defineExpose({
  clearCurrent: () => {
    currentNodeKey.value = "";
    defaultCheckedKeys.value = [];
    treeModel.checked = {
      id: "",
      name: "",
      children: [],
    };
    treeRef.value?.setCurrentKey();
  },
});
</script>

<style lang="scss" scoped>
.tree-custom {
  display: flex;
  flex-direction: column;
  flex: none;
  width: 300px;
  padding: var(--gap);
  background: var(--el-color-white);
  border-radius: var(--radius-lg);
  box-sizing: border-box;

  .header {
    display: flex;
    align-items: center;
    margin-bottom: var(--gap-md);

    .el-input {
      flex: auto;
    }

    .el-button {
      flex: none;
      margin-left: var(--gap-md);
    }
  }

  ::v-deep(.el-tree) {
    overflow-y: auto;
    flex: auto;
    background: var(--el-color-white);
    box-sizing: border-box;

    .el-tree-node__content {
      height: 40px;
      &:hover {
        background: var(--menu-active-aux-color);
      }
    }

    &.el-tree--highlight-current .is-current > .el-tree-node__content {
      color: var(--el-color-white);
      background: var(--el-color-primary);
      .el-tree-node__expand-icon {
        color: var(--el-color-white);
      }
      .el-text {
        color: var(--el-color-white);
      }
    }

    .el-tree-node__label {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .el-tree-node__expand-icon {
    padding: var(--gap-sm) !important;
    font-size: var(--font-size-lg) !important;
  }

  .tree-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: auto;
  }

  .tree-label-ellipsis {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .handle {
    padding: 0 var(--gap);
    box-sizing: border-box;

    .el-button {
      height: auto;
      padding: 0;
      background: transparent !important;

      &:hover {
        opacity: 0.7;
      }
    }
  }
}

.tree-contextmenu {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 3;
  padding: var(--gap);
  background: var(--el-color-white);
  border-radius: var(--radius-lg);
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);

  li {
    padding: var(--gap);
    cursor: pointer;

    &:hover {
      background: var(--el-color-primary);
      color: var(--el-color-white);
    }
  }
}
</style>
