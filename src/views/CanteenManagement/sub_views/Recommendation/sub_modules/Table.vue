<template>
  <div class="layout-table" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
    <div class="query-container">
      <div class="query-left">
        <ElForm ref="formRef" :model="tableModel.query">
          <IPlatformOrgFilter></IPlatformOrgFilter>
          <ElFormItem label="食谱名称" prop="recipe_name">
            <ElInput
              v-model="tableModel.query.recipe_name"
              maxlength="30"
              show-word-limit
              clearable
              placeholder="食谱名称"
            ></ElInput>
          </ElFormItem>
          <ElFormItem label="时间" prop="meal_time">
            <ElDatePicker
              v-model="tableModel.query.meal_time"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择日期"
            ></ElDatePicker>
          </ElFormItem>
        </ElForm>
      </div>
      <div class="query-right">
        <ElButton type="primary" @click="onTableAdd">新增</ElButton>
        <ElButton type="primary" @click="onTableSearch">查询</ElButton>
        <ElButton class="gray" @click="onTableReset">重置</ElButton>
      </div>
    </div>
    <div class="table-container">
      <ElTable height="100%" scrollbar-always-on :data="tableModel.data">
        <IPlatformOrgColumn></IPlatformOrgColumn>
        <ElTableColumn label="食谱名称" prop="recipe_name" min-width="180" align="center" show-overflow-tooltip></ElTableColumn>
        <ElTableColumn label="日期" prop="meal_time" min-width="150" align="center" show-overflow-tooltip></ElTableColumn>
        <ElTableColumn label="餐次人数" prop="meal_info" min-width="190" align="center" show-overflow-tooltip>
          <template #default="scope">
            <div class="meal-info" v-text="getMealInfo(scope.row.meal_info)"></div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="创建时间" prop="created_at" min-width="160" align="center" show-overflow-tooltip></ElTableColumn>
        <ElTableColumn fixed="right" label="操作" width="220" align="center">
          <template #default="scope">
            <div class="handle">
              <ElButton type="success" link @click="onTableDownload(scope.row)">下载</ElButton>
              <ElButton type="primary" link @click="onTableDetail(scope.row)">详情</ElButton>
              <ElButton type="warning" link @click="onNextDayOrder(scope.row)">次日下单</ElButton>
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
  <IProgress
    v-if="progressData.DialogVisible"
    :id="progressData.id"
    :fileName="'采购量推荐数据'"
    @close="progressData.DialogVisible = false"
  ></IProgress>
  <ElDialog
    v-model="nextDayDialog.visible"
    title="次日下单"
    width="1100px"
    class="dialog-container dialog-table"
    modal-class="dialog-overlay-custom"
    append-to-body
    draggable
    destroy-on-close
    :close-on-click-modal="false"
  >
    <div class="layout-table next-day-table" v-loading="nextDayDialog.loading" element-loading-text="数据加载中">
      <ElTable height="100%" scrollbar-always-on default-expand-all :data="nextDayDialog.data">
        <ElTableColumn type="expand">
          <template #default="dishProps">
            <ElTable :data="dishProps.row.ingredients">
              <ElTableColumn label="食材名称" prop="pro_name" min-width="130" align="center" show-overflow-tooltip></ElTableColumn>
              <ElTableColumn label="食材编码" prop="pro_no" min-width="130" align="center" show-overflow-tooltip></ElTableColumn>
              <ElTableColumn label="规格" prop="specification" min-width="110" align="center" show-overflow-tooltip></ElTableColumn>
              <ElTableColumn label="单位" prop="unit" min-width="90" align="center" show-overflow-tooltip></ElTableColumn>
              <ElTableColumn label="库存量" prop="count" min-width="100" align="center" show-overflow-tooltip>
                <template #default="scope">{{ _utils.KtoJ(scope.row.count || 0, scope.row.measure_type) }}</template>
              </ElTableColumn>
              <ElTableColumn label="食材所需数量" prop="need_count" min-width="130" align="center" show-overflow-tooltip>
                <template #default="scope">{{ _utils.KtoJ(scope.row.need_count || 0, scope.row.measure_type) }}</template>
              </ElTableColumn>
              <ElTableColumn label="推荐采购数量" prop="order_count" min-width="150" align="center">
                <template #default="scope">
                  <ElInputNumber
                    v-model="scope.row.order_count"
                    :precision="scope.row.measure_type === 1 ? 2 : 0"
                    :min="0"
                    :max="10000"
                    :step="1"
                  ></ElInputNumber>
                </template>
              </ElTableColumn>
            </ElTable>
          </template>
        </ElTableColumn>
        <ElTableColumn label="菜品名称" prop="dish_name" min-width="160" align="center" show-overflow-tooltip></ElTableColumn>
        <ElTableColumn label="食材用量" prop="ingredient_usage" min-width="260" align="center" show-overflow-tooltip></ElTableColumn>
        <ElTableColumn label="准备份数" prop="prepare_count" min-width="120" align="center" show-overflow-tooltip></ElTableColumn>
      </ElTable>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="nextDayDialog.visible = false">取消</ElButton>
        <ElButton type="primary" @click="onNextDayConfirm">确认</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script lang="ts" setup>
import { reactive, watch } from "vue";
import { useRouter } from "vue-router";
import { useRecommendationAuxStore } from "../aux_modules/store";
import { OperationTypeEnum, Message, MealtimeList } from "@/global/const";
import _utils from "@/utils/index";
import {
  apigetvolume,
  apiCanteenPurchaseSuggestionPageList,
  apiCanteenPurchaseSuggestionExport,
  apiCanteenPurchaseSuggestionDetail,
} from "@/api/recipe";

const router = useRouter();
const RecommendationAuxStore = useRecommendationAuxStore();

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
    recipe_name: "",
    meal_time: "",
  },
  total: 0,
  data: [],
});
const nextDayDialog = reactive({
  visible: false,
  loading: false,
  data: [] as Obj[],
});

const onTableRequest = async () => {
  tableModel.vLoading = true;
  const { success, data, message } = await apigetvolume(tableModel.query);
  if (success) {
    tableModel.data = _utils.getDefaultArray(data.list);
    tableModel.total = data.total;
  } else {
    Message.warning(message);
  }
  tableModel.vLoading = false;
};
onTableRequest();

const apiCanteenPurchase = async () => {
  const { success, data, message } = await apiCanteenPurchaseSuggestionPageList();
  if (success) {
    RecommendationAuxStore.$patch(state => {
      state.RecipeList = _utils.getDefaultArray(data.list);
    });
  } else {
    Message.warning(message);
  }
};
apiCanteenPurchase();

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
  tableModel.query.recipe_name = "";
  tableModel.query.meal_time = "";
  onTableSearch();
};
const onTableAdd = () => {
  RecommendationAuxStore.$patch(state => {
    state.OperationType = OperationTypeEnum.add;
  });
};

const onTableDetail = (data: Obj) => {
  router.push({
    name: "recommendationDetail",
    query: {
      id: data.id,
    },
  });
};

const onNextDayOrder = async (row: Obj) => {
  nextDayDialog.visible = true;
  nextDayDialog.loading = true;
  const { success, data, message } = await apiCanteenPurchaseSuggestionDetail({ id: row.id || "", next_day: true });
  if (success) {
    const nextDayItems = _utils.getDefaultArray(data.next_day_items);
    const list = nextDayItems.length > 0
      ? nextDayItems
      : _utils.getDefaultArray(data.day_items || data.suggestion).filter((item: Obj) => item.is_next_day || item.day_index === 1);
    nextDayDialog.data = formatNextDayDishes(list);
  } else {
    Message.warning(message);
  }
  nextDayDialog.loading = false;
};

const onNextDayConfirm = () => {
  nextDayDialog.visible = false;
  Message.success("已为您自动下单");
};

const formatNextDayDishes = (list: Obj[]) => {
  if (list.some(item => Array.isArray(item.dishes))) {
    return list.flatMap(item => _utils.getDefaultArray(item.dishes));
  }
  const dishMap = new Map();
  list.forEach(item => {
    const key = item.dish_id || item.dish_name || item.pro_name;
    if (!dishMap.has(key)) {
      dishMap.set(key, {
        dish_id: item.dish_id || key,
        dish_name: item.dish_name || item.pro_name,
        prepare_count: item.prepare_count || 0,
        ingredient_usage: item.usage_text || "",
        ingredients: [],
      });
    }
    dishMap.get(key).ingredients.push(item);
  });
  return Array.from(dishMap.values());
};

const getMealInfo = (mealInfo: Obj[]) => {
  if (!Array.isArray(mealInfo) || mealInfo.length === 0) {
    return "-";
  }
  return mealInfo.map(item => `${findMealtime(item.meal_type)}（${item.total}人）`).join("、");
};
const findMealtime = (mealTime: string) => {
  return MealtimeList.find(item => item.value === mealTime)?.name || "";
};

const progressData = reactive<Obj>({
  DialogVisible: false,
  id: "",
});
const onTableDownload = async (val: Obj) => {
  const { success, data, message } = await apiCanteenPurchaseSuggestionExport({ id: val.id || "" });
  if (success) {
    progressData.DialogVisible = true;
    progressData.id = data.task_id;
  } else {
    Message.warning(message);
  }
};

watch(
  () => RecommendationAuxStore.refresh,
  () => {
    onTableRequest();
  },
);
</script>

<style lang="scss" scoped>
.next-day-table {
  height: 460px;
}
</style>
