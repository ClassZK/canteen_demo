<template>
  <div class="layout-table source-page" v-loading="loading" element-loading-text="数据加载中">
    <div class="query-container">
      <div class="query-left">
        <ElForm :inline="true" :model="queryForm">
          
          <IPlatformOrgFilter></IPlatformOrgFilter><ElFormItem label="下单时间">
            <ElDatePicker
              v-model="queryForm.dateRange"
              type="daterange"
              value-format="YYYY-MM-DD"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              range-separator="至"
            />
          </ElFormItem>
          <ElFormItem label="订单号">
            <ElInput v-model.trim="queryForm.orderId" placeholder="请输入订单号" clearable @keyup.enter="onSearch" />
          </ElFormItem>
        </ElForm>
      </div>
      <div class="query-right">
        <ElButton type="primary" @click="onSearch">查询</ElButton>
        <ElButton class="gray" @click="onReset">重置</ElButton>
      </div>
    </div>

    <div class="table-container">
      <ElTable height="100%" scrollbar-always-on :data="pageList" row-key="recordId" table-layout="fixed">
        
        <IPlatformOrgColumn></IPlatformOrgColumn><ElTableColumn label="下单时间" prop="orderTime" min-width="170" align="center" />
        <ElTableColumn label="订单号" prop="orderNo" min-width="210" align="center" show-overflow-tooltip />
        <ElTableColumn label="客户" prop="schoolName" min-width="170" align="center" show-overflow-tooltip />
        <ElTableColumn label="配送商" prop="providerName" min-width="230" align="center" show-overflow-tooltip />
        <ElTableColumn label="总金额" min-width="120" align="center">
          <template #default="{ row }">
            {{ formatAmount(row.totalAmount) }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="订单状态" prop="orderStatusText" min-width="120" align="center" />
        <ElTableColumn fixed="right" label="操作" width="100" align="center">
          <template #default="{ row }">
            <ElButton link type="primary" @click="onViewDetail(row)">详情</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>

    <IPage :total="total" :page="tableModel.page" :size="tableModel.size" @change="onTablePage"></IPage>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { Message } from "@/global/const";
import { apiOpenTraceabilityRecords } from "@/api/warehouse";

type OrderStatus = "signed" | "unsigned";

interface TraceabilityOrderItem {
  recordId: number;
  orderTime: string;
  orderNo: string;
  schoolName: string;
  providerName: string;
  totalAmount: number;
  orderStatus: OrderStatus;
  orderStatusText: string;
}

const TRACEABILITY_DETAIL_CACHE_KEY = "delivery-provider-traceability-detail-cache";
const Router = useRouter();
const loading = ref(false);
const total = ref(0);
const pageList = ref<TraceabilityOrderItem[]>([]);

const queryForm = reactive({
  orderId: "",
  dateRange: [] as string[],
});

const queryModel = reactive({
  orderId: "",
  dateRange: [] as string[],
});

const tableModel = reactive({
  page: 1,
  size: 20,
});

const formatDateTime = (value: string | null | undefined) => (value ? String(value).replace("T", " ").slice(0, 19) : "--");
const formatAmount = (amount: number) => Number(amount || 0).toFixed(2);
const mapStatus = (orderStatus: string | null | undefined): OrderStatus =>
  orderStatus === "signed" || orderStatus === "completed" ? "signed" : "unsigned";
const mapStatusText = (status: OrderStatus) => (status === "signed" ? "已签收" : "未签收");

const mapRecord = (item: Obj): TraceabilityOrderItem => {
  const status = mapStatus(item.order_status);
  const totalAmount = (item.traceability_items || []).reduce((sum: number, row: Obj) => sum + Number(row.subtotal || 0), 0);
  return {
    recordId: Number(item.id),
    orderTime: formatDateTime(item.placed_at || item.created_at),
    orderNo: item.order_no || item.batch_no || "--",
    schoolName: item.school_name || "--",
    providerName: item.distributor_name || "--",
    totalAmount,
    orderStatus: status,
    orderStatusText: mapStatusText(status),
  };
};

const onTableRequest = async () => {
  loading.value = true;
  try {
    const params: Obj = {
      page: tableModel.page,
      page_size: tableModel.size,
    };
    if (queryModel.orderId) params.keyword = queryModel.orderId;
    if (queryModel.dateRange.length === 2) {
      params.placed_from = `${queryModel.dateRange[0]}T00:00:00`;
      params.placed_to = `${queryModel.dateRange[1]}T23:59:59`;
    }
    const { success, data, message } = await apiOpenTraceabilityRecords(params);
    if (!success) {
      Message.warning(message);
      return;
    }
    pageList.value = (data?.results || data?.list || []).map(mapRecord);
    total.value = Number(data?.count || data?.total || 0);
  } finally {
    loading.value = false;
  }
};

const onTablePage = (object: { page: number; size: number }) => {
  tableModel.page = object.page;
  tableModel.size = object.size;
  onTableRequest();
};

const onSearch = () => {
  queryModel.orderId = queryForm.orderId;
  queryModel.dateRange = [...queryForm.dateRange];
  tableModel.page = 1;
  onTableRequest();
};

const onReset = () => {
  queryForm.orderId = "";
  queryForm.dateRange = [];
  onSearch();
};

const onViewDetail = (row: TraceabilityOrderItem) => {
  try {
    sessionStorage.setItem(TRACEABILITY_DETAIL_CACHE_KEY, JSON.stringify(row));
  } catch {
    // ignore cache failure
  }
  Router.push({ path: "/sourceMangeDetail", query: { id: row.orderNo } });
};

onTableRequest();

</script>

<style lang="scss" scoped>
.source-page {
  :deep(.el-date-editor.el-date-editor--daterange) {
    width: 260px;
  }

  :deep(.el-input) {
    width: 240px;
  }
}
</style>
