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
              :default-time="dateTimeModel.defaultTime"
              unlink-panels
              range-separator="-"
              @change="dateTimeModelChange"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
            >
            </ElDatePicker>
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
        
        <IPlatformOrgColumn></IPlatformOrgColumn><ElTableColumn
          label="操作人"
          prop="operator"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn label="班次类型" prop="shift_type" min-width="150" align="center" show-overflow-tooltip>
          <template #default="scope">
            {{ onTableWorkShiftFilter(scope.row.shift_type) }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          label="消毒时间"
          prop="disinfect_time"
          min-width="160"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn
          label="餐具类型"
          prop="disinfect_items"
          min-width="150"
          align="center"
          show-overflow-tooltip
        >
          <template #default="scope">
            {{ onTableOptionsFilter(scope.row.disinfect_items, TablewareTypeList) }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          label="餐具数量"
          prop="tableware_quantity"
          min-width="120"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn
          label="消毒温度(℃)"
          prop="disinfect_temperature"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn
          label="消毒时长(分钟)"
          prop="disinfect_duration"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn
          label="消毒方式"
          prop="disinfect_methods"
          min-width="180"
          align="center"
          show-overflow-tooltip
        >
          <template #default="scope">
            {{ onTableOptionsFilter(scope.row.disinfect_methods, DisinfectMethodList) }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="图片" prop="image" width="100" align="center" show-overflow-tooltip>
          <template #default="scope">
            <ITablePreview :image="scope.row.image"></ITablePreview>
          </template>
        </ElTableColumn>
        <ElTableColumn fixed="right" label="操作" width="120" align="center">
          <template #default="scope">
            <div class="handle">
              <ElButton type="danger" link @click="onTableDelete(scope.row)">删除</ElButton>
              <ElButton type="primary" link @click="onTableUpdate(scope.row)">编辑</ElButton>
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
import { useTablewareDisinfectionAuxStore } from "../aux_modules/store";
import { OperationTypeEnum, Message, WorkShiftList, TablewareTypeList, DisinfectMethodList } from "@/global/const";

import _utils from "@/utils/index";
import { apiTablewareDisinfectionList, apiTablewareDisinfectionDelete } from "@/api/inspection";
import { ElMessageBox } from "element-plus";
const TablewareDisinfectionAuxStore = useTablewareDisinfectionAuxStore();
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
    startTime: "",
    endTime: "",
  },
  total: 0,
  data: [],
});

/** 时间范围 */
const dateTimeModel = reactive({
  data: [] as string[],
  valueFormat: "YYYY-MM-DD HH:mm:ss",
  defaultTime: [new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)],
});
const dateTimeModelChange = (array: string[]) => {
  let startTime = "",
    endTime = "";
  if (Array.isArray(array)) {
    startTime = array[0];
    endTime = array[1];
  }
  tableModel.query.startTime = startTime;
  tableModel.query.endTime = endTime;
};

/** 请求 */
const onTableRequest = async () => {
  tableModel.vLoading = true;
  const { success, data, message } = await apiTablewareDisinfectionList(tableModel.query);
  if (success) {
    tableModel.data = _utils.getDefaultArray(data.list);
    tableModel.total = data.total;
  } else {
    Message.warning(message);
  }
  tableModel.vLoading = false;
};
onTableRequest();

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
  dateTimeModel.data = [];
  formRef.value?.resetFields();
  tableModel.query.startTime = "";
  tableModel.query.endTime = "";
  onTableRequest();
};
const onTableWorkShiftFilter = (value: string) => {
  let text = "";
  const object = WorkShiftList.find((item: Obj) => item.value === value);
  if (object) {
    return object.name;
  }
  return text;
};
const onTableOptionsFilter = (value: string, list: Obj[]) => {
  if (!value) {
    return "";
  }
  return String(value)
    .split(",")
    .filter(Boolean)
    .map(item => {
      const object = list.find((option: Obj) => option.value === item);
      return object?.name || item;
    })
    .join(",");
};
/** 新增 */
const onTableAdd = () => {
  TablewareDisinfectionAuxStore.$patch(state => {
    state.data = {};
    state.OperationType = OperationTypeEnum.add;
  });
};

/** 编辑 */
const onTableUpdate = (data: Obj) => {
  TablewareDisinfectionAuxStore.$patch(state => {
    state.data = data;
    state.OperationType = OperationTypeEnum.update;
  });
};
/** 删除 */
const onTableDelete = (data: Obj) => {
  ElMessageBox.alert(`确定删除该条餐具消毒记录吗？`, "温馨提示", {
    confirmButtonText: "确定",
    showCancelButton: true,
    cancelButtonText: "取消",
    draggable: true,
    type: "warning",
    customClass: "message-box-custom",
    beforeClose: async (action, instance, done) => {
      if (action === "confirm") {
        instance.confirmButtonLoading = true;
        const { success, message } = await apiTablewareDisinfectionDelete({
          id: data.id,
        });
        if (success) {
          done();
          onTableRequest();
          Message.success(`餐具消毒记录删除成功`);
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
watch(
  () => TablewareDisinfectionAuxStore.refresh,
  () => {
    onTableRequest();
  }
);

</script>

<style lang="scss" scoped></style>
