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
          <ElFormItem label="采购时间范围">
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
          min-width="200"
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
        <ElTableColumn
          label="食堂采购均价(元/斤)"
          prop="_canteen_price"
          min-width="150"
          align="center"
          show-overflow-tooltip
        >
        </ElTableColumn>
        <ElTableColumn
          label="食堂采购结算均价(元/斤)"
          prop="canteen_guide_price"
          min-width="150"
          align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            {{ _utils.FtoY(row.canteen_guide_price) / 2 }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          label="区县采购均价(元/斤)"
          prop="_area_price"
          min-width="150"
          align="center"
          show-overflow-tooltip
        >
        </ElTableColumn>
        <ElTableColumn
          label="区县采购结算均价(元/斤)"
          prop="area_guide_price"
          min-width="150"
          align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            {{ _utils.FtoY(row.area_guide_price) / 2 }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          label="区县采购均价偏离(%)"
          prop="deviation"
          min-width="150"
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
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import { Message } from "@/global/const";
import _utils from "@/utils";
import { apiDeviationPriceStatisticsList } from "@/api/warehouse";

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
  const { success, data, message } = await apiDeviationPriceStatisticsList(tableModel.query);
  if (success) {
    const list = _utils.getDefaultArray(data.list);
    tableModel.data = list.map((item: Obj) => {
      item._canteen_price = _utils.FtoY(item.canteen_price) / 2;
      item._area_price = _utils.FtoY(item.area_price) / 2;
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
