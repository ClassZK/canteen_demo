<template>
  <div class="layout-horizontal">
    <Tree ref="treeRef" @change="onTreeNodeClick"> </Tree>
    <div class="layout-table" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
      <div class="query-container">
        <div class="query-left">
          <ElForm ref="formRef" :model="tableModel.query" @submit.prevent>
            <ElFormItem label="组织名称" prop="name">
              <ElInput
                v-model="tableModel.query.name"
                maxlength="10"
                show-word-limit
                clearable
                placeholder="请输入组织名称"
              ></ElInput>
            </ElFormItem>
          </ElForm>
        </div>
        <div class="query-right">
          <ElButton type="primary" :disabled="!tableModel.query.parent_id" @click="onTableAdd"> 新增 </ElButton>
          <ElButton type="primary" @click="onTableSearch">查询</ElButton>
          <ElButton class="rg" @click="onTableReset">重置</ElButton>
        </div>
      </div>
      <div class="table-container">
        <ElTable height="100%" row-key="id" scrollbar-always-on :data="tableModel.data">
          <ElTableColumn label="组织名称" prop="name" min-width="80" align="left" show-overflow-tooltip></ElTableColumn>
          <ElTableColumn label="组织类型" prop="unit_attr_name" min-width="90" align="center" show-overflow-tooltip>
            <template #default="scope">
              {{ getOrgTypeName(scope.row) }}
            </template>
          </ElTableColumn>
          <ElTableColumn label="所属上级" prop="parent_name" min-width="140" align="center" show-overflow-tooltip>
            <template #default="scope">
              {{ scope.row.parent_name || findParentName(scope.row.parent_id || scope.row.pid) || "--" }}
            </template>
          </ElTableColumn>

          <ElTableColumn label="组织图标" prop="icon_url" min-width="80" align="center" show-overflow-tooltip>
            <template #default="scope">
              <ITablePreview :image="scope.row.icon_url"></ITablePreview>
            </template>
          </ElTableColumn>
          <ElTableColumn
            label="组织编码"
            prop="code"
            min-width="150"
            align="center"
            show-overflow-tooltip
          ></ElTableColumn>
          <ElTableColumn label="组织地址" prop="address" min-width="80" align="center" show-overflow-tooltip>
          </ElTableColumn>
          <ElTableColumn label="负责人" prop="contact_name" min-width="100" align="center" show-overflow-tooltip></ElTableColumn>
          <ElTableColumn label="联系电话" prop="contact_phone" min-width="120" align="center" show-overflow-tooltip></ElTableColumn>
          <ElTableColumn
            label="经营许可证编号"
            prop="business_license_no"
            min-width="150"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scope">
              <span v-if="scope.row.unit_attr === '8'">{{ scope.row.business_license_no || "--" }}</span>
              <span v-else>--</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="经营许可证图片" prop="business_license_image" min-width="120" align="center">
            <template #default="scope">
              <ITablePreview v-if="scope.row.unit_attr === '8'" :image="scope.row.business_license_image"></ITablePreview>
              <span v-else>--</span>
            </template>
          </ElTableColumn>
          <ElTableColumn
            label="许可证有效期"
            prop="business_license_expire_date"
            min-width="130"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scope">
              <span v-if="scope.row.unit_attr === '8'">{{ scope.row.business_license_expire_date || "--" }}</span>
              <span v-else>--</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="是否自营食堂" prop="independent" min-width="80" align="center" show-overflow-tooltip>
            <template #default="scope">
              <p v-if="scope.row.unit_attr === '8'">{{ scope.row.independent ? "是" : "否" }}</p>
              <p v-else>--</p>
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" min-width="180" align="center">
            <template #default="scope">
              <div class="handle">
                <ElButton
                  type="primary"
                  v-if="scope.row.unit_attr !== ORG_UNIT_ATTR[2].value"
                  link
                  @click="onTreeChildrenAdd(scope.row)"
                  >新增下级</ElButton
                >
                <ElButton type="primary" link @click="onTableUpdate(scope.row)">编辑</ElButton>
                <ElButton type="danger" link @click="onTableDelete(scope.row)">删除</ElButton>
              </div>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
      <IPage
        :total="tableModel.total"
        :page="tableModel.query.page"
        :size="tableModel.query.size"
        @change="onTablePage"
      ></IPage>
    </div>
    <AddEidt v-if="showLog" @close="showLog = false" :Id="CurId" :Pid="CurPid" @submit="onTableRequest"></AddEidt>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import Tree from "./sub_modules/Tree.vue";
import { useOrganizationAuxStore } from "./aux_modules/store";
import { ORG_UNIT_ATTR } from "./aux_modules/const";
import { apiAdminDistrictPage, apiAdminDistrictTree, apiAdminDistrictDelete } from "@/api/management";
import AddEidt from "./sub_modules/AddEidt.vue";
import _ from "tddev/utils";
const showLog = ref(false);
const OrganizationAuxStore = useOrganizationAuxStore();
const formRef = ref();
const treeRef = ref();
const CurId = ref<number>(0);
const CurPid = ref<number>(0);
/** 交互反馈数据 */
const tableModel = reactive<Obj>({
  loading: false,
  vLoading: false,
  query: {
    name: "",
    page: 1,
    size: 10,
    parent_id: "",
    unit_attr: ORG_UNIT_ATTR[2].value,
  },
  total: 0,
  data: [],
  selection: [],
  treeData: [],
});
/** 请求 */
const onTableRequest = async () => {
  tableModel.loading = true;
  const { success, data, message } = await apiAdminDistrictPage(tableModel.query);
  if (success) {
    tableModel.data = data?.list || [];
    tableModel.total = data?.total || 0;
  } else {
    ElMessage.error(message || "获取组织列表失败");
  }

  tableModel.loading = false;
};
// 管理员获取组织数
/** 分页 */
const onTablePage = (object: { page: number; size: number }) => {
  tableModel.query.page = object.page;
  tableModel.query.size = object.size;
  onTableRequest();
};
/** 新增下同级 */
const onTreeChildrenAdd = (data: Obj) => {
  OrganizationAuxStore.logType = 0;
  OrganizationAuxStore.pid = data.id;
  OrganizationAuxStore.checked = data;
  showLog.value = true;
};
/** 查询 */
const onTableSearch = () => {
  onTableRequest();
};
// useEnter(onTableSearch);
/** 重置 */
const onTableReset = () => {
  tableModel.query.name = "";
  tableModel.query.unit_attr = ORG_UNIT_ATTR[2].value;
  tableModel.query.page = 1;
  treeRef.value?.clearCurrent();
};
/** 新增 */
const onTableAdd = () => {
  if (!tableModel.query.parent_id) {
    ElMessage.warning("请先选择左侧父组织");
    return;
  }
  OrganizationAuxStore.logType = 0;
  showLog.value = true;
  OrganizationAuxStore.pid = tableModel.query.parent_id;
  OrganizationAuxStore.checked = treeRef.value?.getCurrent?.() || OrganizationAuxStore.checked;
};
/** 编辑 */
const onTableUpdate = (data: Obj) => {
  OrganizationAuxStore.logType = 1;
  OrganizationAuxStore.pid = "";
  OrganizationAuxStore.current = data;
  showLog.value = true;
};
/** 删除 */
const onTableDelete = async (data: Obj) => {
  ElMessageBox.alert(`确定删除组织 ${data.name} 吗？`, "温馨提示", {
    confirmButtonText: "确定",
    showCancelButton: true,
    cancelButtonText: "取消",
    draggable: true,
    type: "warning",
    customClass: "message-box-custom",
    beforeClose: async (action, instance, done) => {
      if (action === "confirm") {
        instance.confirmButtonLoading = true;
        const { success, message } = await apiAdminDistrictDelete({ id: data.id });
        if (success) {
          ElMessage.success("删除成功");
          onTableRequest();
          OrganizationAuxStore.getOrg = !OrganizationAuxStore.getOrg;
        } else {
          ElMessage.error(message || "删除失败");
        }
        instance.confirmButtonLoading = false;
        done();
      } else {
        done();
      }
    },
  })
    .then(() => {})
    .catch(() => {});
};

/** 树节点点击 */
const onTreeNodeClick = (data: Obj) => {
  tableModel.query.parent_id = data.id;
  tableModel.query.unit_attr = "";
  tableModel.query.page = 1;
  onTableRequest();
};

const flattenTree = (tree: Obj[]): Obj[] =>
  tree.flatMap(item => [item, ...flattenTree(Array.isArray(item.children) ? item.children : [])]);
const findParentName = (parentId: string) => {
  if (!parentId) return "--";
  return flattenTree(tableModel.treeData || []).find(item => item.id === parentId || item.org_id === parentId)?.name || "--";
};
const getOrgTypeName = (data: Obj) => {
  const type = ORG_UNIT_ATTR.find(item => item.value === data.unit_attr);
  return data.unit_attr_name || type?.label || data.org_type_name || "--";
};

// 获取行政区划树
const onDistrictTree = async () => {
  const { success, data, message } = await apiAdminDistrictTree();
  if (success) {
    OrganizationAuxStore.districtTree = _.getArray(data.list, []);
    tableModel.treeData = _.getArray(data.list, []);
  } else {
    ElMessage.error(message || "获取行政区划树失败");
  }
};

onMounted(() => {
  onDistrictTree();
});
</script>

<style lang="scss" scoped>
.layout-horizontal {
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  column-gap: 16px;
  box-sizing: border-box;
  .layout-horizontal {
    flex: 1;
  }
}
</style>
