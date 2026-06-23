<template>
  <ElDialog
    v-if="formModel.visible"
    width="800px"
    :title="`新增采购量推荐`"
    class="dialog-container"
    modal-class="dialog-overlay-custom"
    v-model="formModel.visible"
    draggable
    destroy-on-close
    append-to-body
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @closed="onFormClosed"
  >
    <div class="form-container" v-loading="formModel.vLoading" element-loading-text="数据加载中">
      <ElForm
        ref="formRef"
        :model="formModel.data"
        :rules="formModel.rules"
        :disabled="RecommendationAuxStore.OperationType === OperationTypeEnum.detail"
        scroll-to-error
        label-width="80px"
      >
        <ElRow :gutter="20">
          <ElCol :span="16">
            <ElFormItem label="食谱名称" label-width="126px" prop="recipe_id">
              <ElSelect
                v-model="formModel.data.recipe_id"
                filterable
                remote
                reserve-keyword
                @change="onRecipeChange"
                :remote-method="apiCanteenPurchase"
                :loading="loading"
                placeholder="请选择"
              >
                <ElOption
                  v-for="item in RecommendationAuxStore.RecipeList"
                  :key="item.recipe_id"
                  :label="item.recipe_name"
                  :value="item.recipe_id"
                ></ElOption>
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElRow v-if="formModel.data.recipe_id" :gutter="12">
          <ElCol :span="16">
            <ElFormItem label="时间" label-width="126px" prop="meal_time">
              <ElDatePicker
                v-model="formModel.data.meal_time"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="选择日期"
                :disabled-date="disabledDate"
              ></ElDatePicker>
            </ElFormItem>
          </ElCol>
        </ElRow>
        <template v-if="formModel.data.recipe_id">
          <ElRow :gutter="12" v-for="(value, index) in formModel.data.meal_info" :key="index">
            <ElCol :span="13">
              <ElFormItem
                label="关联餐次和人数"
                label-width="126px"
                :prop="`meal_info[${index}].meal_type`"
                :rules="formModel.rules.meal_type"
              >
                <div class="flex-container">
                  <div class="flex-item">餐次</div>
                  <ElSelect v-model="value.meal_type" placeholder="请选择">
                    <ElOption
                      v-for="item in MealtimeListOptions"
                      :key="item.value"
                      :label="item.name"
                      :value="item.value"
                      :disabled="item.disabled"
                    />
                  </ElSelect>
                </div>
              </ElFormItem>
            </ElCol>
            <ElCol :span="7">
              <ElFormItem :prop="`meal_info[${index}].total`" label-width="0px" :rules="formModel.rules.meal_total">
                <div class="flex-container">
                  <div class="flex-item">人数</div>
                  <ElInputNumber
                    v-model="value.total"
                    precision="0"
                    min="1"
                    max="10000"
                    step="1"
                    placeholder=" "
                  ></ElInputNumber>
                </div>
              </ElFormItem>
            </ElCol>
            <ElCol :span="4">
              <el-button-group class="button-group" direction="horizontal">
                <el-button :icon="Plus" @click="addMealInfo" />
                <el-button :icon="Minus" @click="removeMealInfo(index)" />
              </el-button-group>
            </ElCol> </ElRow
        ></template>
      </ElForm>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="onFormClosed">取消</ElButton>
        <ElButton type="primary" :loading="formModel.loading" @click="onFormConfirm">确定</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, onMounted } from "vue";
import { useRecommendationAuxStore } from "../aux_modules/store";
import { OperationTypeEnum, MealtimeList, Message } from "@/global/const";
import { apiCanteenPurchaseSuggestionList, apiCanteenPurchaseSuggestionPageList } from "@/api/recipe";
import { Plus, Minus } from "@element-plus/icons-vue";
import { validatorPositiveInteger } from "@/utils/Regexp";
import _utils from "@/utils/index";
import { useRouter } from "vue-router";
import dayjs from "dayjs";
import Storage from "tddev/storage";
const router = useRouter();
const RecommendationAuxStore = useRecommendationAuxStore();
const formRef = ref();
const loading = ref(false);
const MealtimeListOptions = reactive(
  MealtimeList.map(item => ({
    name: item.name,
    value: item.value,
    disabled: false,
  })),
);
// 时间范围限制
const timeRange = reactive({
  start_time: "",
  end_time: "",
});
/** 输入数据 函数方式 */
const formInitial = () => ({
  recipe_id: "",
  meal_time: "",
  meal_info: [
    {
      meal_type: "",
      total: "",
    },
  ],
});
/** 交互反馈数据 */
const formModel = reactive({
  visible: false,
  loading: false,
  vLoading: true,
  OperationTypeName: "",
  data: formInitial(),
  rules: {
    recipe_id: [{ required: true, message: "请选择食谱名称", trigger: ["blur", "change"] }],
    meal_time: [{ required: true, message: "请选择时间", trigger: ["blur", "change"] }],
    meal_info: [
      {
        required: true,
        type: "array",
        min: 1,
        message: "请至少添加一个关联餐次和人数",
        trigger: ["blur", "change"],
      },
    ],
    meal_type: [{ required: true, message: "请选择餐次", trigger: ["blur", "change"] }],
    meal_total: [
      { required: true, message: "请输入人数", trigger: ["blur", "change"] },
      {
        type: "number",
        min: 1,
        validator: validatorPositiveInteger(),
        trigger: ["blur", "change"],
      },
    ],
  },
});
/** 添加关联餐次和人数 */
const addMealInfo = () => {
  formModel.data.meal_info.push({
    meal_type: "",
    total: "",
  });
};
/** 删除关联餐次和人数 */
const removeMealInfo = (index: number) => {
  if (index === 0) {
    Message.warning("第一个关联餐次和人数不能删除");
    return;
  }
  formModel.data.meal_info.splice(index, 1);
};

const groupArrBySupplier = (arr: Obj[]) => {
  const supplierMap = new Map();
  arr.forEach(item => {
    const { supplier_id, supplier_name } = item;

    if (!supplierMap.has(supplier_id)) {
      supplierMap.set(supplier_id, {
        supplier_id: supplier_id,
        supplier_name: supplier_name,
        list: [],
      });
    }
    supplierMap.get(supplier_id).list.push(item);
  });
  return Array.from(supplierMap.values());
};

/** 食谱名称改变时触发 */
const onRecipeChange = (val: string) => {
  const CurrentRecipe = RecommendationAuxStore.RecipeList.find(item => item.recipe_id === val);
  const { meal_types, start_time, end_time } = CurrentRecipe || {};

  formModel.data.meal_time = "";
  formModel.data.meal_info = [
    {
      meal_type: "",
      total: "",
    },
  ];

  // 更新餐次选项
  MealtimeListOptions.forEach(item => {
    item.disabled = !meal_types.includes(item.value);
  });

  // 更新时间范围限制
  timeRange.start_time = start_time || "";
  timeRange.end_time = end_time || "";

  // 如果当前选择的时间不在范围内，则清空
  if (formModel.data.meal_time) {
    const selectedDate = dayjs(formModel.data.meal_time);
    const startTime = dayjs(start_time);
    const endTime = dayjs(end_time);

    if (startTime.isValid() && endTime.isValid()) {
      if (selectedDate.isBefore(startTime) || selectedDate.isAfter(endTime)) {
        formModel.data.meal_time = "";
      }
    }
  }
};

/** 禁用日期函数 */
const disabledDate = (time: Date) => {
  const currentTime = dayjs(time);
  const startTime = dayjs(timeRange.start_time);
  const endTime = dayjs(timeRange.end_time);

  // 如果没有设置时间范围限制，则不禁用任何日期
  if (!startTime.isValid() || !endTime.isValid()) {
    return false;
  }

  // 禁用不在时间范围内的日期
  return currentTime.isBefore(startTime, "day") || currentTime.isAfter(endTime, "day");
};

/** 确定 */
const onFormConfirm = async () => {
  await formRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      Message.close();
      formModel.loading = true;
      const params: Obj = { ...formModel.data };
      params.meal_info = params.meal_info.map((item: Obj) => ({
        ...item,
        total: Number(item.total),
      }));
      const { success, message, data } = await apiCanteenPurchaseSuggestionList(params);
      if (success) {
        /** 操作成功刷新页面数据 */
        RecommendationAuxStore.$patch(state => {
          state.OperationType = OperationTypeEnum.default;
          state.refresh = new Date().getTime();
          formModel.data = formInitial();
          state.RecipeInfo = params;
          state.RecommendationDetail = groupArrBySupplier(_utils.getDefaultArray(data.suggestion));
        });
        Storage.set("RecommendationDetail", groupArrBySupplier(_utils.getDefaultArray(data.suggestion)));
        router.push({
          path: "/recommendationSubmit",
        });
        formModel.visible = false;
      } else {
        Message.warning(message);
      }
      formModel.loading = false;
    }
  });
};

/** 取消 */
const onFormClosed = () => {
  formModel.data = formInitial();
  formRef.value?.resetFields();
  RecommendationAuxStore.$patch(state => {
    state.data = {};
    state.OperationType = OperationTypeEnum.default;
  });
  formModel.visible = false;
};

// 查询食谱列表
const apiCanteenPurchase = async (query: string) => {
  loading.value = true;
  const { success, data, message } = await apiCanteenPurchaseSuggestionPageList({
    recipe_name: query,
  });
  if (success) {
    const list = _utils.getDefaultArray(data.list);
    RecommendationAuxStore.$patch(state => {
      state.RecipeList = list;
    });
  } else {
    Message.warning(message);
  }
  loading.value = false;
};

onMounted(() => {
  formModel.vLoading = false;
});
/** 监听操作类型 */
watch(
  () => RecommendationAuxStore.OperationType,
  type => {
    if (type === OperationTypeEnum.add || type === OperationTypeEnum.update || type === OperationTypeEnum.detail) {
      formModel.visible = true;
    }
  },
);
</script>

<style lang="scss" scoped>
.flex-container {
  display: flex;
  align-items: center;
  flex: 1;
  .flex-item {
    box-sizing: border-box;
    background-color: var(--el-fill-color-light);
    color: var(--el-color-info);
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    padding: 0 20px;
    white-space: nowrap;
    border-radius: var(--el-border-radius-base) 0 0 var(--el-border-radius-base);
    border: 1px solid var(--el-border-color);
    right: -2px;
  }
}
</style>
