<template>
  <div class="layout-table" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
    <div class="title-container" style="margin-bottom: 20px">
      <ElButton type="info" icon="Back" @click="onBackClick" plain>返回</ElButton>
    </div>
    <div class="query-container">
      <div class="query-left">
        <ElForm ref="formRef" :model="tableModel.query"><ElFormItem label="食材名称" prop="pro_name">
            <ElInput
              v-model="tableModel.query.pro_name"
              maxlength="30"
              show-word-limit
              clearable
              placeholder="食材名称"
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
      <ElTable height="100%" scrollbar-always-on :data="tableModel.data"><ElTableColumn
          label="批次号"
          prop="batch_no"
          min-width="200"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn
          label="食材编号"
          prop="pro_no"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn label="食材名称" prop="pro_name" min-width="150" align="center" show-overflow-tooltip>
        </ElTableColumn>
        <ElTableColumn label="食材类型" prop="pro_type_name" min-width="150" align="center" show-overflow-tooltip>
        </ElTableColumn>
        <ElTableColumn
          label="入库人"
          prop="user_name"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn
          label="入库数量"
          prop="count"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn label="入库时间" prop="created_at" min-width="150" align="center" show-overflow-tooltip>
          <template #default="scope">
            {{ dateTimeFilter(scope.row.created_at) }}
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
import { ref, reactive, onBeforeMount } from "vue";
import { Message } from "@/global/const";
import _utils from "@/utils";
import { apiCanteenPurchaseCostStatisticsDetailList } from "@/api/recipe";
import { useRouter } from "vue-router";
import { usePurchasingAuxStore } from "../aux_modules/store";
import { dateTimeFilter } from "@/utils/Dayjs";
const purchasingAuxStore = usePurchasingAuxStore();
const router = useRouter();
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
    size: 10,
    start_time: "",
    end_time: "",
    pro_name: "",
  },
  total: 0,
  data: [],
});
onBeforeMount(() => {
  tableModel.query = { ...purchasingAuxStore.query };
  tableModel.query.pro_name = "";
  console.log(tableModel.query);
  onTableRequest();
});
/** 返回 */
const onBackClick = () => {
  router.back();
};

/** 请求 */
const onTableRequest = async () => {
  tableModel.vLoading = true;
  const { success, data, message } = await apiCanteenPurchaseCostStatisticsDetailList(tableModel.query);
  if (success) {
    const list = _utils.getDefaultArray(data.list);
    tableModel.data = list;
    tableModel.total = data.total;
  } else {
    Message.warning(message);
  }
  tableModel.vLoading = false;
};

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
  tableModel.query.pro_name = "";
  onTableSearch();
};

</script>

<style lang="scss" scoped></style>

