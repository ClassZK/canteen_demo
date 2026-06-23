<template>
  <div class="layout-table" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
    <div class="query-container">
      <div class="query-left">
        <ElForm ref="formRef" :model="tableModel.query">
          
          <IPlatformOrgFilter></IPlatformOrgFilter><ElFormItem label="食材名称" prop="pro_name">
            <ISelectInventory
              v-model="tableModel.query.pro_name"
              clearable
              @change="onIngredientChange"
            ></ISelectInventory>
          </ElFormItem>
          <ElFormItem label="供应商名称" prop="supplier_name">
            <ElInput
              v-model="tableModel.query.supplier_name"
              maxlength="30"
              show-word-limit
              clearable
              placeholder="供应商名称"
            ></ElInput>
          </ElFormItem>
          <ElFormItem label="出库时间范围">
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
      </div>
    </div>
    <div class="table-container">
      <ElTable height="100%" scrollbar-always-on :data="tableModel.data">
        
        <IPlatformOrgColumn></IPlatformOrgColumn><ElTableColumn
          label="食材名称"
          prop="pro_name"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn label="食材编号" prop="pro_no" min-width="150" align="center" show-overflow-tooltip>
        </ElTableColumn>
        <ElTableColumn
          label="规格"
          prop="specification"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn
          label="供应商"
          prop="supplier_name"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn label="出库数量" prop="_count" min-width="150" align="center" show-overflow-tooltip>
        </ElTableColumn>
        <ElTableColumn label="出库参考价总金额(元)" prop="money" min-width="150" align="center" show-overflow-tooltip>
        </ElTableColumn>
        <ElTableColumn label="出库结算价总金额(元)" prop="guide_price" min-width="150" align="center" show-overflow-tooltip>
          <template #default="scope">
            {{ _utils.FtoY(scope.row.guide_price) }}
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
import { ref, reactive } from "vue";
import { Message } from "@/global/const";
import _utils from "@/utils";
import { apiInventoryOutFoodStatisticsList } from "@/api/warehouse";

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
    pro_name: "",
    supplier_name: "",
    start_time: "",
    end_time: "",
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
  tableModel.query.start_time = startTime;
  tableModel.query.end_time = endTime;
};
/** 请求 */
const onTableRequest = async () => {
  tableModel.vLoading = true;
  const { success, data, message } = await apiInventoryOutFoodStatisticsList(tableModel.query);
  if (success) {
    const list = _utils.getDefaultArray(data.list);
    tableModel.data = list.map((item: Obj) => {
      item.pro_no = item.pro_no === "-1" ? "线下购买" : item.pro_no;
      item._count = item.count > 0 ? _utils.KtoJ(item.count, item?.measure_type) + item.unit : "-";
      item.money = _utils.FtoY(item.money);
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
  dateTimeModel.data = [];
  tableModel.query.start_time = "";
  tableModel.query.end_time = "";
  formRef.value?.resetFields();
  onTableSearch();
};
const onIngredientChange = (value: string) => {
  tableModel.query.pro_name = value;
};

</script>

<style lang="scss" scoped></style>
