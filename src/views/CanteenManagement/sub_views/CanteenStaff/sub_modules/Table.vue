<template>
  <div class="layout-table" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
    <div class="query-container">
      <div class="query-left">
        <ElForm ref="formRef" :model="tableModel.query">
          
          <IPlatformOrgFilter></IPlatformOrgFilter><ElFormItem label="姓名" prop="name">
            <ElInput
              v-model.trim="tableModel.query.name"
              maxlength="10"
              show-word-limit
              clearable
              placeholder="姓名"
            ></ElInput>
          </ElFormItem>
          <ElFormItem label="联系电话" prop="phone">
            <ElInput
              v-model.trim="tableModel.query.phone"
              maxlength="11"
              show-word-limit
              clearable
              placeholder="联系电话"
            ></ElInput>
          </ElFormItem>
          <ElFormItem label="状态" prop="status">
            <ElSelect v-model="tableModel.query.status" clearable placeholder="状态">
              <ElOption
                v-for="item of PractitionerStatusList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              ></ElOption>
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="健康证状态" prop="health_cert_status">
            <ElSelect v-model="tableModel.query.health_cert_status" clearable placeholder="健康证状态">
              <ElOption
                v-for="item of HealthCertStatusList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              ></ElOption>
            </ElSelect>
          </ElFormItem>
        </ElForm>
      </div>
      <div class="query-right">
        <ElButton type="primary" @click="onTableAdd">新增</ElButton>
        <ElButton @click="onTableImport">导入</ElButton>
        <ElButton type="primary" @click="onTableSearch">查询</ElButton>
        <ElButton class="gray" @click="onTableReset">重置</ElButton>
      </div>
    </div>
    <div class="staff-summary">
      <span class="summary-label">总员工数</span>
      <span class="summary-value">{{ tableModel.total }}</span>
    </div>
    <div class="table-container">
      <ElTable height="100%" scrollbar-always-on :data="tableModel.data">
        
        <IPlatformOrgColumn></IPlatformOrgColumn><ElTableColumn label="照片" prop="user_avatar_uri" width="100" align="center" show-overflow-tooltip>
          <template #default="scope">
            <ITablePreview :image="scope.row.user_avatar_uri"></ITablePreview>
          </template>
        </ElTableColumn>
        <ElTableColumn
          label="姓名"
          prop="user_name"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn
          label="联系电话"
          prop="phone"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn label="状态" prop="status" min-width="100" align="center">
          <template #default="scope">
            <ElTag :type="getPractitionerStatusType(scope.row.status)">
              {{ getPractitionerStatusName(scope.row.status) }}
            </ElTag>
          </template>
        </ElTableColumn>

        <ElTableColumn label="岗位" prop="position" min-width="150" align="center" show-overflow-tooltip></ElTableColumn>
        <ElTableColumn label="性别" prop="_sex" min-width="150" align="center" show-overflow-tooltip></ElTableColumn>
        <ElTableColumn label="年龄" prop="age" min-width="150" align="center" show-overflow-tooltip></ElTableColumn>
        <ElTableColumn
          label="身份证号"
          prop="id_card"
          min-width="180"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn label="角色" prop="role_name" min-width="150" align="center" show-overflow-tooltip>
          <template #default="scope">
            {{ CanteenStaffAuxStore.RoleList.find(item => item.role_id === scope.row.role)?.role_name || "-" }}
          </template>
        </ElTableColumn>

        <ElTableColumn label="健康证" prop="health_cert" min-width="180" align="center" show-overflow-tooltip>
          <template #default="scope">
            <ITablePreview :image="scope.row.health_cert"></ITablePreview>
          </template>
        </ElTableColumn>
        <ElTableColumn
          label="健康证有效期"
          prop="health_cert_expire_date"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn label="健康证状态" prop="health_cert_status" min-width="130" align="center">
          <template #default="scope">
            <ElTag :type="getHealthCertStatusType(scope.row.health_cert_status)">
              {{ getHealthCertStatusName(scope.row.health_cert_status) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="无犯罪证明" prop="no_criminal_cert" min-width="160" align="center" show-overflow-tooltip>
          <template #default="scope">
            <ITablePreview :image="scope.row.no_criminal_cert"></ITablePreview>
          </template>
        </ElTableColumn>
        <ElTableColumn label="证书" prop="certificate" min-width="180" align="center" show-overflow-tooltip>
          <template #default="scope">
            <ITablePreview :image="scope.row.certificate"></ITablePreview>
          </template>
        </ElTableColumn>

        <ElTableColumn fixed="right" label="操作" width="150" align="center">
          <template #default="scope">
            <div class="handle">
              <ElButton type="primary" link @click="onTableUpdate(scope.row)">编辑</ElButton>

              <ElButton type="primary" link @click="onTableDetail(scope.row)">详情</ElButton>
              <ElButton v-if="isPractitionerActive(scope.row.status)" type="warning" link @click="onTableResign(scope.row)">
                离职
              </ElButton>
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
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from "vue";
import { useCanteenStaffAuxStore } from "../aux_modules/store";
import { OperationTypeEnum, Message, SexList } from "@/global/const";
import _utils from "@/utils/index";
import { apiCanteenStaffList, apiCanteenStaffResign, apiCanteenRoleList } from "@/api/recipe";

const CanteenStaffAuxStore = useCanteenStaffAuxStore();
const formRef = ref();

/** 交互反馈数据 */
const tableModel = reactive<{
  vLoading: boolean;
  query: Obj;
  total: number;
  data: Obj[];
}>({
  vLoading: false,
  query: {
    page: 1,
    size: 20,
    name: "",
    phone: "",
    status: "",
    health_cert_status: "",
  },
  total: 0,
  data: [],
});

/** 请求 */
const onTableRequest = async () => {
  tableModel.vLoading = true;
  try {
    const { success, data, message } = await apiCanteenStaffList({
      ...tableModel.query,
      status: normalizePractitionerStatusQuery(tableModel.query.status),
    });
    if (success) {
      const list = _utils.getDefaultArray(data?.list);
      tableModel.data = list.map((item: Obj) => {
        item._sex = SexList[Number(item.sex)]?.name || "-";
        return item;
      });
      tableModel.total = data?.total || 0;
    } else {
      Message.warning(message || "查询从业人员失败");
    }
  } catch {
    Message.warning("查询从业人员失败");
  } finally {
    tableModel.vLoading = false;
  }
};

/** 分页 */
const onTablePage = (object: { page: number; size: number }) => {
  tableModel.query.page = object.page;
  tableModel.query.size = object.size;
  onTableRequest();
};
/** 查询 */
const onTableSearch = () => {
  tableModel.query.page = 1;
  onTableRequest();
};
/** 重置 */
const onTableReset = () => {
  tableModel.query.name = "";
  tableModel.query.phone = "";
  tableModel.query.status = "";
  tableModel.query.health_cert_status = "";
  onTableSearch();
};
/** 新增 */
const onTableAdd = () => {
  CanteenStaffAuxStore.$patch(state => {
    state.OperationType = OperationTypeEnum.add;
  });
};
/** 导入 */
const onTableImport = () => {
  CanteenStaffAuxStore.$patch(state => {
    state.OperationType = OperationTypeEnum.import;
  });
};
/** 编辑 */
const onTableUpdate = (data: Obj) => {
  CanteenStaffAuxStore.$patch(state => {
    data.isHealth = false;
    state.data = data;
    state.OperationType = OperationTypeEnum.update;
  });
};
/** 编辑 */
const onTableDetail = (data: Obj) => {
  CanteenStaffAuxStore.$patch(state => {
    state.data = data;
    state.OperationType = OperationTypeEnum.detail;
  });
};

/** 离职 */
const onTableResign = (data: Obj) => {
  ElMessageBox.alert(`确定将 ${data.user_name} 标记为离职吗？`, "温馨提示", {
    confirmButtonText: "确定",
    showCancelButton: true,
    cancelButtonText: "取消",
    draggable: true,
    type: "warning",
    customClass: "message-box-custom",
    beforeClose: async (action, instance, done) => {
      if (action === "confirm") {
        instance.confirmButtonLoading = true;
        const { success, message } = await apiCanteenStaffResign({
          id: data.id,
        });
        if (success) {
          done();
          onTableRequest();
          Message.success(`${data.user_name} 已离职`);
        } else {
          Message.warning(message);
        }
        // instance.confirmButtonLoading = false;
      } else {
        done();
      }
    },
  })
    .then(() => {})
    .catch(() => {});
};

/** 请求角色列表 */
const onRoleListRequest = async () => {
  const { success, data, message } = await apiCanteenRoleList();
  if (success) {
    CanteenStaffAuxStore.RoleList = _utils.getDefaultArray(data.list);
  } else {
    Message.warning(message);
  }
};
onRoleListRequest();

const HealthCertStatusList = [
  { name: "未填写", value: "missing" },
  { name: "即将到期", value: "expiring" },
  { name: "已到期", value: "expired" },
  { name: "正常", value: "normal" },
];

const PractitionerStatusList = [
  { name: "在职", value: "0" },
  { name: "离职", value: "1" },
];

const normalizePractitionerStatus = (status?: string | number | null) => {
  if (status === undefined || status === null || status === "") {
    return "0";
  }
  return String(status);
};

const normalizePractitionerStatusQuery = (status?: string | number | null) => {
  const value = String(status ?? "").trim();
  if (value === "在职") {
    return "0";
  }
  if (value === "离职") {
    return "1";
  }
  return value === "0" || value === "1" ? value : "";
};

const getPractitionerStatusName = (status?: string | number | null) => {
  const normalizedStatus = normalizePractitionerStatus(status);
  return PractitionerStatusList.find(item => item.value === normalizedStatus)?.name || "-";
};

const getPractitionerStatusType = (status?: string | number | null) => {
  return normalizePractitionerStatus(status) === "1" ? "info" : "success";
};

const isPractitionerActive = (status?: string | number | null) => {
  return normalizePractitionerStatus(status) === "0";
};

const getHealthCertStatusName = (status: string) => {
  return HealthCertStatusList.find(item => item.value === status)?.name || "-";
};

const getHealthCertStatusType = (status: string) => {
  const statusTypeMap: Obj = {
    missing: "info",
    expiring: "warning",
    expired: "danger",
    normal: "success",
  };
  return statusTypeMap[status] || "info";
};

onTableRequest();

watch(
  () => CanteenStaffAuxStore.refresh,
  () => {
    onTableRequest();
  }
);

</script>

<style lang="scss" scoped>
.staff-summary {
  display: inline-flex;
  align-items: center;
  gap: var(--gap-sm);
  min-height: 36px;
  margin-bottom: var(--gap-md);
  padding: 0 var(--gap-lg);
  border: 1px solid var(--bd-color-md);
  border-radius: var(--radius-md);
  background: var(--bg-color-xs);

  .summary-label {
    color: var(--font-color-md);
  }

  .summary-value {
    color: var(--el-color-primary);
    font-size: 18px;
    font-weight: 600;
  }
}
</style>
