<template>
  <div class="layout-table" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
    <div class="query-container">
      <div class="query-left">
        <ElForm ref="formRef" :model="tableModel.query">
          <IPlatformOrgFilter></IPlatformOrgFilter>
          <ElFormItem label="人员姓名" prop="keyword">
            <ElInput v-model="tableModel.query.keyword" maxlength="30" show-word-limit clearable placeholder="人员姓名"></ElInput>
          </ElFormItem>
          <ElFormItem label="状态" prop="status">
            <ElSelect v-model="tableModel.query.status" filterable clearable placeholder="状态">
              <ElOption v-for="item of HandleStatusList" :key="item.value" :label="item.name" :value="item.value"></ElOption>
            </ElSelect>
          </ElFormItem>
        </ElForm>
      </div>
      <div class="query-right">
        <ElButton type="primary" @click="onTableSearch">查询</ElButton>
        <ElButton class="gray" @click="onTableReset">重置</ElButton>
      </div>
    </div>
    <div class="table-container">
      <ElTable height="100%" scrollbar-always-on :data="tableModel.data">
        <IPlatformOrgColumn></IPlatformOrgColumn>
        <ElTableColumn label="预警主题" prop="subject" min-width="150" align="center" show-overflow-tooltip></ElTableColumn>
        <ElTableColumn label="人员姓名" prop="staff_name" min-width="130" align="center" show-overflow-tooltip></ElTableColumn>
        <ElTableColumn label="证件名称" prop="certificate_name" min-width="130" align="center" show-overflow-tooltip></ElTableColumn>
        <ElTableColumn label="到期时间" prop="certificate_expire_date" min-width="140" align="center" show-overflow-tooltip></ElTableColumn>
        <ElTableColumn label="预警内容" prop="alarm_desc" min-width="280" align="center" show-overflow-tooltip></ElTableColumn>
        <ElTableColumn label="预警时间" prop="supervise_time" min-width="160" align="center" show-overflow-tooltip></ElTableColumn>
        <ElTableColumn label="状态" prop="status" width="120" align="center">
          <template #default="scope">{{ statusText(scope.row.status) }}</template>
        </ElTableColumn>
        <ElTableColumn fixed="right" label="操作" width="120" align="center">
          <template #default="scope">
            <ElButton v-if="scope.row.status === HandleStatusEnum.Pending" type="success" link @click="onOpen(scope.row, 'handle')">处理</ElButton>
            <ElButton type="primary" link @click="onOpen(scope.row, 'detail')">详情</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
    <IPage :total="tableModel.total" :page="tableModel.query.page" :size="tableModel.query.size" @change="onTablePage"></IPage>
  </div>
  <ElDialog v-model="dialog.visible" width="760px" :title="dialog.mode === 'handle' ? '证件过期预警处理' : '证件过期预警详情'" append-to-body draggable>
    <ElForm label-position="top">
      <ElRow :gutter="20">
        <ElCol :span="12"><ElFormItem label="人员姓名"><ElInput v-model="dialog.data.staff_name" disabled /></ElFormItem></ElCol>
        <ElCol :span="12"><ElFormItem label="证件名称"><ElInput v-model="dialog.data.certificate_name" disabled /></ElFormItem></ElCol>
        <ElCol :span="12"><ElFormItem label="到期时间"><ElInput v-model="dialog.data.certificate_expire_date" disabled /></ElFormItem></ElCol>
        <ElCol :span="12"><ElFormItem label="预警时间"><ElInput v-model="dialog.data.supervise_time" disabled /></ElFormItem></ElCol>
        <ElCol><ElFormItem label="预警内容"><ElInput v-model="dialog.data.alarm_desc" type="textarea" :rows="4" disabled /></ElFormItem></ElCol>
        <ElCol v-if="dialog.mode === 'handle'"><ElFormItem label="处理说明"><ElInput v-model="dialog.process_desc" type="textarea" :rows="4" maxlength="200" show-word-limit /></ElFormItem></ElCol>
        <ElCol v-else-if="dialog.data.process_desc"><ElFormItem label="处理说明"><ElInput v-model="dialog.data.process_desc" type="textarea" :rows="4" disabled /></ElFormItem></ElCol>
      </ElRow>
    </ElForm>
    <template #footer>
      <ElButton @click="dialog.visible = false">取消</ElButton>
      <ElButton v-if="dialog.mode === 'handle'" type="primary" @click="onConfirmHandle">确定</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { HandleStatusEnum, HandleStatusList, Message } from "@/global/const";
import _utils from "@/utils/index";
import { apiForewarningMonthPriceSupervisionHandle, apiForewarningMonthPriceSupervisionList } from "@/api/warehouse";

const formRef = ref();
const tableModel = reactive({
  vLoading: false,
  query: { page: 1, size: 20, keyword: "", status: "", warn_category: "certificate" },
  total: 0,
  data: [] as Obj[],
});
const dialog = reactive({ visible: false, mode: "detail", data: {} as Obj, process_desc: "" });

const loadData = async () => {
  tableModel.vLoading = true;
  const { success, data, message } = await apiForewarningMonthPriceSupervisionList(tableModel.query);
  if (success) {
    tableModel.data = _utils.getDefaultArray(data.list).filter((item: Obj) => item.warn_category === "certificate");
    tableModel.total = tableModel.data.length;
  } else {
    Message.warning(message);
  }
  tableModel.vLoading = false;
};
loadData();

const onTablePage = (object: { page: number; size: number }) => {
  tableModel.query.page = object.page;
  tableModel.query.size = object.size;
  loadData();
};
const onTableSearch = () => {
  tableModel.query.page = 1;
  loadData();
};
const onTableReset = () => {
  formRef.value?.resetFields();
  onTableSearch();
};
const statusText = (status: string) => HandleStatusList.find((item: Obj) => item.value === status)?.name || status || "-";
const onOpen = (row: Obj, mode: string) => {
  dialog.data = { ...row };
  dialog.mode = mode;
  dialog.process_desc = "";
  dialog.visible = true;
};
const onConfirmHandle = async () => {
  if (!dialog.process_desc) {
    Message.warning("请输入处理说明");
    return;
  }
  const { success, message } = await apiForewarningMonthPriceSupervisionHandle({ id: dialog.data.id, process_desc: dialog.process_desc });
  if (success) {
    Message.success("处理成功");
    dialog.visible = false;
    loadData();
  } else {
    Message.warning(message);
  }
};
</script>
