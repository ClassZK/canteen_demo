<template>
  <div class="layout-table" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
    <div class="query-container">
      <div class="query-left">
        <ElForm ref="formRef" :model="tableModel.query">
          
          <IPlatformOrgFilter></IPlatformOrgFilter><ElFormItem label="时间" prop="month">
            <ElDatePicker
              type="month"
              v-model="tableModel.query.month"
              :value-format="dateTimeModel.valueFormat"
              :default-time="dateTimeModel.defaultTime"
              :disabled-date="onDateTimeDisabled"
              placeholder="时间"
            >
            </ElDatePicker>
          </ElFormItem>
          <ElFormItem class="tips">
            <p>注：数量为负数的表示盘点数据异常，可能存在多出的食材。</p>
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
        <ElTableColumn
          label="供应商"
          prop="supplier_name"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn label="期初库存" prop="期初库存" align="center">
          <ElTableColumn label="数量" prop="_old_count" min-width="150" align="center" show-overflow-tooltip>
          </ElTableColumn>
          <ElTableColumn label="金额(元)" prop="_old_money" min-width="150" align="center" show-overflow-tooltip>
          </ElTableColumn>
          <ElTableColumn label="结算价格(元)" prop="guide_price" min-width="150" align="center" show-overflow-tooltip>
            <template #default="scope"> {{ _utils.FtoY(scope.row.guide_price) }} </template>
          </ElTableColumn>
        </ElTableColumn>
        <ElTableColumn label="本期入库" prop="本期入库" align="center">
          <ElTableColumn label="数量" prop="_in_count" min-width="150" align="center" show-overflow-tooltip>
          </ElTableColumn>
          <ElTableColumn label="金额(元)" prop="_in_money" min-width="150" align="center" show-overflow-tooltip>
          </ElTableColumn>
          <ElTableColumn label="结算价格(元)" prop="guide_price" min-width="150" align="center" show-overflow-tooltip>
            <template #default="scope"> {{ _utils.FtoY(scope.row.in_guide_price) }} </template>
          </ElTableColumn>
        </ElTableColumn>
        <ElTableColumn label="本期出库" prop="本期出库" align="center">
          <ElTableColumn label="数量" prop="_out_count" min-width="150" align="center" show-overflow-tooltip>
          </ElTableColumn>
          <ElTableColumn label="金额(元)" prop="_out_money" min-width="150" align="center" show-overflow-tooltip>
          </ElTableColumn>
          <ElTableColumn label="结算价格(元)" prop="guide_price" min-width="150" align="center" show-overflow-tooltip>
            <template #default="scope"> {{ _utils.FtoY(scope.row.out_guide_price) }} </template>
          </ElTableColumn>
        </ElTableColumn>
        <ElTableColumn label="期末库存" prop="期末库存" align="center">
          <ElTableColumn label="数量" prop="_count" min-width="150" align="center" show-overflow-tooltip>
          </ElTableColumn>
          <ElTableColumn label="金额(元)" prop="_money" min-width="150" align="center" show-overflow-tooltip>
          </ElTableColumn>
          <ElTableColumn label="结算价格(元)" prop="guide_price" min-width="150" align="center" show-overflow-tooltip>
            <template #default="scope"> {{ _utils.FtoY(scope.row.guide_price) }} </template>
          </ElTableColumn>
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
import dayjs from "dayjs";
import { Message } from "@/global/const";
import { dateTimeEndFilter, timestampFilter } from "@/utils/Dayjs/index";
import _utils from "@/utils/index";
import { apiStocktakeFoodStatisticsList } from "@/api/warehouse";

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
    month: "",
  },
  total: 0,
  data: [],
});

tableModel.query.month = dayjs(new Date()).format("YYYYMM");
/** 时间 */
const dateTimeModel = reactive({
  valueFormat: "YYYYMM",
  defaultTime: new Date(2000, 1, 1, 23, 59, 59),
});
const onDateTimeDisabled = (time: Date) => {
  const dateTime = dateTimeEndFilter(new Date());
  const timestamp = timestampFilter(dateTime);
  return time.getTime() > timestamp;
};

/** 请求 */
const onTableRequest = async () => {
  tableModel.vLoading = true;
  const query = JSON.parse(JSON.stringify(tableModel.query));
  query.month = Number(query.month);

  const { success, data, message } = await apiStocktakeFoodStatisticsList(query);
  if (success) {
    const list = _utils.getDefaultArray(data.list);
    tableModel.data = list.map((item: Obj) => {
      item.pro_no = item.pro_no === "-1" ? "线下购买" : item.pro_no;
      item._old_count = item.old_count > 0 ? _utils.KtoJ(item.old_count, item?.measure_type) + item.unit : "-";
      item._old_money = _utils.FtoY(item.old_money);
      item._in_count = item.in_count > 0 ? _utils.KtoJ(item.in_count, item?.measure_type) + item.unit : "-";
      item._in_money = _utils.FtoY(item.in_money);
      item._out_count = item.out_count > 0 ? _utils.KtoJ(item.out_count, item?.measure_type) + item.unit : "-";
      item._out_money = _utils.FtoY(item.out_money);
      item._count = item.count > 0 ? _utils.KtoJ(item.count, item?.measure_type) + item.unit : "-";
      item._money = _utils.FtoY(item.money);
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
  onTableSearch();
};

</script>

<style lang="scss" scoped></style>
