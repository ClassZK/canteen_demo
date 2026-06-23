<template>
  <ElDialog
    width="1200px"
    :title="`食谱${detailModel.OperationTypeName}`"
    class="dialog-container"
    modal-class="dialog-overlay-custom"
    v-model="detailModel.visible"
    draggable
    destroy-on-close
    append-to-body
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @open="onFormOpen"
    @closed="onFormClosed"
  >
    <div class="recipe-week-edit" v-loading="detailModel.vLoading" element-loading-text="数据加载中">
        <div class="recipe-name">{{recipeModel.checked.name}}</div>
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
                        <ElTag v-for="e of el.data" :key="item.date + el.value + e.name" type="warning">{{ e.name }}</ElTag>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="detailModel.visible = false">取消</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script lang="ts" setup>
import { reactive, watch } from "vue";
import { useCanteenRecipeAuxStore } from "../aux_modules/store";
import { onRecipeWeekDataFilter } from '@/views/CanteenManagement/sub_views/RecipeWeek/aux_modules/const'
import { OperationTypeEnum, OperationTypeName, Message } from "@/global/const";
import { apiRecipeDetail } from '@/api/recipe';

const CanteenRecipeAuxStore = useCanteenRecipeAuxStore();

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
    weekRange: '',
    checked: {},
    data: {},
    mealtimes: [],
});

/** 交互反馈数据 */
const detailModel = reactive({
  visible: false,
  vLoading: false,
  OperationTypeName: "",
  data: {} as Obj,
  checked: {} as Obj,
});

const getApiRecipeDetail = async () => {
    detailModel.vLoading = true;
    const { success, data, message } = await apiRecipeDetail({ id: detailModel.checked.id });
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

const onFormOpen = () => {
  getApiRecipeDetail();
};

/** 取消 */
const onFormClosed = () => {
  detailModel.data = {};
  recipeModel.checked = {};
  recipeModel.data = {};
  CanteenRecipeAuxStore.$patch(state => {
    state.data = {};
    state.OperationType = OperationTypeEnum.default;
  });
};

/** 监听操作类型 */
watch(
  () => CanteenRecipeAuxStore.OperationType,
  type => {
    if (type === OperationTypeEnum.detail) {
      detailModel.visible = true;
      detailModel.OperationTypeName = OperationTypeName[type as OperationTypeEnum];
      const data = JSON.parse(JSON.stringify(CanteenRecipeAuxStore.data));
      detailModel.checked = data;
    }
  }
);
</script>

<style lang="scss" scoped></style>
