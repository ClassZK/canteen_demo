<template>
  <div class="layout-table reconciliation-page" v-loading="loading" element-loading-text="数据加载中">
    <div class="query-container">
      <div class="query-left">
        <ElForm :inline="true" :model="query">
          
          <IPlatformOrgFilter></IPlatformOrgFilter><ElFormItem label="状态">
            <ElSelect v-model="query.status" placeholder="请选择状态" clearable>
              <ElOption label="未结清" value="draft" />
              <ElOption label="部分对账" value="partially_confirmed" />
              <ElOption label="已对账" value="confirmed" />
              <ElOption label="已结清" value="closed" />
            </ElSelect>
          </ElFormItem>
        </ElForm>
      </div>
      <div class="query-right">
        <ElButton type="primary" @click="onSearch">查询</ElButton>
        <ElButton class="gray" @click="onReset">重置</ElButton>
      </div>
    </div>

    <div class="table-container">
      <ElTable height="100%" scrollbar-always-on :data="rows" table-layout="fixed">
        
        <IPlatformOrgColumn></IPlatformOrgColumn><ElTableColumn label="账期" prop="periodText" min-width="180" show-overflow-tooltip />
        <ElTableColumn label="客户名称" prop="customerName" min-width="180" show-overflow-tooltip />
        <ElTableColumn label="配送商" prop="distributorName" min-width="170" show-overflow-tooltip />
        <ElTableColumn label="账单金额" width="130" align="right">
          <template #default="{ row }">{{ formatMoney(row.billAmount) }}</template>
        </ElTableColumn>
        <ElTableColumn label="应收金额" width="130" align="right">
          <template #default="{ row }">{{ formatMoney(row.receivableAmount) }}</template>
        </ElTableColumn>
        <ElTableColumn label="实际结算金额" width="140" align="right">
          <template #default="{ row }">{{ formatMoney(row.settleAmount) }}</template>
        </ElTableColumn>
        <ElTableColumn label="差额" width="120" align="right">
          <template #default="{ row }">
            <span :class="{ danger: row.differenceAmount < 0 }">{{ formatMoney(row.differenceAmount) }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="状态" width="120" align="center">
          <template #default="{ row }">
            <ElTag :type="billStatusTag(row.status)">{{ billStatusText(row.status) }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="未结清金额" width="130" align="right">
          <template #default="{ row }">{{ row.status === "closed" ? "-" : formatMoney(row.unsettledAmount) }}</template>
        </ElTableColumn>
        <ElTableColumn fixed="right" label="操作" width="150" align="center">
          <template #default="{ row }">
            <ElButton link type="primary" @click="openDetail(row)">明细</ElButton>
            <ElButton link type="primary" @click="openStatement(row)">对账单</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>

    <div class="pagination">
      <ElPagination
        v-model:current-page="query.page"
        v-model:page-size="query.page_size"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
      />
    </div>

    <ElDrawer v-model="detailVisible" size="72%" :title="detailTitle" destroy-on-close>
      <div class="drawer-body">
        <ElTable :data="detailRows" height="100%" table-layout="fixed" scrollbar-always-on v-loading="detailLoading">
          <ElTableColumn label="下单时间" prop="createdAt" width="170" />
          <ElTableColumn label="签收时间" prop="signedAt" width="170" />
          <ElTableColumn label="订单号" prop="orderNo" min-width="180" show-overflow-tooltip />
          <ElTableColumn label="客户" prop="customerName" min-width="170" show-overflow-tooltip />
          <ElTableColumn label="配送商" prop="distributorName" min-width="160" show-overflow-tooltip />
          <ElTableColumn label="订单金额" width="120" align="right">
            <template #default="{ row }">{{ formatMoney(row.totalAmount) }}</template>
          </ElTableColumn>
          <ElTableColumn label="入账金额" width="120" align="right">
            <template #default="{ row }">{{ formatMoney(row.billAmount) }}</template>
          </ElTableColumn>
          <ElTableColumn label="实际结算金额" width="140" align="right">
            <template #default="{ row }">{{ formatMoney(row.settleAmount) }}</template>
          </ElTableColumn>
          <ElTableColumn label="订单状态" width="120" align="center">
            <template #default="{ row }">{{ orderStatusText(row.status) }}</template>
          </ElTableColumn>
        </ElTable>
        <div class="pagination">
          <ElPagination
            v-model:current-page="detailQuery.page"
            v-model:page-size="detailQuery.page_size"
            :total="detailTotal"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
          />
        </div>
      </div>
    </ElDrawer>

    <ElDrawer v-model="statementVisible" size="88%" :title="statementTitle" destroy-on-close>
      <div class="statement" v-loading="statementLoading">
        <div class="statement-toolbar">
          <div class="statement-meta">
            <div>账单号：{{ currentBill?.billNo || "-" }}</div>
            <div class="muted">{{ currentBill?.customerName || "-" }} / {{ currentBill?.distributorName || "-" }}</div>
          </div>
          <div class="statement-total">当前页结算合计：{{ formatMoney(statementTotal) }}</div>
          <ElButton type="primary" :loading="completeLoading" @click="completeStatement">完成当前页对账</ElButton>
        </div>

        <ElEmpty v-if="!statementRows.length" description="暂无对账明细" />
        <div v-else class="statement-list">
          <section v-for="order in statementRows" :key="order.id" class="order-block">
            <div class="order-head">
              <span>订单号：{{ order.orderNo }}</span>
              <span>下单时间：{{ order.createdAt }}</span>
              <span>入库时间：{{ order.stockedAt }}</span>
              <span>签收人：{{ order.receiver }}</span>
            </div>
            <ElTable :data="order.items" border table-layout="fixed" scrollbar-always-on>
              <ElTableColumn label="商品名称" prop="name" min-width="150" show-overflow-tooltip />
              <ElTableColumn label="规格" prop="spec" min-width="120" show-overflow-tooltip />
              <ElTableColumn label="数量" prop="quantity" width="90" />
              <ElTableColumn label="单位" prop="unit" width="80" />
              <ElTableColumn label="商品报价" width="110" align="right">
                <template #default="{ row }">{{ formatAmount(row.quotePrice) }}</template>
              </ElTableColumn>
              <ElTableColumn label="国调价" width="150">
                <template #default="{ row }">
                  <ElInputNumber v-model="row.nationalPrice" :min="0" :precision="2" :step="1" controls-position="right" />
                </template>
              </ElTableColumn>
              <ElTableColumn label="市场询价" width="150">
                <template #default="{ row }">
                  <ElInputNumber v-model="row.marketPrice" :min="0" :precision="2" :step="1" controls-position="right" />
                </template>
              </ElTableColumn>
              <ElTableColumn label="同区学校价" width="150">
                <template #default="{ row }">
                  <ElInputNumber v-model="row.schoolPrice" :min="0" :precision="2" :step="1" controls-position="right" />
                </template>
              </ElTableColumn>
              <ElTableColumn label="结算价格" width="150">
                <template #default="{ row }">
                  <ElInputNumber v-model="row.settlePrice" :min="0" :precision="2" :step="1" controls-position="right" />
                </template>
              </ElTableColumn>
              <ElTableColumn label="下浮比例" width="150">
                <template #default="{ row }">
                  <div class="ratio-input">
                    <ElInputNumber v-model="row.discountRatio" :min="0" :max="100" :precision="2" :step="1" controls-position="right" />
                    <span>%</span>
                  </div>
                </template>
              </ElTableColumn>
              <ElTableColumn label="实际结算价" width="120" align="right">
                <template #default="{ row }">{{ formatOptionalAmount(actualSettlePrice(row)) }}</template>
              </ElTableColumn>
              <ElTableColumn label="小计" width="120" align="right">
                <template #default="{ row }">{{ row.settlePrice === undefined ? "-" : formatAmount(lineSubtotal(row)) }}</template>
              </ElTableColumn>
            </ElTable>
          </section>
        </div>

        <div class="pagination">
          <ElPagination
            v-model:current-page="statementQuery.page"
            v-model:page-size="statementQuery.page_size"
            :total="statementTotalRows"
            :page-sizes="[5, 10, 20]"
            layout="total, sizes, prev, pager, next, jumper"
          />
        </div>
      </div>
    </ElDrawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import type { TagProps } from "element-plus";
import {
  apiOpenReceivableBillDetail,
  apiOpenReceivableBillReconciliation,
  apiOpenReceivableBillReconciliationComplete,
  apiOpenReceivableBills,
} from "@/api/warehouse";

interface BillRow {
  id: string | number;
  billNo: string;
  periodText: string;
  customerName: string;
  distributorName: string;
  billAmount: number;
  receivableAmount: number;
  settleAmount: number;
  differenceAmount: number;
  unsettledAmount: number;
  status: string;
}

interface StatementItem {
  id: number;
  name: string;
  spec: string;
  quantity: number;
  unit: string;
  quotePrice: number;
  nationalPrice: number | undefined;
  marketPrice: number | undefined;
  schoolPrice: number | undefined;
  settlePrice: number | undefined;
  discountRatio: number | undefined;
}

const loading = ref(false);
const rows = ref<BillRow[]>([]);
const total = ref(0);
const query = reactive({
  page: 1,
  page_size: 20,
  status: "",
});

const detailVisible = ref(false);
const detailLoading = ref(false);
const detailRows = ref<Obj[]>([]);
const detailTotal = ref(0);
const detailQuery = reactive({ page: 1, page_size: 10 });

const statementVisible = ref(false);
const statementLoading = ref(false);
const completeLoading = ref(false);
const statementRows = ref<Obj[]>([]);
const statementTotalRows = ref(0);
const statementQuery = reactive({ page: 1, page_size: 5 });
const currentBill = ref<BillRow | null>(null);

const toNumber = (value: any) => Number(value || 0);
const toOptionalNumber = (value: any) => (value === null || value === undefined || value === "" ? undefined : Number(value));
const formatAmount = (value: any) => Number(value || 0).toFixed(2);
const formatOptionalAmount = (value: any) => (value === null || value === undefined || value === "" ? "-" : formatAmount(value));
const formatMoney = (value: any) => `¥${formatAmount(value)}`;
const formatDate = (value: any) => (value ? String(value).slice(0, 10) : "-");
const formatDateTime = (value: any) => (value ? String(value).replace("T", " ").slice(0, 19) : "-");

const billStatusText = (status: string) => {
  const map: Obj = {
    draft: "未结清",
    partially_confirmed: "部分对账",
    confirmed: "已对账",
    closed: "已结清",
  };
  return map[status] || status || "-";
};

const billStatusTag = (status: string): TagProps["type"] => {
  const map: Record<string, TagProps["type"]> = {
    draft: "warning",
    partially_confirmed: "primary",
    confirmed: "success",
    closed: "success",
  };
  return map[status] || "info";
};

const orderStatusText = (status: string) => {
  const map: Obj = {
    pending_order_audit: "下单待审核",
    pending_confirm: "待接单",
    accepted: "已接单",
    pending_driver_confirm: "待运输",
    in_transit: "运输中",
    shipped: "待签收",
    pending_review: "待确认",
    completed: "已完成",
    signed: "已完成",
    cancelled: "已取消",
  };
  return map[status] || status || "-";
};

const mapBill = (item: Obj): BillRow => {
  const receivableAmount = toNumber(item.receivable_amount || item.total_amount);
  const settleAmount = toNumber(item.settle_amount || item.actual_settle_amount);
  return {
    id: item.id,
    billNo: item.bill_no || "-",
    periodText: `${formatDate(item.period_start)} 至 ${formatDate(item.period_end)}`,
    customerName: item.school_name || item.customer_name || (item.school ? `客户#${item.school}` : "-"),
    distributorName: item.distributor_name || (item.distributor ? `配送商#${item.distributor}` : "-"),
    billAmount: toNumber(item.total_amount),
    receivableAmount,
    settleAmount,
    differenceAmount: settleAmount - receivableAmount,
    unsettledAmount: toNumber(item.unsettled_amount || item.total_amount),
    status: item.status || "",
  };
};

const loadData = async () => {
  loading.value = true;
  try {
    const { success, data, message } = await apiOpenReceivableBills({
      page: query.page,
      page_size: query.page_size,
      status: query.status,
    });
    if (!success) {
      ElMessage.warning(message || "获取应收账单失败");
      return;
    }
    const list = data?.results || data?.list || [];
    rows.value = list.map(mapBill);
    total.value = Number(data?.count || data?.total || 0);
  } finally {
    loading.value = false;
  }
};

const mapDetailOrder = (item: Obj) => ({
  id: item.id,
  createdAt: formatDateTime(item.created_at),
  signedAt: formatDateTime(item.signed_at),
  orderNo: item.order_no || "-",
  customerName: item.customer_name || "-",
  distributorName: item.distributor_name || "-",
  totalAmount: toNumber(item.total_amount),
  billAmount: toNumber(item.bill_amount),
  settleAmount: toNumber(item.settle_amount),
  status: item.status,
});

const loadDetail = async () => {
  if (!currentBill.value) return;
  detailLoading.value = true;
  try {
    const { success, data, message } = await apiOpenReceivableBillDetail({
      id: String(currentBill.value.id),
      page: detailQuery.page,
      page_size: detailQuery.page_size,
    });
    if (!success) {
      ElMessage.warning(message || "获取账单明细失败");
      return;
    }
    const orders = data?.orders || {};
    detailRows.value = (orders.results || orders.list || []).map(mapDetailOrder);
    detailTotal.value = Number(orders.count || orders.total || 0);
    currentBill.value = mapBill(data);
  } finally {
    detailLoading.value = false;
  }
};

const mapStatementItem = (item: Obj): StatementItem => ({
  id: Number(item.line_id),
  name: item.product_name || "-",
  spec: item.spec_name || "-",
  quantity: toNumber(item.quantity),
  unit: item.unit || "-",
  quotePrice: toNumber(item.quote_price),
  nationalPrice: toOptionalNumber(item.national_price),
  marketPrice: toOptionalNumber(item.market_price),
  schoolPrice: toOptionalNumber(item.school_price),
  settlePrice: toOptionalNumber(item.settle_price),
  discountRatio: toOptionalNumber(item.discount_ratio),
});

const mapStatementOrder = (order: Obj) => ({
  id: order.id,
  orderNo: order.order_no || "-",
  createdAt: formatDateTime(order.created_at),
  stockedAt: formatDateTime(order.stocked_at || order.signed_at),
  receiver: order.receiver_name || "-",
  items: (order.items || []).map(mapStatementItem),
});

const loadStatement = async () => {
  if (!currentBill.value) return;
  statementLoading.value = true;
  try {
    const { success, data, message } = await apiOpenReceivableBillReconciliation({
      id: String(currentBill.value.id),
      page: statementQuery.page,
      page_size: statementQuery.page_size,
    });
    if (!success) {
      ElMessage.warning(message || "获取对账明细失败");
      return;
    }
    if (data?.bill) {
      currentBill.value = {
        ...currentBill.value,
        ...mapBill(data.bill),
      };
    }
    const orders = data?.orders || {};
    statementRows.value = (orders.results || orders.list || []).map(mapStatementOrder);
    statementTotalRows.value = Number(orders.count || orders.total || 0);
  } finally {
    statementLoading.value = false;
  }
};

const actualSettlePrice = (row: StatementItem) => {
  if (row.settlePrice === undefined) return undefined;
  return Number(row.settlePrice || 0) - Number(row.settlePrice || 0) * (Number(row.discountRatio || 0) / 100);
};

const lineSubtotal = (row: StatementItem) => Number(row.quantity || 0) * Number(actualSettlePrice(row) || 0);
const statementTotal = computed(() =>
  statementRows.value.reduce(
    (sum, order) => sum + order.items.reduce((orderSum: number, item: StatementItem) => orderSum + lineSubtotal(item), 0),
    0
  )
);

const detailTitle = computed(() => {
  if (!currentBill.value) return "账单明细";
  return `${currentBill.value.customerName} / ${currentBill.value.distributorName} / ${currentBill.value.periodText}`;
});

const statementTitle = computed(() => {
  if (!currentBill.value) return "对账单";
  return `对账单 - ${currentBill.value.periodText}`;
});

const onSearch = () => {
  query.page = 1;
  loadData();
};

const onReset = () => {
  query.page = 1;
  query.page_size = 20;
  query.status = "";
  loadData();
};

const openDetail = async (row: BillRow) => {
  currentBill.value = row;
  detailRows.value = [];
  detailTotal.value = 0;
  detailQuery.page = 1;
  detailVisible.value = true;
  await loadDetail();
};

const openStatement = async (row: BillRow) => {
  currentBill.value = row;
  statementRows.value = [];
  statementTotalRows.value = 0;
  statementQuery.page = 1;
  statementVisible.value = true;
  await loadStatement();
};

const completeStatement = async () => {
  if (!currentBill.value) return;
  const items = statementRows.value.flatMap(order =>
    order.items
      .filter((item: StatementItem) => item.settlePrice !== undefined)
      .map((item: StatementItem) => ({
        line_id: item.id,
        settle_price: item.settlePrice,
        national_price: item.nationalPrice ?? null,
        market_price: item.marketPrice ?? null,
        school_price: item.schoolPrice ?? null,
        discount_ratio: item.discountRatio ?? null,
      }))
  );
  if (!items.length) {
    ElMessage.warning("请先填写结算价格");
    return;
  }
  completeLoading.value = true;
  try {
    const { success, data, message } = await apiOpenReceivableBillReconciliationComplete({
      id: String(currentBill.value.id),
      items,
    });
    if (!success) {
      ElMessage.warning(message || "完成对账失败");
      return;
    }
    if (data?.sfs_sync_failed) {
      ElMessage.warning(data.sfs_sync_message || "本地对账已完成，三方同步失败");
    } else {
      ElMessage.success(`完成对账，已更新 ${data?.updated_count || 0} 条明细`);
    }
    await Promise.all([loadStatement(), loadData()]);
  } finally {
    completeLoading.value = false;
  }
};

watch([() => query.page, () => query.page_size], loadData);
watch([() => detailQuery.page, () => detailQuery.page_size], () => {
  if (detailVisible.value) loadDetail();
});
watch([() => statementQuery.page, () => statementQuery.page_size], () => {
  if (statementVisible.value) loadStatement();
});

onMounted(loadData);

</script>

<style lang="scss" scoped>
.reconciliation-page {
  gap: 0;
}

.query-left {
  :deep(.el-select) {
    width: 180px;
  }
}

.danger {
  color: var(--el-color-danger);
  font-weight: 600;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  flex: none;
  padding: 12px 0 0;
}

.drawer-body {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  height: 100%;
}

.statement {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  height: 100%;
}

.statement-toolbar {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) auto auto;
  align-items: center;
  gap: 16px;
  flex: none;
  padding-bottom: 12px;
}

.statement-meta {
  color: #1f2937;
  font-weight: 600;
}

.muted {
  margin-top: 6px;
  color: #6b7280;
  font-size: 13px;
  font-weight: 400;
}

.statement-total {
  color: #1f2937;
  font-weight: 600;
  white-space: nowrap;
}

.statement-list {
  overflow: auto;
  flex: auto;
  min-height: 0;
}

.order-block {
  margin-bottom: 14px;
}

.order-head {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 10px 12px;
  border: 1px solid var(--el-border-color);
  border-bottom: 0;
  background: var(--el-fill-color-light);
  color: #374151;
  font-size: 13px;
}

.ratio-input {
  display: flex;
  align-items: center;
  gap: 6px;
}

:deep(.el-drawer__body) {
  overflow: hidden;
  padding-top: 0;
}
</style>
