<template>
  <div class="layout-table shelve-page" v-loading="tableModel.loading" element-loading-text="数据加载中">
    <div class="query-container">
      <div class="query-left">
        <ElForm ref="queryFormRef" :inline="true" :model="tableModel.query">
          
          <IPlatformOrgFilter></IPlatformOrgFilter><ElFormItem label="商品名称" prop="pro_name">
            <ElInput
              v-model.trim="tableModel.query.pro_name"
              maxlength="50"
              show-word-limit
              clearable
              placeholder="商品名称"
              @keyup.enter="onTableSearch"
            />
          </ElFormItem>
          <ElFormItem label="计量方式" prop="measure_type">
            <ElSelect v-model="tableModel.query.measure_type" clearable placeholder="计量方式">
              <ElOption v-for="item of measureTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="状态" prop="status">
            <ElSelect v-model="tableModel.query.status" clearable placeholder="状态">
              <ElOption v-for="item of statusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </ElSelect>
          </ElFormItem>
        </ElForm>
      </div>
      <div class="query-right">
        <ElButton type="primary" @click="onTableSearch">查询</ElButton>
        <ElButton class="gray" @click="onTableReset">重置</ElButton>
        <ElButton type="primary" @click="onOpenCreate">新增</ElButton>
      </div>
    </div>

    <div class="table-container">
      <ElTable height="100%" scrollbar-always-on :data="tableModel.data" table-layout="fixed">
        
        <IPlatformOrgColumn></IPlatformOrgColumn><ElTableColumn label="商品名称" prop="pro_name" min-width="180" align="center" show-overflow-tooltip />
        <ElTableColumn label="计量方式" min-width="120" align="center">
          <template #default="{ row }">{{ getMeasureTypeText(row.measure_type) }}</template>
        </ElTableColumn>
        <ElTableColumn label="状态" min-width="110" align="center">
          <template #default="{ row }">
            <ElTag :type="getStatusTagType(row.status)" effect="light">{{ getStatusText(row.status) }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="申请人" prop="apply_user_name" min-width="120" align="center" show-overflow-tooltip>
          <template #default="{ row }">{{ emptyText(row.apply_user_name) }}</template>
        </ElTableColumn>
        <ElTableColumn label="创建时间" prop="created_at" min-width="180" align="center" show-overflow-tooltip>
          <template #default="{ row }">{{ emptyText(row.created_at) }}</template>
        </ElTableColumn>
        <ElTableColumn label="备注" prop="remark" min-width="180" align="center" show-overflow-tooltip>
          <template #default="{ row }">{{ emptyText(row.remark || row.handle_remark) }}</template>
        </ElTableColumn>
        <ElTableColumn fixed="right" label="操作" width="220" align="center">
          <template #default="{ row }">
            <ElButton v-if="Number(row.status) === 1" link type="primary" @click="onOpenEdit(row)">编辑</ElButton>
            <ElButton v-if="Number(row.status) === 1" link type="danger" @click="onDelete(row)">删除</ElButton>
            <ElButton v-if="Number(row.status) === 1" link type="primary" @click="onSubmit(row)">提交</ElButton>
            <ElButton v-if="Number(row.status) === 2" link type="primary" @click="onRefresh(row)">刷新</ElButton>
            <ElButton link type="primary" @click="onOpenDetail(row)">查看</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>

    <IPage
      :total="tableModel.total"
      :page="tableModel.query.page"
      :size="tableModel.query.size"
      @change="onTablePage"
    />

    <ElDialog
      v-if="formModel.visible"
      v-model="formModel.visible"
      width="850px"
      :title="formModel.title"
      class="dialog-container shelve-dialog"
      modal-class="dialog-overlay-custom"
      draggable
      destroy-on-close
      append-to-body
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @closed="onFormClosed"
    >
      <div class="form-container" v-loading="formModel.loading" element-loading-text="数据加载中">
        <ElForm
          ref="formRef"
          :model="formModel.data"
          :rules="formRules"
          :disabled="formModel.mode === 'detail'"
          label-position="top"
          scroll-to-error
        >
          <ElRow :gutter="40">
            <ElCol :span="24">
              <ElFormItem label="商品名称" prop="pro_name">
                <ElInput v-model.trim="formModel.data.pro_name" maxlength="50" show-word-limit placeholder="请输入商品名称" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="24">
              <ElFormItem label="计量方式" prop="measure_type">
                <ElSelect v-model="formModel.data.measure_type" clearable placeholder="请选择计量方式">
                  <ElOption v-for="item of measureTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :span="24">
              <ElFormItem label="备注" prop="remark">
                <ElInput
                  v-model.trim="formModel.data.remark"
                  maxlength="200"
                  show-word-limit
                  type="textarea"
                  :rows="4"
                  placeholder="请输入备注"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow v-if="formModel.mode === 'detail'" :gutter="40" class="detail-row">
            <ElCol :span="12">
              <ElFormItem label="申请人">
                <ElInput :model-value="emptyText(formModel.data.apply_user_name)" disabled />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="申请时间">
                <ElInput :model-value="emptyText(formModel.data.apply_time)" disabled />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="处理人">
                <ElInput :model-value="emptyText(formModel.data.handle_user_name)" disabled />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="处理时间">
                <ElInput :model-value="emptyText(formModel.data.handle_time)" disabled />
              </ElFormItem>
            </ElCol>
            <ElCol :span="24">
              <ElFormItem label="处理备注">
                <ElInput :model-value="emptyText(formModel.data.handle_remark)" type="textarea" :rows="3" disabled />
              </ElFormItem>
            </ElCol>
          </ElRow>
        </ElForm>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="formModel.visible = false">{{ formModel.mode === "detail" ? "关闭" : "取消" }}</ElButton>
          <ElButton v-if="formModel.mode !== 'detail'" type="primary" :loading="formModel.saving" @click="onFormConfirm">
            确定
          </ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import { ElMessageBox } from "element-plus";
import { Message } from "@/global/const";
import {
  apiShelveDelete,
  apiShelveDetail,
  apiShelveMerge,
  apiShelvePage,
  apiShelveRefresh,
  apiShelveSubmit,
} from "@/api/warehouse";

type ShelveFormMode = "create" | "edit" | "detail";

const queryFormRef = ref();
const formRef = ref();

const measureTypeOptions = [
  { label: "计重", value: 1 },
  { label: "计件", value: 2 },
];
const statusOptions = [
  { label: "草稿", value: 1 },
  { label: "待处理", value: 2 },
  { label: "已上架", value: 3 },
  { label: "已拒绝", value: 4 },
];

const tableQueryInitial = () => ({
  page: 1,
  size: 20,
  pro_name: "",
  measure_type: "",
  status: "",
  sort: "desc",
});

const formInitial = () => ({
  id: "",
  pro_name: "",
  specification: "",
  unit: "",
  measure_type: "",
  weight: 500,
  primary_unit: "",
  secondary_unit: "",
  remark: "",
  apply_user_name: "",
  apply_time: "",
  handle_user_name: "",
  handle_time: "",
  handle_remark: "",
});

const tableModel = reactive({
  loading: false,
  query: tableQueryInitial(),
  total: 0,
  data: [] as Obj[],
});

const formModel = reactive({
  visible: false,
  loading: false,
  saving: false,
  mode: "create" as ShelveFormMode,
  title: "新增上架申请",
  data: formInitial(),
});

const formRules = {
  pro_name: [{ required: true, message: "请输入商品名称", trigger: ["blur", "change"] }],
  measure_type: [{ required: true, message: "请选择计量方式", trigger: ["blur", "change"] }],
};

const emptyText = (value: unknown) => {
  if (value === undefined || value === null || value === "") return "--";
  return String(value);
};

const getMeasureTypeText = (value: number | string) => {
  const item = measureTypeOptions.find(option => option.value === Number(value));
  return item?.label || "--";
};

const getStatusText = (value: number | string) => {
  const item = statusOptions.find(option => option.value === Number(value));
  return item?.label || "--";
};

const getStatusTagType = (value: number | string) => {
  const status = Number(value);
  if (status === 2) return "warning";
  if (status === 3) return "success";
  if (status === 4) return "danger";
  return "info";
};

const buildQuery = () => {
  const params: Obj = {
    page: tableModel.query.page,
    size: tableModel.query.size,
    sort: tableModel.query.sort,
  };
  if (tableModel.query.pro_name) params.pro_name = tableModel.query.pro_name;
  if (tableModel.query.measure_type) params.measure_type = Number(tableModel.query.measure_type);
  if (tableModel.query.status) params.status = Number(tableModel.query.status);
  return params;
};

const onTableRequest = async () => {
  tableModel.loading = true;
  const { success, data, message } = await apiShelvePage(buildQuery());
  if (success) {
    tableModel.data = Array.isArray(data?.list) ? data.list : [];
    tableModel.total = Number(data?.total || 0);
  } else {
    Message.warning(message || "获取上架申请失败");
  }
  tableModel.loading = false;
};

const onTablePage = (object: { page: number; size: number }) => {
  tableModel.query.page = object.page;
  tableModel.query.size = object.size;
  onTableRequest();
};

const onTableSearch = () => {
  tableModel.query.page = 1;
  onTableRequest();
};

const onTableReset = () => {
  tableModel.query = tableQueryInitial();
  queryFormRef.value?.resetFields();
  onTableSearch();
};

const openForm = async (mode: ShelveFormMode, row?: Obj) => {
  formModel.mode = mode;
  formModel.title = mode === "create" ? "新增上架申请" : mode === "edit" ? "编辑上架申请" : "上架申请详情";
  formModel.data = formInitial();
  formModel.visible = true;
  if (!row?.id || mode === "create") return;

  formModel.loading = true;
  const { success, data, message } = await apiShelveDetail({ id: row.id });
  if (success) {
    formModel.data = {
      ...formInitial(),
      ...data,
      measure_type: Number(data.measure_type || "") || "",
      weight: Number(data.weight || 0) || 500,
    };
  } else {
    Message.warning(message || "获取详情失败");
    formModel.visible = false;
  }
  formModel.loading = false;
};

const onOpenCreate = () => openForm("create");
const onOpenEdit = (row: Obj) => openForm("edit", row);
const onOpenDetail = (row: Obj) => openForm("detail", row);

const onFormConfirm = async () => {
  await formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    formModel.saving = true;
    const payload = {
      id: formModel.data.id,
      pro_name: formModel.data.pro_name,
      specification: "",
      unit: "",
      measure_type: Number(formModel.data.measure_type),
      weight: 500,
      primary_unit: "",
      secondary_unit: "",
      remark: formModel.data.remark,
    };
    const { success, message } = await apiShelveMerge(payload);
    if (success) {
      Message.success("保存成功");
      formModel.visible = false;
      onTableRequest();
    } else {
      Message.warning(message || "保存失败");
    }
    formModel.saving = false;
  });
};

const onFormClosed = () => {
  formModel.data = formInitial();
  formRef.value?.resetFields();
};

const onDelete = async (row: Obj) => {
  await ElMessageBox.confirm(`确认删除「${row.pro_name}」的上架申请吗？`, "删除申请", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  });
  const { success, message } = await apiShelveDelete({ id: row.id });
  if (success) {
    Message.success("删除成功");
    onTableRequest();
  } else {
    Message.warning(message || "删除失败");
  }
};

const onSubmit = async (row: Obj) => {
  await ElMessageBox.confirm(`确认提交「${row.pro_name}」的上架申请吗？`, "提交申请", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  });
  const { success, message } = await apiShelveSubmit({ id: row.id });
  if (success) {
    Message.success("提交成功");
    onTableRequest();
  } else {
    Message.warning(message || "提交失败");
  }
};

const onRefresh = async (row: Obj) => {
  const { success, message } = await apiShelveRefresh({ id: row.id });
  if (success) {
    Message.success("刷新成功");
    onTableRequest();
  } else {
    Message.warning(message || "刷新失败");
  }
};

onTableRequest();

</script>

<style lang="scss" scoped>
.shelve-page {
  .query-left {
    :deep(.el-input) {
      width: 264px;
    }

    :deep(.el-select) {
      width: 264px;
    }
  }

  :deep(.el-table__header th) {
    background-color: #eef4ff;
    color: #202733;
    font-weight: 600;
  }
}

:deep(.shelve-dialog) {
  .el-dialog__body {
    padding-top: 24px;
  }

  .el-select,
  .el-input-number {
    width: 100%;
  }

  .detail-row {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #eef0f4;
  }
}
</style>
