<template>
  <ElDialog
    width="1000px"
    :title="`餐具消毒记录${formModel.OperationTypeName}`"
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
            <ElFormItem label="操作人" prop="operator">
              <ElInput
                v-model.trim="formModel.data.operator"
                maxlength="10"
                show-word-limit
                clearable
                placeholder="请输入操作人"
              ></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="班次类型" prop="shift_type">
              <ElSelect v-model="formModel.data.shift_type" filterable clearable placeholder="请选择班次类型">
                <ElOption :label="value.name" :value="value.value" v-for="value in WorkShiftList"></ElOption>
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="消毒时间" prop="disinfect_time">
              <ElDatePicker
                type="datetime"
                v-model="formModel.data.disinfect_time"
                :value-format="dateTimeModel.valueFormat"
                :default-time="dateTimeModel.defaultTime"
                :disabled-date="onDateTimeDisabled"
                placeholder="请选择消毒时间"
              >
              </ElDatePicker>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="餐具数量" prop="tableware_quantity">
              <ElInputNumber
                v-model="formModel.data.tableware_quantity"
                :min="1"
                :max="99999999"
                step-strictly
                controls-position="right"
                placeholder="请输入餐具数量"
              ></ElInputNumber>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="餐具类型" prop="_disinfect_items">
              <ElCheckboxGroup v-model="formModel.data._disinfect_items">
                <ElCheckbox v-for="value in TablewareTypeList" :key="value.value" :label="value.value">
                  {{ value.name }}
                </ElCheckbox>
              </ElCheckboxGroup>
              <div
                v-if="formModel.data.disinfect_items && formModel.data._disinfect_items.length === 0"
                class="legacy-text"
              >
                原记录：{{ formModel.data.disinfect_items }}
              </div>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="消毒温度(℃)" prop="disinfect_temperature">
              <ElInputNumber
                v-model="formModel.data.disinfect_temperature"
                :min="1"
                :max="100"
                :precision="2"
                controls-position="right"
                placeholder="请输入消毒温度"
              ></ElInputNumber>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="消毒时长(分)" prop="disinfect_duration">
              <ElInputNumber
                v-model="formModel.data.disinfect_duration"
                :min="1"
                :max="99999999"
                step-strictly
                controls-position="right"
                placeholder="请输入消毒时长"
              ></ElInputNumber>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="消毒方式" prop="_disinfect_methods">
              <ElCheckboxGroup v-model="formModel.data._disinfect_methods">
                <ElCheckbox v-for="value in DisinfectMethodList" :key="value.value" :label="value.value">
                  {{ value.name }}
                </ElCheckbox>
              </ElCheckboxGroup>
              <div
                v-if="formModel.data.disinfect_methods && formModel.data._disinfect_methods.length === 0"
                class="legacy-text"
              >
                原记录：{{ formModel.data.disinfect_methods }}
              </div>
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
import { useTablewareDisinfectionAuxStore } from "../aux_modules/store";
import { OperationTypeEnum, OperationTypeName, Message, WorkShiftList, TablewareTypeList, DisinfectMethodList } from "@/global/const";
import { dateTimeFilter, timestampFilter } from "@/utils/Dayjs/index";
import { apiTablewareDisinfectionUpdate } from "@/api/inspection";

const TablewareDisinfectionAuxStore = useTablewareDisinfectionAuxStore();
const formRef = ref();

/** 输入数据 函数方式 */
const formInitial = () => ({
  operator: "",
  shift_type: "",
  disinfect_time: "",
  disinfect_items: "",
  _disinfect_items: [] as string[],
  tableware_quantity: undefined,
  disinfect_temperature: undefined,
  disinfect_duration: undefined,
  disinfect_methods: "",
  _disinfect_methods: [] as string[],
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
    // time: [{ required: true, message: "请选择消毒时间", trigger: ["change", "blur"] }],
    operator: [{ required: true, message: "请输入消毒人", trigger: ["change", "blur"] }],
    shift_type: [{ required: true, message: "请选择班次类型", trigger: ["change", "blur"] }],
    disinfect_time: [{ required: true, message: "请选择消毒时间", trigger: ["change", "blur"] }],
    _disinfect_items: [{ type: "array", required: true, message: "请选择餐具类型", trigger: ["change", "blur"] }],
    tableware_quantity: [{ required: true, message: "请输入餐具数量", trigger: ["change", "blur"] }],
    disinfect_temperature: [{ required: true, message: "请输入消毒温度", trigger: ["change", "blur"] }],
    disinfect_duration: [{ required: true, message: "请输入消毒时长", trigger: ["change", "blur"] }],
    _disinfect_methods: [{ type: "array", required: true, message: "请选择消毒方式", trigger: ["change", "blur"] }],
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
      const params = {
        ...formModel.data,
      };
      params.disinfect_items = params._disinfect_items.join(",");
      params.disinfect_methods = params._disinfect_methods.join(",");
      params.tableware_quantity = Number(params.tableware_quantity);
      params.disinfect_temperature = String(params.disinfect_temperature);
      params.disinfect_duration = Number(params.disinfect_duration);
      delete params._disinfect_items;
      delete params._disinfect_methods;
      const { success, message } = await apiTablewareDisinfectionUpdate(params);
      if (success) {
        /** 操作成功刷新页面数据 */
        TablewareDisinfectionAuxStore.$patch(state => {
          state.refresh = new Date().getTime();
        });
        formModel.visible = false;
        Message.success(`餐具消毒记录 ${formModel.OperationTypeName}成功`);
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
  TablewareDisinfectionAuxStore.$patch(state => {
    state.data = {};
    state.OperationType = OperationTypeEnum.default;
  });
};

/** 监听操作类型 */
watch(
  () => TablewareDisinfectionAuxStore.OperationType,
  type => {
    const array = [OperationTypeEnum.add, OperationTypeEnum.update];
    if (array.includes(type as OperationTypeEnum)) {
      formModel.OperationTypeName = OperationTypeName[type as OperationTypeEnum];
      formModel.visible = true;
      if (type === OperationTypeEnum.update) {
        const data = JSON.parse(JSON.stringify(TablewareDisinfectionAuxStore.data));
        data.disinfect_temperature = Number(data.disinfect_temperature);
        data._disinfect_items = getCheckedValues(data.disinfect_items, TablewareTypeList);
        data._disinfect_methods = getCheckedValues(data.disinfect_methods, DisinfectMethodList);
        formModel.data = data;
      }
    }
  }
);

const getCheckedValues = (value: string, list: { value: string }[]) => {
  const allowed = list.map(item => item.value);
  const values = String(value || "")
    .split(",")
    .filter(Boolean);
  return values.every(item => allowed.includes(item)) ? values : [];
};
</script>

<style lang="scss" scoped>
.legacy-text {
  margin-top: 4px;
  color: #909399;
  line-height: 20px;
}
</style>
