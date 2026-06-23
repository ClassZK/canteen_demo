<template>
  <div class="layout-table" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
    <div class="query-container">
      <div class="query-left"></div>
      <div class="query-right">
        <ElButton type="primary" @click="onTableSearch">查询</ElButton>
      </div>
    </div>
    <div class="table-container">
      <ElTable height="100%" scrollbar-always-on :data="tableModel.data">
        
        <IPlatformOrgColumn></IPlatformOrgColumn><ElTableColumn
          label="采购时间"
          prop="in_time"
          min-width="160"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn
          label="组织名称" prop="org_name"
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
        <ElTableColumn
          label="食材名称"
          prop="pro_name"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn label="采购数量" prop="_count" min-width="150" align="center" show-overflow-tooltip>
        </ElTableColumn>
        <ElTableColumn label="单价(元)" prop="_price" min-width="150" align="center" show-overflow-tooltip>
          <template #default="scope">
            <span>{{ scope.row._price + "元/" + scope.row.unit }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="采购总价(元)" prop="totalPrice" min-width="150" align="center" show-overflow-tooltip>
        </ElTableColumn>
        <ElTableColumn label="均价(元/斤)" prop="averagePrice" min-width="150" align="center" show-overflow-tooltip>
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
import { reactive } from "vue";
import { useMonthlyPurchasePriceAuxStore } from "../aux_modules/store";
import { Message } from "@/global/const";
import _utils from "@/utils";
import { apiForewarningMonthPriceDetail } from "@/api/warehouse";

const MonthlyPurchasePriceAuxStore = useMonthlyPurchasePriceAuxStore();

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
    warn_id: "",
    type: 2,
  },
  total: 0,
  data: [],
});

/** 请求 */
const onTableRequest = async () => {
  tableModel.vLoading = true;
  tableModel.query.warn_id = MonthlyPurchasePriceAuxStore.data.id;
  const { success, data, message } = await apiForewarningMonthPriceDetail(tableModel.query);
  if (success) {
    const list = _utils.getDefaultArray(data.list);
    tableModel.data = list.map((item: Obj) => {
      item._count = item.count > 0 ? _utils.KtoJ(item.count, item?.measure_type) + item.unit : "-";
      item._price = _utils.FtoY(item.price);
      item.totalPrice = item._price * _utils.KtoJ(item.count, item?.measure_type);
      item.averagePrice = _utils.FtoY((item.price / item.unit_weight) * 500);
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
</script>

<style lang="scss" scoped></style>
