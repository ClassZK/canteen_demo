<template>
  <div class="layout-table trace-detail" v-loading="loading" element-loading-text="数据加载中">
    <div class="detail-header">
      <ElButton :icon="Back" @click="onBack">返回</ElButton>
      <div class="header-title">
        <div class="title">溯源记录详情</div>
        <div class="sub-title">订单号：{{ detailInfo.orderNo }}</div>
      </div>
    </div>

    <div class="detail-body">
      <section class="section">
        <div class="section-title">基本信息</div>
        <div class="base-grid">
          <div class="item-block"><p class="item-label">订单号:</p><p class="item-value">{{ detailInfo.orderNo }}</p></div>
          <div class="item-block"><p class="item-label">下单时间:</p><p class="item-value">{{ detailInfo.orderTime }}</p></div>
          <div class="item-block"><p class="item-label">收货时间:</p><p class="item-value">{{ detailInfo.receiveTime }}</p></div>
          <div class="item-block"><p class="item-label">配送商电话:</p><p class="item-value">{{ detailInfo.providerPhone }}</p></div>
          <div class="item-block"><p class="item-label">购货人:</p><p class="item-value">{{ detailInfo.buyerName }}</p></div>
          <div class="item-block"><p class="item-label">收货人:</p><p class="item-value">{{ detailInfo.receiverName }}</p></div>
          <div class="item-block"><p class="item-label">发货地址:</p><p class="item-value">{{ detailInfo.shipAddress }}</p></div>
          <div class="item-block"><p class="item-label">支付方式:</p><p class="item-value">{{ detailInfo.payType }}</p></div>
          <div class="item-block"><p class="item-label">购货人电话:</p><p class="item-value">{{ detailInfo.buyerPhone }}</p></div>
          <div class="item-block"><p class="item-label">收货人电话:</p><p class="item-value">{{ detailInfo.receiverPhone }}</p></div>
          <div class="item-block"><p class="item-label">备注:</p><p class="item-value">{{ detailInfo.remark }}</p></div>
          <div class="item-block"><p class="item-label">订单状态:</p><p class="item-value">{{ detailInfo.orderStatus }}</p></div>
          <div class="item-block wide"><p class="item-label">收货地址:</p><p class="item-value">{{ detailInfo.receiveAddress }}</p></div>
        </div>
      </section>

      <section class="section">
        <ElTabs v-model="activeTab">
          <ElTabPane label="溯源路径" name="path">
            <div v-if="traceRows.length" class="trace-path">
              <div v-for="(item, index) in traceRows" :key="index" class="path-row">
                <div class="path-dot-wrap">
                  <span class="path-dot"></span>
                  <span v-if="index !== traceRows.length - 1" class="path-line"></span>
                </div>
                <div class="path-content">
                  <p class="path-title">{{ item.operationLabel }} {{ item.time }}</p>
                  <p class="path-order">操作人：（{{ item.operatorName }}）</p>
                  <p class="path-desc">订单状态变更为：（{{ item.statusLabel }}）</p>
                </div>
              </div>
            </div>
            <ElEmpty v-else description="暂无数据" />
          </ElTabPane>

          <ElTabPane label="商品信息" name="goods">
            <ElTable :data="goodsRows" height="100%" table-layout="fixed" scrollbar-always-on>
              <ElTableColumn label="商品名称" prop="goodsName" min-width="180" show-overflow-tooltip />
              <ElTableColumn label="ID" prop="goodsId" min-width="90" />
              <ElTableColumn label="规格" prop="spec" min-width="140" show-overflow-tooltip />
              <ElTableColumn label="价格" prop="price" min-width="90" />
              <ElTableColumn label="下单数量" prop="orderQuantity" min-width="110" />
              <ElTableColumn label="发货数量" prop="shipQuantity" min-width="110" />
              <ElTableColumn label="收货数量" prop="receiveQuantity" min-width="110" />
              <ElTableColumn label="小计" prop="subtotal" min-width="90" />
            </ElTable>
          </ElTabPane>

          <ElTabPane label="检测报告" name="report">
            <ElTable :data="reportRows" height="100%" table-layout="fixed" scrollbar-always-on>
              <ElTableColumn label="批次号" prop="batchNo" min-width="140" show-overflow-tooltip />
              <ElTableColumn label="上传范围" prop="scopeType" min-width="100" />
              <ElTableColumn label="更新时间" prop="updateTime" min-width="170" />
              <ElTableColumn label="配送商名称" prop="providerName" min-width="180" show-overflow-tooltip />
              <ElTableColumn label="报告类型" prop="reportType" min-width="120" />
              <ElTableColumn label="上传人名称" prop="uploader" min-width="120" />
              <ElTableColumn label="关联对象" prop="relatedGoods" min-width="160" show-overflow-tooltip />
              <ElTableColumn label="销售时间" prop="saleTime" min-width="220" show-overflow-tooltip />
              <ElTableColumn label="附件" prop="fileCount" min-width="70" />
              <ElTableColumn label="操作" min-width="100" fixed="right">
                <template #default="{ row }">
                  <ElButton link type="primary" :disabled="!row.downloadUrl" @click="openFile(row.downloadUrl)">查看</ElButton>
                </template>
              </ElTableColumn>
            </ElTable>
          </ElTabPane>

          <ElTabPane label="司机信息" name="driver">
            <div class="driver-fulfillment-panel">
              <div v-if="!hasDriverFulfillmentData" class="driver-empty-state">暂无司机履约信息</div>
              <template v-else>
                <div class="driver-info-grid">
                  <div v-for="item in driverInfoList" :key="item.label" class="driver-info-item">
                    <div class="driver-info-label">{{ item.label }}</div>
                    <div class="driver-info-value">{{ item.value }}</div>
                  </div>
                </div>

                <div class="driver-progress-wrap">
                  <div v-for="(node, index) in driverProgress" :key="node.code" class="driver-progress-item">
                    <div class="driver-progress-dot" :class="progressClassMap[getProgressState(index)]"></div>
                    <div class="driver-progress-content">
                      <div class="driver-progress-label">
                        {{ node.label }}
                        <span class="driver-progress-tag" :class="progressClassMap[getProgressState(index)]">
                          {{ progressLabelMap[getProgressState(index)] }}
                        </span>
                      </div>
                      <div class="driver-progress-time">{{ formatDateTime(node.time) }}</div>
                    </div>
                  </div>
                </div>

                <div class="driver-image-group-wrap">
                  <div v-for="group in driverImageGroups" :key="group.key" class="driver-image-group">
                    <div class="driver-image-group-title">{{ group.label }}（{{ group.urls.length }}）</div>
                    <div v-if="group.urls.length" class="driver-image-list">
                      <ElImage
                        v-for="(url, index) in group.urls"
                        :key="`${group.key}-${index}`"
                        :src="url"
                        fit="cover"
                        :preview-src-list="group.urls"
                        preview-teleported
                        class="driver-image"
                      />
                    </div>
                    <div v-else class="driver-image-empty">暂无图片（支持多张）</div>
                  </div>
                </div>
              </template>
            </div>
          </ElTabPane>

          <ElTabPane label="配送商信息" name="provider">
            <ElTable :data="providerRows" height="100%" table-layout="fixed">
              <ElTableColumn label="配送商名称" prop="providerName" min-width="180" show-overflow-tooltip />
              <ElTableColumn label="联系方式" prop="phone" min-width="140" />
              <ElTableColumn label="地址" prop="address" min-width="320" show-overflow-tooltip />
            </ElTable>
          </ElTabPane>
        </ElTabs>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Back } from "@element-plus/icons-vue";
import {
  apiOpenTraceabilityDriverFulfillment,
  apiOpenTraceabilityRecordDetail,
  apiOpenTraceabilityReports,
} from "@/api/warehouse";

const TRACEABILITY_DETAIL_CACHE_KEY = "delivery-provider-traceability-detail-cache";
const Router = useRouter();
const route = useRoute();
const loading = ref(false);
const activeTab = ref("path");
const record = ref<Obj | null>(null);
const reportList = ref<Obj[]>([]);
const driverFulfillment = ref<Obj | null>(null);
const orderNo = computed(() => String(route.query.id || ""));

const cachedOrder = (() => {
  try {
    const raw = sessionStorage.getItem(TRACEABILITY_DETAIL_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

const formatDateTime = (value: string | null | undefined) => (value ? String(value).replace("T", " ").slice(0, 19) : "--");
const mapOrderStatus = (status: string | null | undefined) => {
  const map: Obj = {
    pending_confirm: "待接单",
    accepted: "已接单",
    pending_driver_confirm: "待司机确认运输",
    in_transit: "运输中",
    shipped: "待签收",
    pending_review: "待确认",
    completed: "已完成",
    signed: "已完成",
    cancelled: "已取消",
  };
  return map[status || ""] || "--";
};

const detailInfo = computed(() => {
  const current = record.value;
  return {
    orderNo: current?.order_no || current?.batch_no || cachedOrder?.orderNo || orderNo.value || "--",
    orderTime: formatDateTime(current?.placed_at),
    receiveTime: formatDateTime(current?.received_at),
    payType: current?.payment_method || "--",
    orderStatus: mapOrderStatus(current?.order_status),
    buyerName: current?.buyer_name || current?.school_name || cachedOrder?.schoolName || "--",
    receiverName: current?.receiver_name || "--",
    buyerPhone: current?.buyer_phone || "--",
    receiverPhone: current?.receiver_phone || "--",
    providerPhone: current?.distributor_phone || "--",
    shipAddress: current?.ship_from_address || "--",
    receiveAddress: current?.ship_to_address || "--",
    remark: current?.remark || "--",
  };
});

const traceRows = computed(() =>
  (record.value?.nodes || []).map((node: Obj) => {
    const desc = String(node.description || "").trim();
    const statusPrefix = "订单状态变更为：";
    const statusLabel = desc.startsWith(statusPrefix)
      ? desc.slice(statusPrefix.length).trim() || "--"
      : mapOrderStatus(record.value?.order_status);
    return {
      operationLabel: node.title || "订单状态更新",
      time: formatDateTime(node.occurred_at || node.created_at),
      operatorName: String(node.operator_name || "").trim() || "--",
      statusLabel: statusLabel || "--",
    };
  })
);

const goodsRows = computed(() =>
  (record.value?.traceability_items || []).map((item: Obj) => ({
    raw: item,
    goodsName: item.product_name || "--",
    goodsId: item.product_id_snapshot || "--",
    spec: item.spec_name || "--",
    price: item.unit_price || "0.00",
    orderQuantity: item.ordered_quantity || "0",
    shipQuantity: item.shipped_quantity || "0",
    receiveQuantity: item.received_quantity || "0",
    subtotal: item.subtotal || "0.00",
  }))
);

const mapReportFiles = (item: Obj) => {
  const files = (Array.isArray(item.files) ? item.files : [])
    .map((file: Obj, index: number) => ({
      key: `${item.id}-${file?.id || index}-${file?.file_url || item.report_url}`,
      url: file?.file_url || item.report_url || "",
    }))
    .filter((file: Obj) => file.url);
  if (files.length || !item.report_url) return files;
  return [{ key: `${item.id}-fallback`, url: item.report_url }];
};

const reportRows = computed(() => {
  const reportTypeMap: Obj = { image: "图片", document: "文档" };
  const targetTypeMap: Obj = { supplier: "供应商", category: "分类", product: "商品" };
  return reportList.value.map(item => {
    const files = mapReportFiles(item);
    const saleStart = formatDateTime(item.sale_start_at);
    const saleEnd = formatDateTime(item.sale_end_at);
    return {
      id: item.id,
      batchNo: item.batch_no || `REPORT-${item.id}`,
      scopeType: targetTypeMap[item.target_type || ""] || item.target_type_display || "--",
      updateTime: formatDateTime(item.updated_at || item.created_at),
      providerName: item.distributor_name || record.value?.distributor_name || cachedOrder?.providerName || "--",
      reportType: reportTypeMap[item.report_type] || "--",
      uploader: item.uploaded_by_name || "--",
      relatedGoods: item.related_scope_name || item.related_goods_name || "--",
      saleTime: item.sale_start_at || item.sale_end_at ? `${saleStart} 至 ${saleEnd}` : "长期有效",
      fileCount: item.file_count ?? files.length,
      downloadUrl: files[0]?.url || "",
    };
  });
});

const providerRows = computed(() => [
  {
    providerName: record.value?.distributor_name || cachedOrder?.providerName || "--",
    phone: record.value?.distributor_phone || "--",
    address: record.value?.distributor_address || record.value?.ship_from_address || "--",
  },
]);

const progressClassMap = {
  done: "done",
  current: "current",
  pending: "pending",
} as const;

const progressLabelMap = {
  done: "已完成",
  current: "进行中",
  pending: "待完成",
} as const;

const driverInfoList = computed(() => {
  const binding = driverFulfillment.value?.driver_binding;
  return [
    { label: "司机姓名", value: binding?.driver_name || "-" },
    { label: "司机电话", value: binding?.driver_phone || "-" },
    { label: "车牌号", value: binding?.vehicle_plate || "-" },
  ];
});

const driverProgress = computed(() => {
  const progress = driverFulfillment.value?.progress || [];
  const assigned = progress.find((item: Obj) => item.code === "driver_assigned");
  const transportConfirmed = progress.find((item: Obj) => item.code === "transport_confirmed");
  const deliveredConfirmed = progress.find((item: Obj) => item.code === "delivered_confirmed");

  return [
    {
      code: "driver_assigned",
      label: "已分配司机",
      time: assigned?.time || null,
      done: Boolean(assigned?.done || assigned?.time),
    },
    {
      code: "pending_driver_confirm",
      label: "待司机确认运输",
      time: transportConfirmed?.done ? transportConfirmed?.time || null : null,
      done: Boolean(transportConfirmed?.done),
    },
    {
      code: "in_transit",
      label: "司机运输中",
      time: transportConfirmed?.time || null,
      done: Boolean(deliveredConfirmed?.done),
    },
    {
      code: "delivered_confirmed",
      label: "司机已确认送达",
      time: deliveredConfirmed?.time || null,
      done: Boolean(deliveredConfirmed?.done),
    },
  ];
});

const driverImageGroups = computed(() => {
  const images = driverFulfillment.value?.images;
  return [
    { key: "vehicle", label: "车辆图片", urls: images?.vehicle || [] },
    { key: "plate", label: "车牌号图片", urls: images?.plate || [] },
    { key: "driver_selfie", label: "司机图片", urls: images?.driver_selfie || [] },
    { key: "carriage", label: "车厢图片", urls: images?.carriage || [] },
    { key: "delivery", label: "送达图片", urls: images?.delivery || [] },
  ];
});

const hasDriverFulfillmentData = computed(() => {
  const binding = driverFulfillment.value?.driver_binding;
  const hasBinding = Boolean(binding?.driver_name || binding?.driver_phone || binding?.vehicle_plate);
  const hasProgress = driverProgress.value.some((node: Obj) => Boolean(node.done || node.time));
  const hasImages = driverImageGroups.value.some((group: Obj) => group.urls.length > 0);
  return hasBinding || hasProgress || hasImages;
});

const firstPendingProgressIndex = computed(() => driverProgress.value.findIndex((node: Obj) => !node.done));

const getProgressState = (index: number): "done" | "current" | "pending" => {
  const node = driverProgress.value[index];
  if (!node) return "pending";
  if (node.done) return "done";
  const pendingIndex = firstPendingProgressIndex.value;
  if (pendingIndex === -1) return "done";
  if (index === pendingIndex) return "current";
  return "pending";
};

const loadReports = async () => {
  const current = record.value;
  if (!current) return;
  const productIds = (current.traceability_items || [])
    .map((item: Obj) => Number(item.product_id_snapshot))
    .filter((id: number) => Number.isFinite(id) && id > 0);
  if (current.product && !productIds.includes(current.product)) {
    productIds.push(current.product);
  }
  const { success, data, message } = await apiOpenTraceabilityReports({
    page: 1,
    page_size: 100,
    product_ids: productIds.length ? productIds.join(",") : undefined,
    product: productIds.length ? undefined : current.product || undefined,
    order_item: current.order_item ? String(current.order_item) : undefined,
    match_at: current.placed_at || undefined,
    status: "valid",
  });
  if (!success) {
    ElMessage.warning(message || "获取检测报告失败");
    return;
  }
  reportList.value = data?.results || data?.list || [];
};

const loadDriverFulfillment = async () => {
  if (!record.value?.order) {
    driverFulfillment.value = null;
    return;
  }
  const { success, data, message } = await apiOpenTraceabilityDriverFulfillment({
    order_id: String(record.value.order),
  });
  if (!success) {
    ElMessage.warning(message || "获取司机信息失败");
    driverFulfillment.value = null;
    return;
  }
  driverFulfillment.value = data || null;
};

const loadDetail = async () => {
  if (!orderNo.value) return;
  loading.value = true;
  try {
    const { success, data, message } = await apiOpenTraceabilityRecordDetail({ order_sn: orderNo.value });
    if (!success) {
      ElMessage.warning(message || "获取溯源详情失败");
      return;
    }
    record.value = data || null;
    await Promise.all([loadReports(), loadDriverFulfillment()]);
  } finally {
    loading.value = false;
  }
};

const openFile = (url: string) => {
  if (!url) return;
  window.open(url, "_blank");
};

const onBack = () => {
  Router.push({ path: "/sourceMange" });
};

onMounted(loadDetail);
</script>

<style lang="scss" scoped>
.trace-detail {
  gap: 12px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: none;
  padding: 12px 14px;
  background: var(--el-color-white);
  border-radius: var(--radius-lg);
}

.title {
  color: #111827;
  font-size: 16px;
  font-weight: 700;
}

.sub-title {
  margin-top: 4px;
  color: #6b7280;
  font-size: 13px;
}

.detail-body {
  overflow: auto;
  flex: auto;
  min-height: 0;
}

.section {
  margin-bottom: 12px;
  padding: 14px;
  background: var(--el-color-white);
  border-radius: var(--radius-lg);
}

.section-title {
  margin-bottom: 16px;
  color: #111827;
  font-size: 20px;
  font-weight: 700;
}

.base-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(180px, 1fr));
  gap: 12px 20px;
}

.item-block {
  min-width: 0;
}

.item-block.wide {
  grid-column: span 2;
}

.item-label {
  margin: 0 0 8px;
  color: #6b7280;
  font-size: 13px;
}

.item-value {
  margin: 0;
  color: #475569;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-all;
}

:deep(.el-tabs__content) {
  height: 420px;
}

:deep(.el-tab-pane) {
  height: 100%;
}

.trace-path {
  padding: 2px 0 0 10px;
}

.path-row {
  display: flex;
  gap: 12px;
}

.path-dot-wrap {
  position: relative;
  display: flex;
  justify-content: center;
  width: 14px;
  flex: none;
}

.path-dot {
  width: 9px;
  height: 9px;
  margin-top: 5px;
  border-radius: 50%;
  background: var(--el-color-primary);
}

.path-line {
  position: absolute;
  top: 18px;
  bottom: 0;
  width: 1px;
  background: #d8dce6;
}

.path-content {
  padding-bottom: 18px;
}

.path-title,
.path-order,
.path-desc {
  margin: 0 0 6px;
  color: #475569;
  font-size: 14px;
}

.driver-empty-state {
  border: 1px dashed #cbd5e1;
  border-radius: 6px;
  padding: 20px 12px;
  text-align: center;
  color: #94a3b8;
}

.driver-info-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.driver-info-item {
  padding: 10px 12px;
  border: 1px solid #eef2f7;
  border-radius: 6px;
}

.driver-info-label {
  margin-bottom: 6px;
  color: #64748b;
}

.driver-info-value {
  color: #1f2937;
}

.driver-progress-wrap {
  margin-top: 14px;
  border: 1px solid #eef2f7;
  border-radius: 6px;
  padding: 12px;
}

.driver-progress-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
}

.driver-progress-item:last-child {
  margin-bottom: 0;
}

.driver-progress-dot {
  margin-top: 6px;
  width: 10px;
  height: 10px;
  border: 2px solid #cbd5e1;
  border-radius: 50%;
  background: #fff;
}

.driver-progress-dot.done {
  border-color: var(--el-color-success);
  background: var(--el-color-success);
}

.driver-progress-dot.current {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary);
}

.driver-progress-dot.pending {
  border-color: #cbd5e1;
  background: #fff;
}

.driver-progress-label {
  color: #1f2937;
  font-weight: 600;
}

.driver-progress-tag {
  margin-left: 8px;
  padding: 1px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.driver-progress-tag.done {
  color: #059669;
  background: #ecfdf5;
}

.driver-progress-tag.current {
  color: #2563eb;
  background: #eff6ff;
}

.driver-progress-tag.pending {
  color: #64748b;
  background: #f1f5f9;
}

.driver-progress-time {
  margin-top: 4px;
  color: #64748b;
  font-size: 13px;
}

.driver-image-group-wrap {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.driver-image-group {
  border: 1px solid #eef2f7;
  border-radius: 6px;
  padding: 10px;
}

.driver-image-group-title {
  margin-bottom: 8px;
  color: #334155;
  font-weight: 600;
}

.driver-image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.driver-image {
  width: 110px;
  height: 84px;
  border-radius: 4px;
}

.driver-image-empty {
  color: #94a3b8;
  font-size: 13px;
}

@media (max-width: 1100px) {
  .base-grid {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
  }
}

@media (max-width: 960px) {
  .driver-info-grid,
  .driver-image-group-wrap {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
</style>
