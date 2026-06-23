<template>
  <div class="layout-table" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
    <div class="query-container">
      <div class="query-left">
        <ElForm ref="formRef" :model="tableModel.query">
          
          <IPlatformOrgFilter></IPlatformOrgFilter><ElFormItem label="食谱名称" prop="recipe_name">
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
        
        <IPlatformOrgColumn></IPlatformOrgColumn><ElTableColumn
          label="食谱名称"
          prop="recipe_name"
          min-width="100"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn
          label="日期"
          prop="meal_time"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn label="餐次人数" prop="end_time" min-width="150" align="center" show-overflow-tooltip>
          <template #default="scope">
            <div class="meal-info" v-text="getMealInfo(scope.row.meal_info)"></div>
          </template>
        </ElTableColumn>
        <ElTableColumn
          label="创建时间"
          prop="created_at"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn fixed="right" label="操作" width="150" align="center">
          <template #default="scope">
            <div class="handle">
              <ElButton type="success" link @click="onTableDownload(scope.row)">下载</ElButton>
              <ElButton type="primary" link @click="onTableDetail(scope.row)">详情</ElButton>
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
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from "vue";
import { useRecommendationAuxStore } from "../aux_modules/store";
import { OperationTypeEnum, Message, MealtimeList } from "@/global/const";
import _utils from "@/utils/index";
import { apigetvolume, apiCanteenPurchaseSuggestionPageList, apiCanteenPurchaseSuggestionExport } from "@/api/recipe";
import type { ElButton } from "element-plus";
import { useRouter } from "vue-router";
const router = useRouter();
const RecommendationAuxStore = useRecommendationAuxStore();

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
    size: 20,
    recipe_name: "",
    meal_time: "",
  },
  total: 0,
  data: [],
});

/** 请求 */
const onTableRequest = async () => {
  tableModel.vLoading = true;
  const { success, data, message } = await apigetvolume(tableModel.query);
  if (success) {
    const list = _utils.getDefaultArray(data.list);
    tableModel.data = list;
    tableModel.total = data.total;
  } else {
    Message.warning(message);
  }
  tableModel.vLoading = false;
};
onTableRequest();
// 查询食谱列表
const apiCanteenPurchase = async () => {
  const { success, data, message } = await apiCanteenPurchaseSuggestionPageList();
  if (success) {
    const list = _utils.getDefaultArray(data.list);
    RecommendationAuxStore.$patch(state => {
      state.RecipeList = list;
    });
  } else {
    Message.warning(message);
  }
};
apiCanteenPurchase();
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
  tableModel.query.recipe_name = "";
  tableModel.query.meal_time = "";
  onTableSearch();
};
/** 新增 */
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

/** 格式化餐次人数 */
const getMealInfo = (mealInfo: Obj[]) => {
  if (!mealInfo || mealInfo.length === 0) {
    return "";
  }
  return mealInfo.map(item => `${findMealtime(item.meal_type)}（${item.total}人）`).join("、");
};
// 查找餐次
const findMealtime = (mealTime: string) => {
  return MealtimeList.find(item => item.value === mealTime)?.name || "";
};
/** 查询任务状态 */
const progressData = reactive<Obj>({
  DialogVisible: false,
  id: "",
});
// 下载食谱
const onTableDownload = async (val: Obj) => {
  const { success, data, message } = await apiCanteenPurchaseSuggestionExport({ id: val.id || "" });
  if (success) {
    progressData.DialogVisible = true;
    progressData.id = data.task_id;
    // _utils.downloadFile(data, "入库记录.xlsx");
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

<style lang="scss" scoped></style>
