import { request } from "@/utils/Http";

/** 首页总览聚合统计 */
export const apiHomeOverview = (): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/home/overview`,
    method: "POST",
  };
  return request(config);
};

/** 分页查询库存列表 */
export const apiWarehouseInventoryList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/inventory/list`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 分页查询二次确认 */
export const apiConfirmList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/page-confirm`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 分页查询待收货订单 */
export const apiOrderReceiptPendingPage = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/received/sfs/order/pending-receipt`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 分页查询已收货订单 */
export const apiOrderReceiptReceiptedPage = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/received/sfs/order/page-receipted`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 查询订单签收详情 */
export const apiOrderReceiptDetail = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/received/sfs/order/get-receipt-order-detail`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 保存订单签收草稿 */
export const apiOrderReceiptSaveDraft = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/received/sfs/order/submit-order-items-draft`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 提交订单签收 */
export const apiOrderReceiptSubmit = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/received/sfs/order/submit-order`,
    method: "POST",
    data,
  };
  return request(config);
};

// 分页查询溯源管理列表
export const apiSourceList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/page-order`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 获取批次列表 */
export const apiInventoryBatchList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/inventory/batch-list`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 获取批次历史 */
export const apiInventoryBatchHistoryList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/inventory/batch-history-list`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 获取批次详情 */
export const apiInventoryBatchInfo = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/inventory/batch-info`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 食材类型 */
export const apiInventoryCategoryList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/inventory/category`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 出库记录列表 */
export const apiInventoryOutrecordList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/inventory/outrecord-list`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 采购入库(手动) */
export const apiInventoryInhouse = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/inventory/inhouse`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 盘点 */
export const apiInventoryCheck = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/inventory/check`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 出库 */
export const apiInventoryOuthouse = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/inventory/outhouse`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 获取出入库记录列表 */
export const apiInventoryInOutList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/inventory/inoutrecord-list`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 获取盘点用户列表 */
export const apiInventoryCheckUserList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/inventory/check-list`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 获取盘点列表 */
export const apiInventoryCheckList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/inventory/checkinfo-list`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 入库统计 按日期汇总 */
export const apiInventoryInDateStatisticsList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/statistics/inventory-in-count-by-date`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 入库统计 按食材统计 */
export const apiInventoryInFoodStatisticsList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/statistics/inventory-in-count-by-food`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 入库统计 按供应商统计 */
export const apiInventoryInSupplierStatisticsList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/statistics/inventory-in-count-by-supplier`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 出库统计 按日期汇总 */
export const apiInventoryOutDateStatisticsList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/statistics/inventory-out-count-by-date`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 出库统计 按食材统计 */
export const apiInventoryOutFoodStatisticsList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/statistics/inventory-out-count-by-food`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 出库统计 按供应商统计 */
export const apiInventoryOutSupplierStatisticsList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/statistics/inventory-out-count-by-supplier`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 采购价格偏差 */
export const apiDeviationPriceStatisticsList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/statistics/purchase-price-deviation`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 按商品盘存汇总 */
export const apiStocktakeFoodStatisticsList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/statistics/stocktake-summary-byfood`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 按分类盘存汇总 */
export const apiStocktakeTypeStatisticsList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/statistics/stocktake-summary-bytype`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 获取过期预警 */
export const apiForewarningIngredientExpiredList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/warn/daily-expired-food`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 处理过期预警 */
export const apiForewarningIngredientExpiredHandle = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/warn/do-daily-expired-food`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 获取每日价格预警 */
export const apiForewarningDailyPriceList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/warn/daily-price-warn`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 处理每日价格预警 */
export const apiForewarningDailyPriceHandle = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/warn/do-daily-price-warn`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 获取每月价格预警 */
export const apiForewarningMonthPriceList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/warn/month-price-warn`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 处理每月价格预警 */
export const apiForewarningMonthPriceHandle = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/warn/do-month-price-warn`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 获取每月价格详情 */
export const apiForewarningMonthPriceDetail = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/warn/month-price-warninfo`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 分页查询预警督办 */
export const apiForewarningMonthPriceSupervisionList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/supervision/page-alarm`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 处理预警督办 */
export const apiForewarningMonthPriceSupervisionHandle = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/supervision/process-alarm`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 获取库存不足预警列表 */
export const apiWarehouseExpiredCountList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/warn/count-warn`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 获取即将到期已到期的的金额 */
export const apiWarehouseExpiredMoney = (): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/warn/expired-warn-money`,
    method: "POST",
  };
  return request(config);
};
/** 获取最近15天预警趋势 */
export const apiWarehouseInventoryTrend = (): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/warn/inventory-warn-trend`,
    method: "POST",
  };
  return request(config);
};

/** 获取打标签机列表 */
export const apiPrinterDeviceList = (): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/device/get-tag-device-list`,
    method: "POST",
  };
  return request(config);
};
/** 打印批次标签 */
export const apiInventoryLabelPrint = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/inventory/print-good-tag`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 导出出入库记录 */
export const apiInventoryLedgerExport = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/inventory/export-inout-record`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 导出库存盘点记录 */
export const apiInventoryCheckRecordExport = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/inventory/export-check-record`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 查询任务状态 */
export const apiTaskStatus = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/task/get-task-info`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 分页查询采购成本 */
export const apiPurchaseCostStatisticsList = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/procurementcosts/page`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 导出采购成本 */
export const apiPurchaseCostStatisticsExport = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/procurementcosts/export`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 查询待收货订单详情 */
export const apiConfirmListDetail = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/get-receipt-order-detail`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 二次确认订单 */
export const apiConfirmListHandle = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/confirm-order`,
    method: "POST",
    data,
  };
  return request(config);
};

/** 上架申请分页列表 */
export const apiShelvePage = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/shelve/page`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 上架申请详情 */
export const apiShelveDetail = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/shelve/detail`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 创建/编辑上架申请 */
export const apiShelveMerge = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/shelve/merge`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 删除上架申请 */
export const apiShelveDelete = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/shelve/delete`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 提交上架申请 */
export const apiShelveSubmit = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/shelve/submit`,
    method: "POST",
    data,
  };
  return request(config);
};
/** 刷新上架申请处理状态 */
export const apiShelveRefresh = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/shelve/refresh`,
    method: "POST",
    data,
  };
  return request(config);
};
// 提交订单条目
export const apiWarehouseOrderSubmitItem = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/submit-order-item`,
    method: "POST",
    data,
  };
  return request(config);
};

export const apiOpenTraceabilityRecordDetail = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/open/traceability/records/detail`,
    method: "POST",
    data,
  };
  return request(config);
};

export const apiOpenTraceabilityRecords = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/open/traceability/records`,
    method: "POST",
    data,
  };
  return request(config);
};

export const apiOpenTraceabilityDriverFulfillment = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/open/traceability/records/driver-fulfillment`,
    method: "POST",
    data,
  };
  return request(config);
};

export const apiOpenTraceabilityReports = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/open/traceability/reports`,
    method: "POST",
    data,
  };
  return request(config);
};

export const apiOpenReceivableBills = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/open/finance/receivable-bills`,
    method: "POST",
    data,
  };
  return request(config);
};

export const apiOpenReceivableBillDetail = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/open/finance/receivable-bills/detail`,
    method: "POST",
    data,
  };
  return request(config);
};

export const apiOpenReceivableBillReconciliation = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/open/finance/receivable-bills/reconciliation`,
    method: "POST",
    data,
  };
  return request(config);
};

export const apiOpenReceivableBillReconciliationComplete = (data: Obj): Promise<HttpResult> => {
  const config = {
    url: `/warehouse/sfs/warehouse/open/finance/receivable-bills/reconciliation/complete`,
    method: "POST",
    data,
  };
  return request(config);
};
