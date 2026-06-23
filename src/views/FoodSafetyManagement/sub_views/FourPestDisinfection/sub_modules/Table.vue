<template>
  <div class="layout-table" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
    <div class="query-container">
      <div class="query-left">
        <ElForm ref="formRef" :model="tableModel.query">
          
          <IPlatformOrgFilter></IPlatformOrgFilter><ElFormItem label="时间范围">
            <ElDatePicker
              type="daterange"
              v-model="dateTimeModel.data"
              :value-format="dateTimeModel.valueFormat"
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
        
        <IPlatformOrgColumn></IPlatformOrgColumn><ElTableColumn label="消杀日期" prop="disinfection_date" min-width="130" align="center" show-overflow-tooltip />
        <ElTableColumn label="消杀公司" prop="disinfection_company" min-width="180" align="center" show-overflow-tooltip />
        <ElTableColumn label="操作人员" prop="operator" min-width="120" align="center" show-overflow-tooltip />
        <ElTableColumn label="消杀内容" prop="disinfection_content" min-width="180" align="center" show-overflow-tooltip>
          <template #default="scope">
            {{ optionText(scope.row.disinfection_content, FourPestContentList) }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作是否规范" prop="operation_standard" min-width="130" align="center" show-overflow-tooltip>
          <template #default="scope">
            {{ optionText(scope.row.operation_standard, CheckResultList) }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="施工照片" prop="construction_image" width="110" align="center">
          <template #default="scope">
            <ITablePreview :image="scope.row.construction_image"></ITablePreview>
          </template>
        </ElTableColumn>
        <ElTableColumn label="报告照片" prop="report_image" width="110" align="center">
          <template #default="scope">
            <ITablePreview :image="scope.row.report_image"></ITablePreview>
          </template>
        </ElTableColumn>
        <ElTableColumn fixed="right" label="操作" width="170" align="center">
          <template #default="scope">
            <div class="handle">
              <ElButton type="primary" link @click="onTableDetail(scope.row)">查看</ElButton>
              <ElButton type="primary" link @click="onTableUpdate(scope.row)">编辑</ElButton>
              <ElButton type="danger" link @click="onTableDelete(scope.row)">删除</ElButton>
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
import { useFourPestDisinfectionAuxStore } from "../aux_modules/store";
import { OperationTypeEnum, Message, FourPestContentList, CheckResultList } from "@/global/const";
import _utils from "@/utils/index";
import { apiFourPestDisinfectionList, apiFourPestDisinfectionDelete } from "@/api/inspection";
import { ElMessageBox } from "element-plus";

const FourPestDisinfectionAuxStore = useFourPestDisinfectionAuxStore();
const formRef = ref();

const tableModel = reactive({
  vLoading: false,
  query: {
    page: 1,
    size: 20,
    startTime: "",
    endTime: "",
  },
  total: 0,
  data: [] as Obj[],
});

const dateTimeModel = reactive({
  data: [] as string[],
  valueFormat: "YYYY-MM-DD",
});

const dateTimeModelChange = (array: string[]) => {
  tableModel.query.startTime = Array.isArray(array) ? array[0] : "";
  tableModel.query.endTime = Array.isArray(array) ? array[1] : "";
};

const onTableRequest = async () => {
  tableModel.vLoading = true;
  const { success, data, message } = await apiFourPestDisinfectionList(tableModel.query);
  if (success) {
    tableModel.data = _utils.getDefaultArray(data.list);
    tableModel.total = data.total;
  } else {
    Message.warning(message);
  }
  tableModel.vLoading = false;
};
onTableRequest();

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
const optionText = (value: string, list: Obj[]) => {
  if (!value) {
    return "";
  }
  return String(value)
    .split(",")
    .filter(Boolean)
    .map(item => list.find((option: Obj) => option.value === item)?.name || item)
    .join("、");
};
const openForm = (type: OperationTypeEnum, data: Obj = {}) => {
  FourPestDisinfectionAuxStore.$patch(state => {
    state.data = data;
    state.OperationType = type;
  });
};
const onTableAdd = () => openForm(OperationTypeEnum.add);
const onTableDetail = (data: Obj) => openForm(OperationTypeEnum.detail, data);
const onTableUpdate = (data: Obj) => openForm(OperationTypeEnum.update, data);
const onTableDelete = (data: Obj) => {
  ElMessageBox.alert("确定删除该条四害消杀记录吗？", "温馨提示", {
    confirmButtonText: "确定",
    showCancelButton: true,
    cancelButtonText: "取消",
    draggable: true,
    type: "warning",
    customClass: "message-box-custom",
    beforeClose: async (action, instance, done) => {
      if (action === "confirm") {
        instance.confirmButtonLoading = true;
        const { success, message } = await apiFourPestDisinfectionDelete({ id: data.id });
        if (success) {
          done();
          onTableRequest();
          Message.success("四害消杀记录删除成功");
        } else {
          Message.warning(message);
        }
      } else {
        done();
      }
    },
  }).catch(() => {});
};

watch(
  () => FourPestDisinfectionAuxStore.refresh,
  () => {
    onTableRequest();
  }
);

</script>
