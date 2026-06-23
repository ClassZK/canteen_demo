<template>
  <div class="ingredient-container">
    <div class="ingredient-header">
      <ElButton icon="back" @click="onBack">返回</ElButton>
      <p class="title">{{ `【${tableModel.detail.pro_name}】食材批次` }}</p>
    </div>
    <div class="layout-table" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
      <div class="query-container">
        <div class="query-left">
          <ElForm ref="formRef" :model="tableModel.query">
            
          <IPlatformOrgFilter></IPlatformOrgFilter><ElFormItem label="批次号" prop="batch_no">
              <ElInput
                v-model.trim="tableModel.query.batch_no"
                maxlength="30"
                show-word-limit
                clearable
                placeholder="批次号"
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
            label="入库批次"
            prop="in_batch_no"
            min-width="220"
            align="center"
            show-overflow-tooltip
          ></ElTableColumn>
          <ElTableColumn
            label="入库时间"
            prop="in_time"
            min-width="160"
            align="center"
            show-overflow-tooltip
          ></ElTableColumn>
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
          <ElTableColumn label="入库数量" prop="_count" min-width="150" align="center" show-overflow-tooltip>
          </ElTableColumn>
          <ElTableColumn label="出库数量" prop="_out_count" min-width="150" align="center" show-overflow-tooltip>
          </ElTableColumn>
          <ElTableColumn label="库存数量" prop="_storeCount" min-width="150" align="center" show-overflow-tooltip>
          </ElTableColumn>
          <ElTableColumn
            label="供应商"
            prop="supplier_name"
            min-width="150"
            align="center"
            show-overflow-tooltip
          ></ElTableColumn>
          <ElTableColumn label="单价(元)" prop="price" min-width="150" align="center" show-overflow-tooltip>
          </ElTableColumn>
          <ElTableColumn
            label="生产日期"
            prop="pro_date"
            min-width="160"
            align="center"
            show-overflow-tooltip
          ></ElTableColumn>
          <ElTableColumn
            label="保质期(天)"
            prop="expired_day"
            min-width="160"
            align="center"
            show-overflow-tooltip
          ></ElTableColumn>
          <ElTableColumn label="到期时间" prop="end_day" min-width="160" align="center" show-overflow-tooltip>
          </ElTableColumn>
          <ElTableColumn fixed="right" label="操作" width="120" align="center">
            <template #default="scope">
              <div class="handle">
                <!-- <ElButton type="primary" link @click="onTableTraceSource(scope.row)">溯源</ElButton> -->
                <template v-if="scope.row.storeCount > 0">
                  <ElButton type="warning" link @click="onTableIngredientReturn(scope.row)">退货</ElButton>
                  <ElButton type="success" link @click="onTableIngredientPrint(scope.row)">打印</ElButton>
                  <br />
                </template>
                <ElButton type="primary" link @click="onTableIngredientHistory(scope.row)">历史</ElButton>
                <ElButton type="primary" link @click="onTableIngredientDetail(scope.row)">详情</ElButton>
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
  </div>
  <IIngredientHistory></IIngredientHistory>
  <IIngredientDetail></IIngredientDetail>
  <IIngredientReturn></IIngredientReturn>
  <IIngredientSource></IIngredientSource>
  <IIngredientPrint></IIngredientPrint>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import Storage from "tddev/storage";
import IIngredientHistory from "./sub_modules/IngredientHistory.vue";
import IIngredientDetail from "./sub_modules/IngredientDetail.vue";
import IIngredientSource from "./sub_modules/IngredientSource.vue";
import IIngredientReturn from "./sub_modules/IngredientReturn.vue";
import IIngredientPrint from "./sub_modules/IngredientPrint.vue";
import { useIngredientStoreAuxStore } from "./aux_modules/store";
import { Message } from "@/global/const";
import { dateTimeFilter, timestampFilter, sToDateTimeFilter } from "@/utils/Dayjs";
import _utils from "@/utils/index";
import { apiInventoryBatchList } from "@/api/warehouse";

const Router = useRouter();
const IngredientStoreAuxStore = useIngredientStoreAuxStore();
const formRef = ref();

const tableQueryInitial = () => ({
  page: 1,
  size: 20,
  inventory_id: "",
  pro_no: "",
  batch_no: "",
});
/** 交互反馈数据 */
const tableModel = reactive<{
  vLoading: boolean;
  query: Obj;
  total: number;
  data: Obj[];
  detail: Obj;
}>({
  vLoading: false,
  query: tableQueryInitial(),
  total: 0,
  data: [],
  detail: {},
});

const onInit = () => {
  const IngredientDetail = Storage.get("IngredientDetail") ?? {};
  if (IngredientDetail && Reflect.ownKeys(IngredientDetail).length > 0) {
    tableModel.detail = IngredientDetail;
    tableModel.query.inventory_id = tableModel.detail.id;
    onTableRequest();
  }
};

/** 请求 */
const onTableRequest = async () => {
  tableModel.vLoading = true;
  const { success, data, message } = await apiInventoryBatchList(tableModel.query);
  if (success) {
    const list = _utils.getDefaultArray(data.list);
    tableModel.data = list.map((item: Obj) => {
      item.pro_no = item.pro_no === "-1" ? "线下购买" : item.pro_no;
      item._count = item.count > 0 ? _utils.KtoJ(item.count, item?.measure_type) + item.unit : "-";
      item._out_count = item.out_count > 0 ? _utils.KtoJ(item.out_count, item?.measure_type) + item.unit : "-";
      item.storeCount = item.count - item.out_count;
      item._storeCount = item.storeCount > 0 ? _utils.KtoJ(item.storeCount, item?.measure_type) + item.unit : "-";
      item.price = _utils.FtoY(item.price);
      item.unit_weight = _utils.KtoJ(item.unit_weight, 1);
      item.end_day = sToDateTimeFilter(item.end_day);
      return item;
    });
    tableModel.total = data.total;
  } else {
    Message.warning(message);
  }
  tableModel.vLoading = false;
};
onInit();

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
  onTableRequest();
};

const onTableEndTimeFilter = (data: Obj) => {
  const start = timestampFilter(data.pro_date);
  const limit = data.expired_day * 24 * 60 * 60 * 1000;
  const end = dateTimeFilter(start + limit);
  return end;
};

const onTableIngredientHistory = (data: Obj) => {
  IngredientStoreAuxStore.$patch(state => {
    state.ingredientHistoryData = data;
    state.ingredientHistoryVisible = true;
  });
};

const onTableIngredientDetail = (data: Obj) => {
  IngredientStoreAuxStore.$patch(state => {
    state.ingredientDetailData = data;
    state.ingredientDetailVisible = true;
  });
};

const onTableTraceSource = (data: Obj) => {
  IngredientStoreAuxStore.$patch(state => {
    state.ingredientSourceData = data;
    state.ingredientSourceVisible = true;
  });
};

const onTableIngredientReturn = (data: Obj) => {
  IngredientStoreAuxStore.$patch(state => {
    state.ingredientReturnData = data;
    state.ingredientReturnVisible = true;
  });
};

const onTableIngredientPrint = (data: Obj) => {
  IngredientStoreAuxStore.$patch(state => {
    state.ingredientPrintData = data;
    state.ingredientPrintVisible = true;
  });
};

const onBack = () => {
  Router.back();
};

onBeforeUnmount(() => {
  Storage.remove("IngredientDetail");
});
/** 监听操作类型 */
watch(
  () => IngredientStoreAuxStore.detailRefresh,
  () => {
    onTableRequest();
  },
);

</script>

<style lang="scss" scoped>
.ingredient-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  .ingredient-header {
    display: flex;
    align-items: center;
    flex: none;
    margin-bottom: var(--gap);
    padding: var(--gap);
    background: var(--el-color-white);
    border-radius: var(--radius-lg);
    .title {
      margin-left: var(--gap);
      font-size: var(--font-size-lg);
    }
  }
}
</style>
