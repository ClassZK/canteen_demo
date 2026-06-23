<template>
  <div class="recipe-week-header">
    <div class="title">
      <ElButton icon="back" @click="onBack">返回</ElButton>
      <p>食谱详情</p>
    </div>
  </div>
  <div class="recipe-week-edit" v-loading="detailModel.vLoading" element-loading-text="数据加载中">
    <div class="recipe-name">{{ recipeModel.checked.name }}</div>
    <div class="recipe-time">{{ recipeModel.weekRange }}</div>
    <RecipeWeekDisplay :data="recipeModel.data" :mealtimes="recipeModel.mealtimes"></RecipeWeekDisplay>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Message } from "@/global/const";
import { apiRecipeDetail } from "@/api/recipe";
import { onRecipeWeekDataFilter } from "@/views/CanteenManagement/sub_views/RecipeWeek/aux_modules/const";
import RecipeWeekDisplay from "@/views/CanteenManagement/sub_views/RecipeWeek/sub_modules/RecipeWeekDisplay.vue";

const route = useRoute();
const router = useRouter();

const detailModel = reactive({
  vLoading: false,
});
const recipeModel = reactive<{
  weekRange: string;
  checked: Obj;
  data: Obj;
  mealtimes: Obj[];
}>({
  weekRange: "",
  checked: {},
  data: {},
  mealtimes: [],
});

const getApiRecipeDetail = async () => {
  detailModel.vLoading = true;
  const { success, data, message } = await apiRecipeDetail({ id: route.query.id || "" });
  if (success) {
    const recipeWeekData = onRecipeWeekDataFilter(data);
    recipeModel.checked = recipeWeekData.weekChecked;
    recipeModel.data = recipeWeekData.weekData;
    recipeModel.mealtimes = recipeWeekData.weekMealtimes;
    recipeModel.weekRange = `${recipeModel.checked.weekStart} ~ ${recipeModel.checked.weekEnd}`;
  } else {
    Message.warning(message);
  }
  detailModel.vLoading = false;
};
getApiRecipeDetail();

const onBack = () => {
  router.push({ name: "recipeWeekRecord" });
};
</script>

<style lang="scss" scoped>
.recipe-week-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--gap);
  padding: var(--gap);
  background: var(--el-color-white);
  border-radius: var(--radius-lg);
  .title {
    display: flex;
    align-items: center;
    p {
      margin-left: var(--gap);
    }
  }
}
</style>
