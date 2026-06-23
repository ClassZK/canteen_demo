<template>
  <div class="submit-container">
    <div class="submit-left"><ElButton @click="onBack" type="info" plain :icon="Back">返回</ElButton></div>
    <div class="layout-table">
      <div class="query-container">
        <div class="query-left"></div>
        <div class="query-right" v-if="!isFinished">
          <ElButton type="primary" v-if="!loading" @click="onSubmit">{{
            isError ? "重新提交并下单" : "提交并下单"
          }}</ElButton>
          <ElButton type="primary" v-else :loading="loading">订单提交中</ElButton>
        </div>
      </div>
      <div class="table-container">
        <ElTable
          height="100%"
          default-expand-all
          scrollbar-always-on
          :data="RecommendationAuxStore?.RecommendationDetail || []"
        ><ElTableColumn type="expand">
            <template #default="props">
              <ElTable :data="props.row.list">
                <ElTableColumn
                  label="材料名称"
                  prop="pro_name"
                  min-width="100"
                  align="center"
                  show-overflow-tooltip
                ></ElTableColumn>
                <ElTableColumn
                  label="食材编号"
                  prop="pro_no"
                  min-width="100"
                  align="center"
                  show-overflow-tooltip
                ></ElTableColumn>
                <ElTableColumn
                  label="规格"
                  prop="specification"
                  min-width="100"
                  align="center"
                  show-overflow-tooltip
                ></ElTableColumn>
                <ElTableColumn
                  label="单位"
                  prop="unit"
                  min-width="100"
                  align="center"
                  show-overflow-tooltip
                ></ElTableColumn>
                <ElTableColumn label="库存数量" prop="count" min-width="100" align="center" show-overflow-tooltip>
                  <template #default="scope"> {{ _utils.KtoJ(scope.row.count, scope.row.measure_type) }} </template>
                </ElTableColumn>
                <ElTableColumn label="采购数量" prop="order_count" min-width="100" align="center" show-overflow-tooltip>
                  <template #default="scope">
                    <ElInputNumber
                      v-model="scope.row.order_count"
                      :precision="scope.row.measure_type === 1 ? 2 : 0"
                      min="0"
                      max="10000"
                      step="1"
                    />
                  </template>
                </ElTableColumn>
              </ElTable>
            </template>
          </ElTableColumn>
          <ElTableColumn
            label="供应商名称"
            prop="supplier_name"
            min-width="100"
            align="center"
            show-overflow-tooltip
          ></ElTableColumn>
          <ElTableColumn label="状态" prop="status" min-width="100" align="center" show-overflow-tooltip>
            <template #default="scope">
              <span :class="'text-' + currentStatus(scope.row.supplier_id)?.status">
                {{ currentStatus(scope.row.supplier_id)?.text }}
              </span>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onBeforeMount, onUnmounted } from "vue";
import { useRecommendationAuxStore } from "../aux_modules/store";
import { Message } from "@/global/const";
import _utils from "@/utils/index";
import {
  apiCanteenPurchaseSuggestionSubmit,
  apiCanteenPurchaseSuggestionOrder,
  apiCanteenPurchaseSuggestionOrderStatus,
} from "@/api/recipe";
import type { ElButton } from "element-plus";
import { useRouter } from "vue-router";
import { Back } from "@element-plus/icons-vue";
import Storage from "tddev/storage";
const router = useRouter();
const RecommendationAuxStore = useRecommendationAuxStore();
const loading = ref(false);
const statusList = ref<Obj[]>([]);
const isError = ref(false);
const isFinished = ref(false);
onBeforeMount(() => {
  RecommendationAuxStore.RecommendationDetail = Storage.get("RecommendationDetail") || [];
});
// 提交
const onSubmit = async () => {
  const items = RecommendationAuxStore.RecommendationDetail.flatMap((item: Obj) => item.list).map((item: Obj) => ({
    ...item,
    order_count: _utils.JtoK(item.order_count, item.measure_type),
  }));
  loading.value = true;
  const params = {
    ...RecommendationAuxStore.RecipeInfo,
    details: items,
  };
  const { success, data, message } = await apiCanteenPurchaseSuggestionSubmit(params);
  if (success) {
    // onOrder(data.id);
    Orderall(data.id);
  } else {
    isError.value = true;
    loading.value = false;
    isFinished.value = false;
    Message.error(message);
  }
};
//根据商家分别下单
const Orderall = async (id: string) => {
  Promise.all(
    RecommendationAuxStore.RecommendationDetail.map(async (item: Obj) => {
      await onOrder(id, item.supplier_id);
    }),
  ).finally(() => {
    checkOrderStatus(id);
  });
};

/** 下单 */
const onOrder = async (id: string, supplier_id: string) => {
  const { success, message } = await apiCanteenPurchaseSuggestionOrder({ id, supplier_id });
  if (!success) {
    isError.value = true;
    loading.value = false;
    isFinished.value = false;
    Message.error(message);
  }
};

// 检查订单状态
const checkOrderStatus = async (id: string) => {
  const { success, data, message } = await apiCanteenPurchaseSuggestionOrderStatus({ id });
  if (success) {
    statusList.value = _utils.getDefaultArray(data?.list);
    const flag = statusList.value.some((item: Obj) => item.status === 0);
    isError.value = statusList.value.some((item: Obj) => item.status === 2);
    if (isError.value) {
      loading.value = false;
      isFinished.value = false;
      Message.error("订单下单失败");
      return;
    }
    if (flag && !isError.value) {
      setTimeout(() => checkOrderStatus(id), 3000);
    } else {
      Message.success("订单已成功下单");
      loading.value = false;
      isFinished.value = true;
    }
  } else {
    if (!isError.value) {
      setTimeout(() => checkOrderStatus(id), 3000);
    }
  }
};

// 当前状态
const currentStatus = (id: string): { text: string; status: number } => {
  if (!statusList.value.length || !id) return { text: "--", status: -1 };
  const item = statusList.value.find((item: Obj) => item.supplier_id === id);
  //  0-下单中 1-已下单 2-下单失败
  return { text: item?.status === 1 ? "已下单" : item?.status === 2 ? "下单失败" : "下单中", status: item?.status };
};

const onBack = () => {
  router.push({ name: "recommendation" });
};
onUnmounted(() => {
  Storage.remove("RecommendationDetail");
});
</script>

<style lang="scss" scoped>
.submit-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  .layout-table {
    flex: 1;
  }
  .submit-left {
    margin-bottom: 10px;
    background-color: #fff;
    padding: 12px;
  }
  .text-0 {
    color: #87888a;
  }
  .text-1 {
    color: #4ce67a;
  }
  .text-2 {
    color: #f56c6c;
  }
}
</style>

