<template>
  <div class="layout-table" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
    <div class="query-container">
      <div class="query-left">
        <ElForm ref="formRef" :model="tableModel.query">
          <IPlatformOrgFilter></IPlatformOrgFilter>
          <ElFormItem label="时间范围">
            <ElDatePicker
              type="daterange"
              v-model="dateTimeModel.data"
              :value-format="dateTimeModel.valueFormat"
              :default-time="dateTimeModel.defaultTime"
              unlink-panels
              range-separator="-"
              @change="dateTimeModelChange"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
            ></ElDatePicker>
          </ElFormItem>
        </ElForm>
      </div>
      <div class="query-right">
        <ElButton type="primary" @click="onTableSearch">查询</ElButton>
        <ElButton class="gray" @click="onTableReset">重置</ElButton>
        <ElButton type="primary" @click="onTableAdd">新增</ElButton>
      </div>
    </div>
    <div class="table-container">
      <ElTable height="100%" scrollbar-always-on :data="tableModel.data">
        <IPlatformOrgColumn></IPlatformOrgColumn>
        <ElTableColumn label="处理时间" prop="disposal_time" min-width="160" align="center" show-overflow-tooltip></ElTableColumn>
        <ElTableColumn label="废弃物量(斤)" prop="waste_volume" min-width="150" align="center" show-overflow-tooltip></ElTableColumn>
        <ElTableColumn label="废弃物种类" prop="waste_type" min-width="150" align="center" show-overflow-tooltip>
          <template #default="scope">{{ onTableWasteTypeFilter(scope.row.waste_type) }}</template>
        </ElTableColumn>
        <ElTableColumn label="收运公司" prop="recipient" min-width="150" align="center" show-overflow-tooltip></ElTableColumn>
        <ElTableColumn label="收运商资质是否合格" prop="recipient_qualifications" min-width="170" align="center" show-overflow-tooltip>
          <template #default="scope">{{ onTableWhetherFilter(scope.row.recipient_qualifications) }}</template>
        </ElTableColumn>
        <ElTableColumn label="图片" prop="image" width="100" align="center" show-overflow-tooltip>
          <template #default="scope">
            <ITablePreview :image="scope.row.image"></ITablePreview>
          </template>
        </ElTableColumn>
        <ElTableColumn fixed="right" label="操作" width="180" align="center">
          <template #default="scope">
            <div class="handle">
              <ElButton type="danger" link @click="onTableDelete(scope.row)">删除</ElButton>
              <ElButton type="primary" link @click="onTableUpdate(scope.row)">编辑</ElButton>
              <ElButton type="primary" link @click="onTableDetail(scope.row)">详情</ElButton>
            </div>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
    <IPage :total="tableModel.total" :page="tableModel.query.page" :size="tableModel.query.size" @change="onTablePage"></IPage>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from "vue";
import { useWasteDisposalAuxStore } from "../aux_modules/store";
import { OperationTypeEnum, Message, WhetherList, GarbageTypeList } from "@/global/const";
import _utils from "@/utils/index";
import { apiWasteDisposalList, apiWasteDisposalDelete } from "@/api/inspection";

const WasteDisposalAuxStore = useWasteDisposalAuxStore();
const formRef = ref();

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
    startTime: "",
    endTime: "",
  },
  total: 0,
  data: [],
});

const dateTimeModel = reactive({
  data: [] as string[],
  valueFormat: "YYYY-MM-DD HH:mm:ss",
  defaultTime: [new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)],
});
const dateTimeModelChange = (array: string[]) => {
  tableModel.query.startTime = Array.isArray(array) ? array[0] : "";
  tableModel.query.endTime = Array.isArray(array) ? array[1] : "";
};

const onTableRequest = async () => {
  tableModel.vLoading = true;
  const { success, data, message } = await apiWasteDisposalList(tableModel.query);
  if (success) {
    tableModel.data = _utils.getDefaultArray(data.list);
    tableModel.total = data.total;
  } else {
    Message.warning(message);
  }
  tableModel.vLoading = false;
};
onTableRequest();

const onTableWhetherFilter = (value: string | undefined) => {
  return WhetherList.find((item: Obj) => item.value === value)?.name || "";
};
const onTableWasteTypeFilter = (value: string) => {
  return GarbageTypeList.find((item: Obj) => item.value === value)?.name || value || "";
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
  dateTimeModel.data = [];
  formRef.value?.resetFields();
  tableModel.query.startTime = "";
  tableModel.query.endTime = "";
  onTableRequest();
};

const openForm = (type: OperationTypeEnum, data: Obj = {}) => {
  WasteDisposalAuxStore.$patch(state => {
    state.data = data;
    state.OperationType = type;
  });
};
const onTableAdd = () => openForm(OperationTypeEnum.add);
const onTableUpdate = (data: Obj) => openForm(OperationTypeEnum.update, data);
const onTableDetail = (data: Obj) => openForm(OperationTypeEnum.detail, data);
const onTableDelete = (data: Obj) => {
  ElMessageBox.alert("确定删除该条废弃物处置记录吗？", "温馨提示", {
    confirmButtonText: "确定",
    showCancelButton: true,
    cancelButtonText: "取消",
    draggable: true,
    type: "warning",
    customClass: "message-box-custom",
    beforeClose: async (action, instance, done) => {
      if (action === "confirm") {
        instance.confirmButtonLoading = true;
        const { success, message } = await apiWasteDisposalDelete({ id: data.id });
        if (success) {
          done();
          onTableRequest();
          Message.success("删除成功");
        } else {
          Message.warning(message);
        }
      } else {
        done();
      }
    },
  })
    .then(() => {})
    .catch(() => {});
};

watch(
  () => WasteDisposalAuxStore.refresh,
  () => {
    onTableRequest();
  },
);
</script>

<style lang="scss" scoped></style>
