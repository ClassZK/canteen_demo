<template>
  <div class="layout-table" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
    <div class="query-container">
      <div class="query-left">
        <ElForm ref="formRef" :model="tableModel.query">
          <IPlatformOrgFilter></IPlatformOrgFilter>
          <ElFormItem label="订单状态" prop="status">
            <ElSelect v-model="tableModel.query.status" placeholder="请选择订单状态" @change="onTableSearch">
              <ElOption label="待收货" value="pending"></ElOption>
              <ElOption label="已收货" value="receipted"></ElOption>
            </ElSelect>
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
        <IPlatformOrgColumn></IPlatformOrgColumn>
        <ElTableColumn label="供应商名称" prop="shop_name" align="center" min-width="180" show-overflow-tooltip />
        <ElTableColumn label="收货地址" prop="shipping_address" min-width="220" align="center" show-overflow-tooltip />
        <ElTableColumn label="下单时间" prop="order_time" min-width="170" align="center" show-overflow-tooltip />
        <ElTableColumn label="商品数量" prop="goods_total" min-width="120" align="center" show-overflow-tooltip />
        <ElTableColumn label="状态" prop="status" min-width="140" align="center" show-overflow-tooltip>
          <template #default="scope">
            <ElTag :type="getStatusTagType(scope.row)">
              {{ getStatusText(scope.row) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn fixed="right" label="操作" width="150" align="center">
          <template #default="scope">
            <div class="handle">
              <ElButton type="primary" link @click="onTableDetail(scope.row)">详情</ElButton>
              <ElButton v-if="canSign" type="primary" link @click="onTableSign(scope.row)">签收</ElButton>
            </div>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
    <IPage :total="tableModel.total" :page="tableModel.query.page" :size="tableModel.query.size" @change="onTablePage"></IPage>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { Message } from "@/global/const";
import _utils from "@/utils/index";
import { apiOrderReceiptPendingPage, apiOrderReceiptReceiptedPage } from "@/api/warehouse";

const Router = useRouter();
const formRef = ref();

const tableQueryInitial = () => ({
  page: 1,
  size: 20,
  status: "pending",
});

const tableModel = reactive<{
  vLoading: boolean;
  query: Obj;
  total: number;
  data: Obj[];
}>({
  vLoading: false,
  query: tableQueryInitial(),
  total: 0,
  data: [],
});

const canSign = computed(() => tableModel.query.status === "pending");

const onTableRequest = async () => {
  tableModel.vLoading = true;
  const params = {
    page: tableModel.query.page,
    size: tableModel.query.size,
  };
  const result =
    tableModel.query.status === "pending"
      ? await apiOrderReceiptPendingPage(params)
      : await apiOrderReceiptReceiptedPage(params);

  if (result.success) {
    tableModel.data = _utils.getDefaultArray(result.data.list);
    tableModel.total = result.data.total;
  } else {
    Message.warning(result.message);
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
  tableModel.query = tableQueryInitial();
  formRef.value?.resetFields();
  onTableSearch();
};

const onTableDetail = (data: Obj) => {
  Router.push({ path: "/orderReceiptDetail", query: { id: data.order_id } });
};

const onTableSign = (data: Obj) => {
  Router.push({ path: "/orderReceiptSign", query: { id: data.order_id } });
};

const getStatusText = (data: Obj) => {
  if (data.receipt_status === "partial" || data.status === "部分签收") return "部分签收";
  if (tableModel.query.status === "pending") return "待收货";
  return Number(data.status) === 2 ? "已确认" : "待入库确认";
};

const getStatusTagType = (data: Obj) => {
  if (data.receipt_status === "partial" || data.status === "部分签收") return "primary";
  if (tableModel.query.status === "pending") return "warning";
  return Number(data.status) === 2 ? "success" : "primary";
};
</script>

<style lang="scss" scoped></style>
