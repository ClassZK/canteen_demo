<template>
  <div class="layout-table leave-application-page" v-loading="loading" element-loading-text="数据加载中">
    <div class="query-container">
      <div class="query-left">
        <ElForm :inline="true" :model="query">
          <IPlatformOrgFilter v-model="query.org_id" @change="onSearch"></IPlatformOrgFilter>
          <ElFormItem label="人员姓名">
            <ElInput v-model.trim="query.name" clearable placeholder="请输入人员姓名" @keyup.enter="onSearch" />
          </ElFormItem>
          <ElFormItem label="请假时间">
            <ElDatePicker
              v-model="query.dateRange"
              type="daterange"
              value-format="YYYY-MM-DD"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              range-separator="-"
            />
          </ElFormItem>
        </ElForm>
      </div>
      <div class="query-right">
        <ElButton type="primary" @click="onSearch">搜索</ElButton>
        <ElButton type="primary" @click="openSubmit">提交申请</ElButton>
      </div>
    </div>

    <div class="table-container">
      <ElTable height="100%" scrollbar-always-on :data="rows" table-layout="fixed">
        <ElTableColumn label="请假人" prop="applicant_name" min-width="130" show-overflow-tooltip />
        <ElTableColumn label="请假时间" min-width="250" show-overflow-tooltip>
          <template #default="{ row }">{{ formatRange(row) }}</template>
        </ElTableColumn>
        <ElTableColumn label="请假理由" prop="reason" min-width="220" show-overflow-tooltip />
        <ElTableColumn label="提交时间" prop="submit_time" min-width="170" />
        <ElTableColumn label="审批状态" prop="status_text" width="130" align="center">
          <template #default="{ row }">
            <ElTag :type="statusTag(row.status_text)">{{ row.status_text }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="120" fixed="right" align="center">
          <template #default="{ row }">
            <ElButton text type="primary" @click="openDetail(row)">查看详情</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>

    <IPage :total="total" :page="query.page" :size="query.size" @change="onPage"></IPage>

    <ElDialog v-model="submitDialog.visible" title="提交请假申请" width="720px" destroy-on-close>
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="110px" label-position="top">
        <ElFormItem label="请假时间" prop="dateRange">
          <ElDatePicker
            v-model="form.dateRange"
            type="datetimerange"
            value-format="YYYY-MM-DD HH:mm:ss"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            range-separator="-"
          />
        </ElFormItem>
        <ElFormItem label="请假理由" prop="reason">
          <ElInput v-model.trim="form.reason" type="textarea" :rows="4" maxlength="200" show-word-limit placeholder="请输入请假理由" />
        </ElFormItem>
        <ElFormItem label="工作交接人" prop="handover_user_id">
          <ElSelect v-model="form.handover_user_id" filterable clearable placeholder="请选择工作交接人">
            <ElOption
              v-for="item in handoverUsers"
              :key="item.id"
              :label="`${item.name}（${item.role_name}）`"
              :value="item.id"
            />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <div class="approval-flow">
        <div v-for="(item, index) in submitProcessNodes" :key="item.label" class="approval-node done">
          <div class="node-mark">{{ index + 1 }}</div>
          <div class="node-body">
            <strong>{{ item.label }}</strong>
            <span>{{ item.name }}</span>
            <small>{{ item.tip }}</small>
          </div>
        </div>
      </div>
      <template #footer>
        <ElButton @click="submitDialog.visible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitDialog.saving" @click="submitLeave">确定</ElButton>
      </template>
    </ElDialog>

    <ElDialog v-model="detail.visible" title="请假申请详情" width="680px" destroy-on-close>
      <ElDescriptions :column="1" border>
        <ElDescriptionsItem label="请假时间">{{ formatRange(detail.row) }}</ElDescriptionsItem>
        <ElDescriptionsItem label="请假理由">{{ detail.row.reason }}</ElDescriptionsItem>
        <ElDescriptionsItem label="工作交接人">{{ detail.row.handover_name || "-" }}</ElDescriptionsItem>
        <ElDescriptionsItem label="审批状态">{{ detail.row.status_text }}</ElDescriptionsItem>
      </ElDescriptions>
      <div class="approval-flow detail-flow">
        <div
          v-for="(item, index) in processNodes(detail.row)"
          :key="item.label"
          class="approval-node"
          :class="{ done: item.done, current: item.current, rejected: item.rejected }"
        >
          <div class="node-mark">{{ index + 1 }}</div>
          <div class="node-body">
            <strong>{{ item.label }}</strong>
            <span>{{ item.name }}</span>
            <small>{{ item.time || item.tip }}</small>
          </div>
        </div>
      </div>
      <template #footer>
        <ElButton @click="detail.visible = false">关闭</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import type { FormInstance, FormRules, TagProps } from "element-plus";
import { ElMessage } from "element-plus";
import Storage from "tddev/storage";
import { apiAttendanceApprovalUsers, apiAttendanceHandoverUsers, apiAttendanceLeaveList, apiAttendanceLeaveSubmit } from "@/api/attendance";

const loading = ref(false);
const rows = ref<Obj[]>([]);
const total = ref(0);
const handoverUsers = ref<Obj[]>([]);
const approvalUsers = ref<Obj>({});
const formRef = ref<FormInstance>();
const userInfo: Obj = Storage.get("SystemUserinfo") || {};
const activeRoleId = Storage.get("roleID") || userInfo.role_id;
const activeRole = Array.isArray(userInfo.roles)
  ? userInfo.roles.find((item: Obj) => item.role_id === activeRoleId || item.id === activeRoleId) || {}
  : {};

const query = reactive({
  page: 1,
  size: 20,
  org_id: "",
  name: "",
  dateRange: [] as string[],
});

const form = reactive({
  dateRange: [] as string[],
  reason: "",
  handover_user_id: "",
});

const rules = computed<FormRules>(() => {
  const base: FormRules = {
    dateRange: [{ required: true, message: "请选择请假时间", trigger: "change" }],
    reason: [{ required: true, message: "请输入请假理由", trigger: "blur" }],
    handover_user_id: [{ required: true, message: "请选择工作交接人", trigger: "change" }],
  };
  return base;
});

const submitDialog = reactive({
  visible: false,
  saving: false,
});

const detail = reactive({
  visible: false,
  row: {} as Obj,
});

const submitProcessNodes = computed(() => [
  { label: "发起人", name: userInfo.nick || userInfo.name || "当前用户", tip: "提交申请" },
  { label: "审批人", name: approvalUsers.value.approver?.name || "测试食堂管理员", tip: "待审批" },
  { label: "抄送人", name: approvalUsers.value.cc_user?.name || "测试项目经理", tip: "审批通过后抄送" },
]);

const statusTag = (status: string): TagProps["type"] => {
  const map: Record<string, TagProps["type"]> = {
    审批中: "warning",
    审批通过: "success",
    审批不通过: "danger",
  };
  return map[status] || "info";
};

const formatRange = (row: Obj = {}) => `${row.leave_start_time || "-"} 至 ${row.leave_end_time || "-"}`;

const processNodes = (row: Obj = {}) => {
  const status = row.status_text || "审批中";
  return [
    {
      label: "发起人",
      name: row.applicant_name || userInfo.nick || userInfo.name || "当前用户",
      time: row.submit_time,
      done: true,
      current: false,
      rejected: false,
      tip: "已提交",
    },
    {
      label: "审批人",
      name: row.approver_name || "测试食堂管理员",
      time: row.approve_time,
      done: status === "审批通过" || status === "审批不通过",
      current: status === "审批中",
      rejected: status === "审批不通过",
      tip: status === "审批中" ? "审批中" : status,
    },
    {
      label: "抄送人",
      name: row.cc_name || "测试项目经理",
      time: row.cc_time,
      done: status === "审批通过",
      current: false,
      rejected: false,
      tip: status === "审批通过" ? "已抄送" : "待抄送",
    },
  ];
};

const loadData = async () => {
  loading.value = true;
  try {
    const { success, data, message } = await apiAttendanceLeaveList({
      page: query.page,
      size: query.size,
      org_id: query.org_id,
      name: query.name,
      start_time: query.dateRange?.[0] || "",
      end_time: query.dateRange?.[1] || "",
    });
    if (!success) {
      ElMessage.warning(message || "获取请假申请失败");
      return;
    }
    rows.value = data?.list || [];
    total.value = Number(data?.total || 0);
  } finally {
    loading.value = false;
  }
};

const loadHandoverUsers = async () => {
  const { success, data } = await apiAttendanceHandoverUsers();
  if (success) {
    handoverUsers.value = data?.list || [];
  }
};

const loadApprovalUsers = async () => {
  const { success, data } = await apiAttendanceApprovalUsers();
  if (success) {
    approvalUsers.value = data || {};
  }
};

const resetForm = () => {
  form.dateRange = [];
  form.reason = "";
  form.handover_user_id = "";
  formRef.value?.clearValidate();
};

const openSubmit = async () => {
  resetForm();
  submitDialog.visible = true;
  if (!approvalUsers.value.approver) {
    await loadApprovalUsers();
  }
  if (handoverUsers.value.length === 0) {
    await loadHandoverUsers();
  }
};

const submitLeave = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  submitDialog.saving = true;
  try {
    const handover = handoverUsers.value.find(item => item.id === form.handover_user_id) || {};
    const { success, message } = await apiAttendanceLeaveSubmit({
      org_id: query.org_id,
      leave_start_time: form.dateRange[0],
      leave_end_time: form.dateRange[1],
      reason: form.reason,
      handover_user_id: form.handover_user_id,
      handover_name: handover.name,
      handover_temp_role_id: activeRole.role_id || userInfo.role_id,
      handover_temp_role_name: activeRole.role_name || userInfo.role_name,
    });
    if (!success) {
      ElMessage.warning(message || "提交请假申请失败");
      return;
    }
    ElMessage.success("请假申请已提交");
    submitDialog.visible = false;
    await loadData();
  } finally {
    submitDialog.saving = false;
  }
};

const openDetail = (row: Obj) => {
  detail.row = row;
  detail.visible = true;
};

const onSearch = () => {
  query.page = 1;
  loadData();
};

const onPage = (page: { page: number; size: number }) => {
  query.page = page.page;
  query.size = page.size;
  loadData();
};

loadData();
loadApprovalUsers();
</script>

<style lang="scss" scoped>
.leave-application-page {
  gap: 0;
}

.approval-flow {
  display: flex;
  gap: 0;
  margin-top: 12px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
}

.approval-node {
  position: relative;
  display: flex;
  align-items: flex-start;
  flex: 1;
  gap: 10px;
}

.approval-node:not(:last-child)::after {
  position: absolute;
  top: 14px;
  left: 34px;
  right: 12px;
  height: 2px;
  background: #e5e7eb;
  content: "";
}

.node-mark {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: #64748b;
  background: #f1f5f9;
  font-weight: 700;
}

.node-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  padding-right: 16px;
}

.node-body strong {
  color: #111827;
}

.node-body span {
  color: #334155;
}

.node-body small {
  color: #64748b;
}

.approval-node.done .node-mark {
  color: #fff;
  background: #16a34a;
}

.approval-node.done:not(:last-child)::after {
  background: #86efac;
}

.approval-node.current .node-mark {
  color: #fff;
  background: var(--el-color-primary);
}

.approval-node.rejected .node-mark {
  color: #fff;
  background: #dc2626;
}

.detail-flow {
  margin-top: 14px;
}
</style>
