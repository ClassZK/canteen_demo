<template>
  <div class="recipe-week">
    <div class="tabs-container" v-loading="tabsModel.vLoading">
      <ElTabs v-model="tabsModel.active" @tab-change="onTabsChange">
        <ElTabPane v-for="item of tabsModel.data" :key="item.id" :name="item.id" :label="item.object_name"></ElTabPane>
      </ElTabs>
      <ElButton class="tabs-edit" type="primary" @click="onRecipeUserUpdate">
        {{ tabsModel.active ? "编辑" : "新增" }}配餐对象
      </ElButton>
    </div>
    <div class="recipe-week-edit" v-loading="recipeModel.vLoading" element-loading-text="数据加载中">
      <div v-if="tabsModel.active" class="recipe-edit">
        <ElButton type="primary" @click="onRecipeUpdate">
          {{ recipeModel.checked.id ? "编辑食谱" : "添加食谱" }}
        </ElButton>
      </div>
      <template v-if="recipeModel.checked.id">
        <div class="recipe-name">{{ recipeModel.checked.name }}</div>
        <div class="recipe-time">{{ recipeModel.checked.weekStart }} ~ {{ recipeModel.checked.weekEnd }}</div>
        <RecipeWeekDisplay :data="recipeModel.data" :mealtimes="recipeModel.mealtimes"></RecipeWeekDisplay>
      </template>
      <template v-else>
        <div class="recipe-empty">
          <ElEmpty description="暂无食谱数据"></ElEmpty>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import Storage from "tddev/storage";
import { onRecipeWeekDataFilter } from "./aux_modules/const";
import RecipeWeekDisplay from "./sub_modules/RecipeWeekDisplay.vue";
import { Message } from "@/global/const";
import _utils from "@/utils/index";
import { apiCateringObjectListAll, apiRecipeWeek } from "@/api/recipe";

const Router = useRouter();

const tabsModel = reactive<{
  vLoading: boolean;
  active: string;
  data: Obj[];
}>({
  vLoading: false,
  active: "",
  data: [],
});

const recipeModel = reactive<{
  vLoading: boolean;
  checked: Obj;
  data: Obj;
  mealtimes: Obj[];
}>({
  vLoading: false,
  checked: {},
  data: {},
  mealtimes: [],
});

const onInit = () => {
  const RecipeWeekData2: Obj = Storage.get("RecipeWeekData2") ?? {};
  if (RecipeWeekData2 && Reflect.ownKeys(RecipeWeekData2).length > 0) {
    tabsModel.active = RecipeWeekData2.uid;
    Storage.remove("RecipeWeekData2");
  }
};
onInit();

const getApiCateringObjectListAll = async () => {
  tabsModel.vLoading = true;
  const { success, data, message } = await apiCateringObjectListAll();
  if (success) {
    tabsModel.data = _utils.getDefaultArray(data.list);
    if (tabsModel.data.length > 0) {
      if (!tabsModel.active) {
        tabsModel.active = tabsModel.data[0].id;
      }
      getApiRecipeWeek();
    }
  } else {
    Message.warning(message);
  }
  tabsModel.vLoading = false;
};
getApiCateringObjectListAll();

const getApiRecipeWeek = async () => {
  recipeModel.vLoading = true;
  const { success, data, message } = await apiRecipeWeek({
    catering_objects_id: tabsModel.active,
  });
  if (success) {
    const recipeWeekData = onRecipeWeekDataFilter(data);
    recipeModel.checked = recipeWeekData.weekChecked;
    recipeModel.data = recipeWeekData.weekData;
    recipeModel.mealtimes = recipeWeekData.weekMealtimes;
  } else {
    Message.warning(message);
  }
  recipeModel.vLoading = false;
};

const onTabsChange = () => {
  getApiRecipeWeek();
};

const onRecipeUpdate = () => {
  const tabData = tabsModel.data.find((item: Obj) => item.id === tabsModel.active);
  const RecipeWeekData = {
    id: recipeModel.checked.id,
    uid: tabsModel.active,
    uname: tabData?.object_name,
    meal_types: tabData?.meal_types,
  };
  Storage.set("RecipeWeekData", RecipeWeekData);
  Router.push({ name: "recipeWeekUpdate" });
};
const onRecipeUserUpdate = () => {
  Router.push({ name: "recipeUser" });
};
</script>

<style lang="scss" scoped>
.tabs-container {
  position: relative;
  min-height: 46px;
  margin-bottom: var(--gap);
  background: var(--el-color-white);
  :deep(.el-tabs__header) {
    margin-bottom: 0;
    padding-right: 150px;
  }
  .tabs-edit {
    position: absolute;
    top: 7px;
    right: var(--gap);
    z-index: 3;
  }
}

.recipe-edit {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--gap);
}
</style>
