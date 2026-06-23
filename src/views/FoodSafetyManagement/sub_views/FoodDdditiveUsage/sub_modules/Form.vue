<template>
  <ElDialog
    width="1000px"
    :title="`食品添加剂使用记录${formModel.OperationTypeName}`"
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
            <ElFormItem label="菜品名称" prop="dish_name">
              <ElInput
                v-model="formModel.data.dish_name"
                maxlength="30"
                show-word-limit
                clearable
                placeholder="请输入菜品名称"
              ></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="食材总量(kg)" prop="total_quantity">
              <ElInputNumber
                v-model="formModel.data.total_quantity"
                :min="1"
                :max="99999999"
                :precision="2"
                controls-position="right"
                placeholder="请输入食材总量"
              ></ElInputNumber>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="食品添加剂分类" prop="additive_category">
              <ElSelect
                v-model="formModel.data.additive_category"
                filterable
                clearable
                placeholder="请选择食品添加剂分类"
                @change="onAdditiveCategoryChange"
              >
                <ElOption
                  v-for="group in FoodAdditiveNameList"
                  :key="group.name"
                  :label="group.name"
                  :value="group.name"
                ></ElOption>
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="添加剂名称" prop="additive_name">
              <ElSelect
                v-model="formModel.data.additive_name"
                filterable
                clearable
                :disabled="!formModel.data.additive_category"
                placeholder="请选择添加剂名称"
              >
                <ElOption
                  v-for="item in filteredAdditiveNameList"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
                ></ElOption>
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="添加剂使用量(g)" prop="useage">
              <ElInputNumber
                v-model="formModel.data.useage"
                :min="1"
                :max="99999999"
                step-strictly
                controls-position="right"
                placeholder="请输入添加剂使用量"
              ></ElInputNumber>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="添加剂使用时间" prop="use_date">
              <ElDatePicker
                type="datetime"
                v-model="formModel.data.use_date"
                :value-format="dateTimeModel.valueFormat"
                :default-time="dateTimeModel.defaultTime"
                :disabled-date="onDateTimeDisabled"
                placeholder="请选择添加剂使用时间"
              >
              </ElDatePicker>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="记录人" prop="recorder">
              <ElInput
                v-model.trim="formModel.data.recorder"
                maxlength="10"
                show-word-limit
                clearable
                placeholder="请输入记录人"
              ></ElInput>
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
import { ref, reactive, watch, computed } from "vue";
import { useFoodDdditiveUsageAuxStore } from "../aux_modules/store";
import { FoodAdditiveNameList, OperationTypeEnum, OperationTypeName, Message } from "@/global/const";
import { dateTimeFilter, timestampFilter } from '@/utils/Dayjs/index';
import { apiFoodAdditivesUseUpdate } from "@/api/inspection";

const FoodDdditiveUsageAuxStore = useFoodDdditiveUsageAuxStore();
const formRef = ref();

/** 输入数据 函数方式 */
const formInitial = () => ({
  producet_name: "",
  dish_name: "",
  total_quantity: undefined,
  additive_category: "",
  additive_name: "",
  useage: undefined,
  recorder: "",
  use_date: "",
  usage_status: "1",
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
    dish_name: [{ required: true, message: "请输入菜品名称", trigger: ["change", "blur"] }],
    total_quantity: [{ required: true, message: "请输入食材总量", trigger: ["change", "blur"] }],
    additive_category: [{ required: true, message: "请选择食品添加剂分类", trigger: ["change", "blur"] }],
    additive_name: [{ required: true, message: "请输入添加剂名称", trigger: ["change", "blur"] }],
    useage: [{ required: true, message: "请输入添加剂使用量", trigger: ["change", "blur"] }],
    recorder: [{ required: true, message: "请输入记录人", trigger: ["change", "blur"] }],
    use_date: [{ required: true, message: "请选择添加剂使用时间", trigger: ["change", "blur"] }],
  },
});
const filteredAdditiveNameList = computed(() => {
  const category = formModel.data.additive_category;
  const group = FoodAdditiveNameList.find((item: Obj) => item.name === category);
  return group?.options || [];
});
const inferAdditiveCategory = (additiveName: string) => {
  const group = FoodAdditiveNameList.find((item: Obj) => {
    return item.options.some((option: Obj) => option.value === additiveName);
  });
  return group?.name || "";
};
const onAdditiveCategoryChange = () => {
  formModel.data.additive_name = "";
};
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
      const params = JSON.parse(JSON.stringify(formModel.data));
      params.producet_name = params.dish_name || params.producet_name;
      params.total_quantity = String(params.total_quantity);
      params.useage = String(params.useage);
      delete params.additive_category;

      const { success, message } = await apiFoodAdditivesUseUpdate(params);
      if (success) {
        /** 操作成功刷新页面数据 */
        FoodDdditiveUsageAuxStore.$patch(state => {
          state.refresh = new Date().getTime();
        });
        formModel.visible = false;
        Message.success(`食材添加剂使用记录${formModel.OperationTypeName}完成`);
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
  FoodDdditiveUsageAuxStore.$patch(state => {
    state.data = {};
    state.OperationType = OperationTypeEnum.default;
  });
};

/** 监听操作类型 */
watch(
  () => FoodDdditiveUsageAuxStore.OperationType,
  type => {
    const array = [OperationTypeEnum.add, OperationTypeEnum.update];
    if (array.includes(type as OperationTypeEnum)) {
      formModel.OperationTypeName = OperationTypeName[type as OperationTypeEnum];
      if (type === OperationTypeEnum.update) {
        const data = JSON.parse(JSON.stringify(FoodDdditiveUsageAuxStore.data));
        data.total_quantity = Number(data.total_quantity);
        data.useage = Number(data.useage);
        data.dish_name = data.dish_name || data.producet_name || "";
        data.additive_category = inferAdditiveCategory(data.additive_name);
        formModel.data = data;
      }
      formModel.visible = true;
    }
  }
);
</script>

<style lang="scss" scoped></style>
