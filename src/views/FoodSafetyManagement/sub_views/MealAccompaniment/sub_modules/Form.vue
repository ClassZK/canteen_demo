<template>
  <ElDialog
    width="1000px"
    :title="`陪餐记录${formModel.OperationTypeName}`"
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
        scroll-to-error
        label-width="80px"
        label-position="top"
      >
        <ElRow :gutter="30">
          <ElCol :span="12">
            <ElFormItem label="陪餐时间" prop="meal_time">
              <ElDatePicker
                type="datetime"
                v-model="formModel.data.meal_time"
                :value-format="dateTimeModel.valueFormat"
                :default-time="dateTimeModel.defaultTime"
                :disabled-date="onDateTimeDisabled"
                placeholder="请选择陪餐时间"
              >
              </ElDatePicker>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="陪餐类型" prop="meal_type">
              <ElSelect v-model="formModel.data.meal_type" filterable clearable placeholder="请选择陪餐类型">
                <ElOption v-for="item of MealAccompanyList" :label="item.name" :value="item.value"></ElOption>
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="陪餐餐次" prop="accompanying_meals">
              <ElSelect v-model="formModel.data.accompanying_meals" filterable clearable placeholder="请选择陪餐餐次">
                <ElOption :label="value.name" :value="value.value" v-for="value in MealtimeList"></ElOption>
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="陪餐人" prop="companion">
              <ElInput
                v-model.trim="formModel.data.companion"
                maxlength="10"
                show-word-limit
                clearable
                placeholder="请输入陪餐人"
              ></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="陪餐人职务" prop="companion_position">
              <ElInput
                v-model="formModel.data.companion_position"
                maxlength="30"
                show-word-limit
                clearable
                placeholder="请输入陪餐人职务"
              ></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="记录人" prop="waiter">
              <ElInput
                v-model.trim="formModel.data.waiter"
                maxlength="10"
                show-word-limit
                clearable
                placeholder="请输入记录人"
              ></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol>
            <ElFormItem label="评价" prop="appraise">
              <ElInput v-model="formModel.data.appraise" type="textarea" :rows="5" resize="none" maxlength="200" show-word-limit placeholder="评价"></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol>
            <ElFormItem label="图片" prop="image">
              <IUploadImage :data="formModel.data.image" @success="onUploadImage"></IUploadImage>
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="formModel.visible = false">取消</ElButton>
        <ElButton type="primary" :loading="formModel.loading" @click="onFormConfirm">确定</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from "vue";
import { useMealAccompanimentAuxStore } from "../aux_modules/store";
import { OperationTypeEnum, OperationTypeName, Message, MealtimeList, MealAccompanyList } from "@/global/const";
import { dateTimeFilter, timestampFilter } from '@/utils/Dayjs/index';
import { apiMealAccompanimentUpdate } from "@/api/inspection";

const MealAccompanimentAuxStore = useMealAccompanimentAuxStore();
const formRef = ref();

/** 输入数据 函数方式 */
const formInitial = () => ({
  meal_time: "",
  meal_type: "",
  accompanying_meals: "",
  companion: "",
  companion_position: "",
  waiter: "",
  appraise: "",
  image: "",
});
/** 交互反馈数据 */
const formModel = reactive({
  visible: false,
  loading: false,
  vLoading: false,
  OperationTypeName: "",
  data: formInitial() as Obj,
  checked: {} as Obj,
  rules: {
    meal_time: [{ required: true, message: "请选择陪餐时间", trigger: ["change", "blur"] }],
    meal_type: [{ required: true, message: "请选择陪餐类型", trigger: ["change", "blur"] }],
    accompanying_meals: [{ required: true, message: "请选择陪餐餐次", trigger: ["change", "blur"] }],
    companion: [{ required: true, message: "请输入陪餐人", trigger: ["change", "blur"] }],
    companion_position: [{ required: true, message: "请输入陪餐人职务", trigger: ["change", "blur"] }],
    waiter: [{ required: true, message: "请输入记录人", trigger: ["change", "blur"] }],
  },
});
/** 时间 */
const dateTimeModel = reactive({
  valueFormat: "YYYY-MM-DD HH:mm:ss",
  defaultTime: new Date(2000, 1, 1, 0, 0, 0),
});
const onDateTimeDisabled = (time: Date) => {
    const dateTime = dateTimeFilter(new Date());
    const timestamp = timestampFilter(dateTime);
    return time.getTime() > timestamp;
};

/** 确定 */
const onFormConfirm = async () => {
  await formRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      Message.close();
      formModel.loading = true;
      const { success, message } = await apiMealAccompanimentUpdate(formModel.data);
      if (success) {
        /** 操作成功刷新页面数据 */
        MealAccompanimentAuxStore.$patch(state => {
          state.refresh = new Date().getTime();
        });
        formModel.visible = false;
        Message.success(`陪餐记录${formModel.OperationTypeName}完成`);
      } else {
        Message.warning(message);
      }
      formModel.loading = false;
    }
  });
};

const onUploadImage = (value: string) => {
  formModel.data.image = value;
  formRef.value?.validateField("image");
};

/** 取消 */
const onFormClosed = () => {
  formModel.data = formInitial();
  formRef.value?.resetFields();
  MealAccompanimentAuxStore.$patch(state => {
    state.data = {};
    state.OperationType = OperationTypeEnum.default;
  });
};

/** 监听操作类型 */
watch(
  () => MealAccompanimentAuxStore.OperationType,
  type => {
    const array = [OperationTypeEnum.add, OperationTypeEnum.update];
    if (array.includes(type as OperationTypeEnum)) {
      formModel.OperationTypeName = OperationTypeName[type as OperationTypeEnum];
      if (type === OperationTypeEnum.update) {
        formModel.data = JSON.parse(JSON.stringify(MealAccompanimentAuxStore.data));
      }
      formModel.visible = true;
    }
  }
);
</script>

<style lang="scss" scoped></style>
