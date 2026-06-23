<template>
  <div class="submit-container" v-loading="loading" element-loading-text="数据加载中">
    <div class="submit-left"><ElButton @click="onBack" type="info" plain :icon="Back">返回</ElButton></div>
    <div class="layout-table">
      <div class="query-container">
        <div class="query-left">
          <ElForm><ElFormItem label="食材名称" prop="name">
              <ElInput
                v-model="tableModel.query.name"
                maxlength="30"
                show-word-limit
                clearable
                placeholder="食材名称"
              ></ElInput>
            </ElFormItem>
          </ElForm>
        </div>
        <div class="query-right">
          <ElButton type="primary" @click="onTableRequest">查询</ElButton>
          <ElButton type="info" plain @click="onReset">重置</ElButton>
          <ElButton plain @click="onExport">导出</ElButton>
        </div>
      </div>
      <div class="table-container">
        <ElTable height="100%" default-expand-all scrollbar-always-on :data="pageData"><ElTableColumn type="expand">
            <template #default="props">
              <ElTable :data="props.row.dishes" default-expand-all>
                <ElTableColumn type="expand">
                  <template #default="dishProps">
                    <ElTable :data="dishProps.row.ingredients">
                      <ElTableColumn
                        label="食材名称"
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
                      <ElTableColumn label="库存量" prop="count" min-width="100" align="center" show-overflow-tooltip>
                        <template #default="scope">
                          {{ _utils.KtoJ(scope.row?.count || 0, scope.row?.measure_type) }}
                        </template>
                      </ElTableColumn>
                      <ElTableColumn label="食材所需数量" prop="need_count" min-width="120" align="center" show-overflow-tooltip>
                        <template #default="scope">
                          {{ _utils.KtoJ(scope.row?.need_count || 0, scope.row?.measure_type) }}
                        </template>
                      </ElTableColumn>
                      <ElTableColumn label="推荐采购数量" prop="order_count" min-width="120" align="center" show-overflow-tooltip>
                        <template #default="scope">
                          {{ _utils.KtoJ(scope.row?.order_count || 0, scope.row?.measure_type) }}
                        </template>
                      </ElTableColumn>
                    </ElTable>
                  </template>
                </ElTableColumn>
                <ElTableColumn
                  label="菜品名称"
                  prop="dish_name"
                  min-width="150"
                  align="center"
                  show-overflow-tooltip
                ></ElTableColumn>
                <ElTableColumn
                  label="食材用量"
                  prop="ingredient_usage"
                  min-width="220"
                  align="center"
                  show-overflow-tooltip
                ></ElTableColumn>
                <ElTableColumn
                  label="准备份数"
                  prop="prepare_count"
                  min-width="100"
                  align="center"
                  show-overflow-tooltip
                ></ElTableColumn>
              </ElTable>
            </template>
          </ElTableColumn>
          <ElTableColumn
            label="日期"
            prop="date"
            min-width="100"
            align="center"
            show-overflow-tooltip
          ></ElTableColumn>
          <ElTableColumn label="星期" prop="week" min-width="100" align="center" show-overflow-tooltip></ElTableColumn>
        </ElTable>
      </div>
    </div>
  </div>
  <IProgress
    v-if="progressData.DialogVisible"
    :id="progressData.id"
    :fileName="'采购量推荐数据'"
    @close="progressData.DialogVisible = false"
  ></IProgress>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import _utils from "@/utils/index";
import { apiCanteenPurchaseSuggestionDetail, apiCanteenPurchaseSuggestionExport } from "@/api/recipe";
import type { ElButton } from "element-plus";
import { useRouter, useRoute } from "vue-router";
import { Message } from "@/global/const";
import { useRecommendationAuxStore } from "@/views/CanteenManagement/sub_views/Recommendation/aux_modules/store";
import { Back } from "@element-plus/icons-vue";
const router = useRouter();
const route = useRoute();
const RecommendationAuxStore = useRecommendationAuxStore();
const loading = ref(false);
const pageData = ref<Obj[]>([]);
const tableModel = reactive({
  query: {
    name: "",
  },
});
/** 查询 */
const onTableRequest = async () => {
  loading.value = true;
  const params: Obj = { name: tableModel.query.name, id: route.query.id || "" };
  const { success, message, data } = await apiCanteenPurchaseSuggestionDetail(params);
  if (success) {
    pageData.value = formatDayItems(data.day_items || data.suggestion);
  } else {
    console.error("查询失败:", message);
  }
  loading.value = false;
};
onTableRequest();

const formatDayItems = (source: Obj[]) => {
  const arr = _utils.getDefaultArray(source);
  if (arr.some(item => Array.isArray(item.dishes))) {
    return arr.map(item => ({
      ...item,
      date: item.date || item.meal_date || "",
      week: item.week || getWeekText(item.date || item.meal_date || ""),
      dishes: _utils.getDefaultArray(item.dishes),
    }));
  }
  return groupArrByDate(arr);
};

const groupArrByDate = (arr: Obj[]) => {
  const dayMap = new Map();
  arr.forEach(item => {
    const date = item.date || item.meal_date || "";
    if (!dayMap.has(date)) {
      dayMap.set(date, {
        date,
        week: item.week || getWeekText(date),
        dishes: [],
      });
    }
    const key = item.dish_id || item.dish_name || item.pro_name;
    let dish = dayMap.get(date).dishes.find((dishItem: Obj) => (dishItem.dish_id || dishItem.dish_name) === key);
    if (!dish) {
      dish = {
        dish_id: item.dish_id || key,
        dish_name: item.dish_name || item.pro_name,
        prepare_count: item.prepare_count || 0,
        ingredient_usage: item.usage_text || "",
        ingredients: [],
      };
      dayMap.get(date).dishes.push(dish);
    }
    dish.ingredients.push(item);
  });
  return Array.from(dayMap.values());
};

const getWeekText = (date: string) => {
  if (!date) return "";
  const day = new Date(date).getDay();
  return _utils.weekDays[day] || "";
};

/** 重置 */
const onReset = () => {
  tableModel.query.name = "";
  onTableRequest();
};
const onBack = () => {
  router.push({ name: "recommendation" });
};

/** 查询任务状态 */
const progressData = reactive<Obj>({
  DialogVisible: false,
  id: "",
});
/** 导出 */
const onExport = async () => {
  const { success, data, message } = await apiCanteenPurchaseSuggestionExport({ id: route.query.id || "" });
  if (success) {
    progressData.DialogVisible = true;
    progressData.id = data.task_id;
    // _utils.downloadFile(data, "入库记录.xlsx");
  } else {
    Message.warning(message);
  }
};

</script>

<style lang="scss" scoped>
.example-showcase .el-loading-mask {
  z-index: 9;
}
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
}
</style>

