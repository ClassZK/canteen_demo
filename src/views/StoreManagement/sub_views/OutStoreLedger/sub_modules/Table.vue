<template>
  <div class="layout-table" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
    <div class="query-container">
      <div class="query-left">
        <ElForm ref="formRef" :model="tableModel.query">
          
          <IPlatformOrgFilter></IPlatformOrgFilter><ElFormItem label="入库批次号" prop="batch_no">
            <ElInput
              v-model.trim="tableModel.query.batch_no"
              maxlength="30"
              show-word-limit
              clearable
              placeholder="入库批次号"
            ></ElInput>
          </ElFormItem>
          <ElFormItem label="出库批次号" prop="out_batch_no">
            <ElInput
              v-model.trim="tableModel.query.out_batch_no"
              maxlength="30"
              show-word-limit
              clearable
              placeholder="出库批次号"
            ></ElInput>
          </ElFormItem>
          <ElFormItem label="食材编号" prop="pro_no">
            <ElInput
              v-model.trim="tableModel.query.pro_no"
              maxlength="30"
              show-word-limit
              clearable
              placeholder="食材编号"
            ></ElInput>
          </ElFormItem>
          <ElFormItem label="出库时间范围" prop="created_at">
            <ElDatePicker
              type="daterange"
              v-model="dateTimeModel.data"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
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
        <ElButton type="primary" :style="{ '--el-button-bg-color': '#FFF' }" @click="onTableExport" plain
          >导出</ElButton
        >
        <ElButton type="primary" @click="onTableSearch">查询</ElButton>
        <ElButton class="gray" @click="onTableReset">重置</ElButton>
      </div>
    </div>
    <div class="table-container">
      <ElTable height="100%" scrollbar-always-on :data="tableModel.data">
        
        <IPlatformOrgColumn></IPlatformOrgColumn><ElTableColumn label="批次号" prop="batch_no" min-width="240">
          <template #default="scope">
            <p class="out_batch_no">入库：{{ scope.row.batch_no }}</p>
            <p class="out_batch_no">出库：{{ scope.row.out_batch_no }}</p>
          </template>
        </ElTableColumn>
        <ElTableColumn label="食材名称" prop="pro_name" min-width="260" show-overflow-tooltip>
          <template #default="scope">
            <div class="preview-name">
              <ITablePreview :image="scope.row.pro_cover"></ITablePreview>
              <p class="name ellipsis">{{ scope.row.pro_name }}</p>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn
          label="食材编号"
          prop="pro_no"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn
          label="食材类型"
          prop="pro_type_name"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn
          label="规格"
          prop="specification"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn label="结算价" prop="guide_price" min-width="150" align="center" show-overflow-tooltip>
          <template #default="scope">
            <p class="price ellipsis">{{ _utils.FtoY(scope.row.guide_price) }}元</p>
          </template>
        </ElTableColumn>
        <ElTableColumn
          label="出库人"
          prop="user_name"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn
          label="出库人联系电话"
          prop="user_phone"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn label="出库类型" prop="_actionType" min-width="130" align="center" show-overflow-tooltip>
        </ElTableColumn>
        <ElTableColumn label="出库数量" prop="count" min-width="130" align="center" show-overflow-tooltip>
          <template #default="scope">
            {{ _utils.KtoJ(scope.row.count, scope.row?.measure_type) }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          label="出库时间"
          prop="created_at"
          min-width="160"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
      </ElTable>
    </div>
    <IPage
      :total="tableModel.total"
      :page="tableModel.query.page"
      :size="tableModel.query.size"
      @change="onTablePage"
    ></IPage>
    <IProgress
      v-if="progressData.DialogVisible"
      :id="progressData.id"
      :fileName="'出库记录数据'"
      @close="progressData.DialogVisible = false"
    ></IProgress>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import { OutTypeObject } from "@/views/StoreManagement/aux_modules/const";
import { Message } from "@/global/const";
import _utils from "@/utils/index";
import { apiInventoryInOutList, apiInventoryLedgerExport } from "@/api/warehouse";

const formRef = ref();
const OutStoreType = 2; // 出库

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
    pro_no: "",
    batch_no: "",
    out_batch_no: "",
    action_type: OutStoreType,
    start_time: "",
    end_time: "",
  },
  total: 0,
  data: [],
});

/** 时间范围 */
const dateTimeModel = reactive<{
  data: string[];
  valueFormat: string;
}>({
  data: [],
  valueFormat: "YYYY-MM-DD",
});

/** 时间范围改变 */
const dateTimeModelChange = (array: string[] | null) => {
  let startTime = "",
    endTime = "";
  if (Array.isArray(array)) {
    startTime = array[0];
    endTime = array[1];
  }
  tableModel.query.start_time = startTime;
  tableModel.query.end_time = endTime;
};

/** 请求 */
const onTableRequest = async () => {
  tableModel.vLoading = true;
  const params = {
    ...tableModel.query,
    start_time: tableModel.query.start_time ? tableModel.query.start_time + " 00:00:00" : "",
    end_time: tableModel.query.end_time ? tableModel.query.end_time + " 23:59:59" : "",
  };
  const { success, data, message } = await apiInventoryInOutList(params);
  if (success) {
    const list = _utils.getDefaultArray(data.list);
    tableModel.data = list.map((item: Obj) => {
      item.pro_no = item.pro_no === "-1" ? "线下购买" : item.pro_no;
      if (item.action_id) {
        const actionType = item.action_id.toString();
        const actionTypeData = OutTypeObject[actionType];
        item._actionType = actionTypeData.name;
      }
      return item;
    });
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
  formRef.value?.resetFields();
  // 重置日期选择器
  dateTimeModel.data = [];
  delete tableModel.query.start_time;
  delete tableModel.query.end_time;
  onTableSearch();
};
/** 查询任务状态 */
const progressData = reactive<Obj>({
  DialogVisible: false,
  id: "",
});
/** 导出 */
const onTableExport = async () => {
  const params = {
    batch_no: tableModel.query.batch_no,
    out_batch_no: tableModel.query.out_batch_no,
    pro_no: tableModel.query.pro_no,
    action_type: OutStoreType,
    start_time: tableModel.query.start_time ? tableModel.query.start_time + " 00:00:00" : "",
    end_time: tableModel.query.end_time ? tableModel.query.end_time + " 23:59:59" : "",
  };
  const { success, data, message } = await apiInventoryLedgerExport(params);
  if (success) {
    progressData.DialogVisible = true;
    progressData.id = data.task_id;
  } else {
    Message.warning(message);
  }
};

</script>

<style lang="scss" scoped>
.out_batch_no {
  margin-top: var(--gap-sm);
  font-size: var(--font-size-xs);
}
</style>
