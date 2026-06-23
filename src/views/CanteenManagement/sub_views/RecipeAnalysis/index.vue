<template>
    <div class="recipe-analysis" v-loading="recipeModel.vLoading" element-loading-text="数据加载中">
        <div class="recipe-header">
            <ElDatePicker type="week" v-model="recipeModel.dateActive" :format="recipeModel.dateFormat" placeholder="时间" :disabled-date="onDateTimeDisabled" @change="onRecipeWeekChange"></ElDatePicker>
        </div>
        <ElRow :gutter="12" class="recipe-chat">
            <ElCol :lg="12" class="chat-col">
                <IChat1 :data="recipeModel.recipeTrend"></IChat1>
            </ElCol>
            <ElCol :lg="12" class="chat-col">
                <IChat2 :data="recipeModel.recipeScore"></IChat2>
            </ElCol>
            <ElCol :lg="12" class="chat-col">
                <IChat3 :data="recipeModel.recipeType"></IChat3>
            </ElCol>
            <ElCol :lg="12" class="chat-col">
                <IChat4 :data="recipeModel.dishType"></IChat4>
            </ElCol>
        </ElRow>
    </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import IChat1 from './sub_modules/chat-1.vue';
import IChat2 from './sub_modules/chat-2.vue';
import IChat3 from './sub_modules/chat-3.vue';
import IChat4 from './sub_modules/chat-4.vue';
import { Message } from '@/global/const';
import { dateTimeEndFilter, dateFilter, timestampFilter } from '@/utils/Dayjs';
import _utils from '@/utils/index';
import { apiCanteenRecipeAnalysis } from '@/api/recipe'

const currentWeek = _utils.getCurrentWeekRange();

const recipeModel = reactive({
    vLoading: false,
    dateActive: '',
    dateFormat: 'YYYY[年] - ww[周]',
    startTime: '',
    endTime: '',
    recipeTrend: [],
    recipeScore: [],
    recipeType: [],
    dishType: [],
});

const onInit = () => {
    recipeModel.dateActive = currentWeek.start;
    recipeModel.startTime = currentWeek.start;
    recipeModel.endTime = currentWeek.end;
};
onInit();

const onDateTimeDisabled = (time: Date) => {
    const dateTime = dateTimeEndFilter(currentWeek.end);
    const timestamp = timestampFilter(dateTime) - 1000 * 60 *60 * 24;
    return time.getTime() > timestamp;
};

const onRecipeWeekChange = () => {
    const startTime = dateFilter(recipeModel.dateActive);
    const startTimeTimestamp = timestampFilter(startTime) + 1000 * 60 * 60 * 24 * 7;
    const endTime = dateFilter(startTimeTimestamp);
    recipeModel.startTime = startTime;
    recipeModel.endTime = endTime;
    onApiCanteenRecipeAnalysis();
};

const onApiCanteenRecipeAnalysis = async () => {
    recipeModel.vLoading = true;
    const { success, data, message } = await apiCanteenRecipeAnalysis({
        start_time: recipeModel.startTime,
        end_time: recipeModel.endTime,
    });
    if (success) {
        recipeModel.recipeTrend = Array.isArray(data.add_recipe_trend)? data.add_recipe_trend:[];
        recipeModel.recipeScore = Array.isArray(data.recipe_score)? data.recipe_score:[];
        recipeModel.recipeType = Array.isArray(data.add_recipe_count)? data.add_recipe_count:[];
        recipeModel.dishType = Array.isArray(data.dish_type)? data.dish_type:[];
    } else {
        Message.warning(message);
    }
    recipeModel.vLoading = false;
};
onApiCanteenRecipeAnalysis();
</script>

<style lang="scss" scoped>
  .recipe-header {
    margin-bottom: var(--gap);
    padding: var(--gap);
    background: var(--el-color-white);
    border-radius: var(--radius-lg);
  }
  .recipe-chat {
    .chat-col {
        margin-bottom: var(--gap);
    }
  }
  .chat-chunk {
    padding: var(--gap);
    background: var(--el-color-white);
    border-radius: var(--radius-lg);
    box-sizing: border-box;
  }
</style>

<style lang="scss">
    .chat-title {
        margin-bottom: var(--gap);
        font-size: var(--font-size-md);
    }
</style>