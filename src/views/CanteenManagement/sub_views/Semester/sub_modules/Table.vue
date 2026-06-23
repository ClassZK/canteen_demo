<template>
  <div class="layout-table" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
    <div class="query-container">
      <div class="query-left">
        <ElForm ref="formRef" :model="tableModel.query">
          
          <IPlatformOrgFilter></IPlatformOrgFilter><ElFormItem label="开始时间范围">
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
          <ElFormItem label="结束时间范围">
            <ElDatePicker
              type="daterange"
              v-model="dateTimeModel.endData"
              :value-format="dateTimeModel.valueFormat"
              :default-time="dateTimeModel.defaultTime"
              unlink-panels
              range-separator="-"
              @change="EnddateTimeModelChange"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
            >
            </ElDatePicker>
          </ElFormItem>
        </ElForm>
      </div>
      <div class="query-right">
        <ElButton type="primary" @click="onTableAdd">新增</ElButton>
        <ElButton type="primary" @click="onTableSearch">查询</ElButton>
        <ElButton class="gray" @click="onTableReset">重置</ElButton>
      </div>
    </div>
    <div class="table-container">
      <ElTable height="100%" scrollbar-always-on :data="tableModel.data">
        
        <IPlatformOrgColumn></IPlatformOrgColumn><ElTableColumn
          label="学期名称"
          prop="name"
          min-width="100"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn
          label="学期开始时间"
          prop="start_time"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn
          label="学期结束时间"
          prop="end_time"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>

        <ElTableColumn fixed="right" label="操作" width="150" align="center">
          <template #default="scope">
            <div class="handle">
              <ElButton type="primary" link @click="onTableUpdate(scope.row)">编辑</ElButton>

              <ElButton type="primary" link @click="onTableDetail(scope.row)">详情</ElButton>
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
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from "vue";
import { useSemesterAuxStore } from "../aux_modules/store";
import { OperationTypeEnum, Message, SexList } from "@/global/const";
import _utils from "@/utils/index";
import { apiCanteenSemesterList, apiCanteenSemesterDelete } from "@/api/recipe";
import type { ElButton } from "element-plus";
import { ElMessageBox } from "element-plus";

const SemesterAuxStore = useSemesterAuxStore();
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
    s_start_time: "",
    s_end_time: "",
    e_start_time: "",
    e_end_time: "",
  },
  total: 0,
  data: [],
});
/** 时间范围 */
const dateTimeModel = reactive<{
  data: string[];
  endData: string[];
  valueFormat: string;
  defaultTime: Date[];
}>({
  data: [],
  endData: [],
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
  tableModel.query.s_start_time = startTime;
  tableModel.query.s_end_time = endTime;
};
/** 结束时间范围 */
const EnddateTimeModelChange = (array: string[]) => {
  let startTime = "",
    endTime = "";
  if (Array.isArray(array)) {
    startTime = array[0];
    endTime = array[1];
  }
  tableModel.query.e_start_time = startTime;
  tableModel.query.e_end_time = endTime;
};
/** 请求 */
const onTableRequest = async () => {
  tableModel.vLoading = true;
  const { success, data, message } = await apiCanteenSemesterList(tableModel.query);
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
  tableModel.query.s_start_time = "";
  tableModel.query.s_end_time = "";
  tableModel.query.e_start_time = "";
  tableModel.query.e_end_time = "";
  dateTimeModel.data = [];
  dateTimeModel.endData = [];
  onTableSearch();
};
/** 新增 */
const onTableAdd = () => {
  SemesterAuxStore.$patch(state => {
    state.OperationType = OperationTypeEnum.add;
  });
};
/** 编辑 */
const onTableUpdate = (data: Obj) => {
  SemesterAuxStore.$patch(state => {
    data.isHealth = false;
    state.data = data;
    state.OperationType = OperationTypeEnum.update;
  });
};
/** 编辑 */
const onTableDetail = (data: Obj) => {
  SemesterAuxStore.$patch(state => {
    state.data = data;
    state.OperationType = OperationTypeEnum.detail;
  });
};

/** 删除 */
const onTableDelete = (data: Obj) => {
  ElMessageBox.alert(`确定删除 ${data.name} 吗？`, "温馨提示", {
    confirmButtonText: "确定",
    showCancelButton: true,
    cancelButtonText: "取消",
    draggable: true,
    type: "warning",
    customClass: "message-box-custom",
    beforeClose: async (action, instance, done) => {
      if (action === "confirm") {
        instance.confirmButtonLoading = true;
        const { success, message } = await apiCanteenSemesterDelete({
          id: data.id,
        });
        if (success) {
          done();
          onTableRequest();
          Message.success(` ${data.name} 删除成功`);
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
  () => SemesterAuxStore.refresh,
  () => {
    onTableRequest();
  },
);

</script>

<style lang="scss" scoped></style>
