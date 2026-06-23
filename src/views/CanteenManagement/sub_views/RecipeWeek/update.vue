<template>
  <div class="recipe-week-header">
    <div class="title">
      <ElButton icon="back" @click="onBack">返回</ElButton>
      <p>{{ RecipeWeekParams.id ? "编辑" : "新增" }} {{ RecipeWeekParams.uname }} 食谱</p>
    </div>
    <div class="handle">
      <ElButton type="primary" :loading="recipeModel.loading" @click="onConfirm">确定</ElButton>
    </div>
  </div>
  <div class="recipe-week-edit" v-loading="recipeModel.vLoading" element-loading-text="数据加载中">
    <div class="recipe-name">
      <ElInput
        v-model="recipeModel.checked.name"
        maxlength="30"
        show-word-limit
        clearable
        placeholder="请输入食谱名称"
      ></ElInput>
    </div>
    <div class="recipe-time">{{ recipeModel.weekRange }}</div>
    <div class="recipe-week-vtable">
      <div class="list list-category">
        <div class="vthead">
          <div class="cell">用餐餐次</div>
        </div>
        <div class="vtbody">
          <div class="cell" v-for="item of recipeModel.mealtimes" :key="item.name">{{ item.name }}</div>
        </div>
      </div>
      <div class="list" v-for="item in recipeModel.data" :key="item.date">
        <div class="vthead">
          <div class="cell">{{ item.date }} {{ item.week }}</div>
        </div>
        <div class="vtbody">
          <div class="cell" v-for="el of item.mealtimes" :key="item.date + el.value">
            <ElTag
              v-for="(e, i) of el.data"
              :key="item.date + el.value + e.name"
              type="warning"
              closable
              @close="onCanteenDishesClose(el, i)"
            >
              <span>{{ e.name }}</span>
              <span v-if="e.price !== undefined && e.price !== null && e.price !== ''" class="dish-price-text">￥{{ Number(e.price || 0).toFixed(2) }}</span>
            </ElTag>
            <ElButton plain circle size="small" @click="onCanteenDishesChoose(item, el.value)">
              <ElIcon><Plus /></ElIcon>
            </ElButton>
          </div>
        </div>
      </div>
    </div>
  </div>
  <ICanteenDishesTable></ICanteenDishesTable>
</template>

<script lang="ts" setup>
import { reactive, onBeforeUnmount, watch } from "vue";
import { useRouter } from "vue-router";
import Storage from "tddev/storage";
import ICanteenDishesTable from "./sub_modules/CanteenDishesTable.vue";
import { currentWeek, setWeekMealtimeFormat, onRecipeWeekDataFilter } from "./aux_modules/const";
import { useRecipeWeekAuxStore } from "./aux_modules/store";
import { OperationTypeEnum, Message } from "@/global/const";
import { apiRecipeDetail, apiRecipeUpdate } from "@/api/recipe";

const Router = useRouter();
const RecipeWeekAuxStore = useRecipeWeekAuxStore();

const recipeModel = reactive<{
  loading: boolean;
  vLoading: boolean;
  weekRange: string;
  checked: Obj;
  data: Obj;
  mealtimes: Obj[];
}>({
  loading: false,
  vLoading: false,
  weekRange: "",
  checked: {},
  data: {},
  mealtimes: [],
});

let RecipeWeekParams: Obj = {};
const RecipeWeekData = Storage.get("RecipeWeekData") ?? {};
if (RecipeWeekData && Reflect.ownKeys(RecipeWeekData).length > 0) {
  RecipeWeekParams = RecipeWeekData;
}

const onInitWeeks = () => {
  recipeModel.weekRange = `${currentWeek.start} ~ ${currentWeek.end}`;
  const recipeWeekData = setWeekMealtimeFormat(RecipeWeekParams);
  recipeModel.data = recipeWeekData.weekData;
  recipeModel.mealtimes = recipeWeekData.weekMealtimes;
};

const getApiRecipeDetail = async () => {
  if (RecipeWeekParams.id) {
    recipeModel.vLoading = true;
    const { success, data, message } = await apiRecipeDetail({ id: RecipeWeekParams.id });
    if (success) {
      const recipeWeekData = onRecipeWeekDataFilter(data);
      recipeModel.checked = recipeWeekData.weekChecked;
      recipeModel.data = recipeWeekData.weekData;
      recipeModel.mealtimes = recipeWeekData.weekMealtimes;
      recipeModel.weekRange = `${recipeModel.checked.weekStart} ~ ${recipeModel.checked.weekEnd}`;
    } else {
      Message.warning(message);
    }
    recipeModel.vLoading = false;
  } else {
    onInitWeeks();
  }
  RecipeWeekAuxStore.$patch(state => {
    state.weekChecked = recipeModel.checked;
    state.weekData = recipeModel.data;
  });
};
getApiRecipeDetail();

const onCanteenDishesChoose = (weekChecked: Obj, mealtime: string | number) => {
  RecipeWeekAuxStore.$patch(state => {
    state.weekChecked = { ...weekChecked, mealtime };
    state.OperationType = OperationTypeEnum.handle;
  });
};
const onCanteenDishesClose = (data: Obj, index: number) => {
  data?.data.splice(index, 1);
  RecipeWeekAuxStore.$patch(state => {
    state.weekData = recipeModel.data;
  });
};

const onConfirm = async () => {
  if (!recipeModel.checked.name) {
    Message.warning("请输入食谱名称");
    return;
  }

  recipeModel.loading = true;
  const params: Obj = {
    id: RecipeWeekParams.id || "",
    catering_objects_id: RecipeWeekParams.uid || "",
    recipe_name: recipeModel.checked.name,
    date_start: currentWeek.start,
    date_end: currentWeek.end,
    list: [],
  };
  for (const key in recipeModel.data) {
    const recipeData = recipeModel.data[key];
    const list: Obj[] = [];
    for (const item of recipeData.mealtimes) {
      for (const el of item.data) {
        list.push({
          meal_types: item.value,
          dish_id: el.id,
          price: el.price || 0,
        });
      }
    }
    params.list.push({
      date: recipeData.date,
      oil: "0",
      salt: "0",
      sugar: "0",
      list,
    });
  }
  const { success, data, message } = await apiRecipeUpdate(params);
  if (success) {
    Message.success(`食谱${RecipeWeekParams.id ? "编辑" : "新增"}成功`);
    onBack();
  } else {
    Message.warning(message);
  }
  recipeModel.loading = false;
};
const onBack = () => {
  Router.back();
};

onBeforeUnmount(() => {
  Storage.set("RecipeWeekData2", RecipeWeekParams);
  Storage.remove("RecipeWeekData");
});

watch(
  () => RecipeWeekAuxStore.weekData,
  object => {
    recipeModel.data = object;
  },
  {
    deep: true,
  }
);
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

.dish-price-text {
  margin-left: 6px;
  font-weight: 600;
}
</style>
