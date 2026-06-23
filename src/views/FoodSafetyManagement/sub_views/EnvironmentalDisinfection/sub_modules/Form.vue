<template>
  <ElDialog
    width="1000px"
    :title="`环境消毒记录${formModel.OperationTypeName}`"
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
            <ElFormItem label="消毒时间" prop="disinfection_time">
              <ElDatePicker
                type="datetime"
                v-model="formModel.data.disinfection_time"
                :value-format="dateTimeModel.valueFormat"
                :default-time="dateTimeModel.defaultTime"
                :disabled-date="onDateTimeDisabled"
                placeholder="请选择消毒时间"
              >
              </ElDatePicker>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
              <ElFormItem label="清洁区域" prop="region">
                  <ElSelect v-model="formModel.data.region" filterable clearable placeholder="请选择清洁区域">
                      <ElOption v-for="item of CanteenAreaList" :key="item.value" :label="item.name" :value="item.value"></ElOption>
                  </ElSelect>
              </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="消毒方式" prop="disinfection_type">
              <ElInput
                v-model="formModel.data.disinfection_type"
                maxlength="30"
                show-word-limit
                clearable
                placeholder="请输入消毒方式"
              ></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="消毒时长(分)" prop="disinfection_duration">
              <ElInputNumber
                v-model="formModel.data.disinfection_duration"
                :min="1"
                :max="99999999"
                step-strictly
                controls-position="right"
                placeholder="请输入消毒时长"
              ></ElInputNumber>
            </ElFormItem>
          </ElCol>
          <ElCol>
            <ElFormItem label="图片" prop="image">
              <IUploadImage :limit="5" :data="formModel.data.image" @success="onUploadImage"></IUploadImage>
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
import { useEnvironmentalDisinfectionAuxStore } from "../aux_modules/store";
import { OperationTypeEnum, OperationTypeName, Message, CanteenAreaList } from "@/global/const";
import { dateTimeFilter, timestampFilter } from '@/utils/Dayjs/index';
import { apiEnvironmentalDisinfectionUpdate } from "@/api/inspection";

const EnvironmentalDisinfectionAuxStore = useEnvironmentalDisinfectionAuxStore();
const formRef = ref();

/** 输入数据 函数方式 */
const formInitial = () => ({
  operator: "",
  disinfection_time: "",
  region: "",
  disinfection_type: "",
  disinfection_duration: undefined,
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
    disinfection_time: [{ required: true, message: "请选择消毒时间", trigger: ["change", "blur"] }],
    region: [{ required: true, message: "请输入消毒区域", trigger: ["change", "blur"] }],
    disinfection_type: [{ required: true, message: "请输入消毒方式", trigger: ["change", "blur"] }],
    disinfection_duration: [{ required: true, message: "请输入消毒时长", trigger: ["change", "blur"] }],
    operator: [{ required: true, message: "请输入操作人", trigger: ["change", "blur"] }],
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
      const { success, message } = await apiEnvironmentalDisinfectionUpdate(formModel.data);
      if (success) {
        /** 操作成功刷新页面数据 */
        EnvironmentalDisinfectionAuxStore.$patch(state => {
          state.refresh = new Date().getTime();
        });
        formModel.visible = false;
        Message.success(`环境消毒${formModel.OperationTypeName}完成`);
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
  EnvironmentalDisinfectionAuxStore.$patch(state => {
    state.data = {};
    state.OperationType = OperationTypeEnum.default;
  });
};

/** 监听操作类型 */
watch(
  () => EnvironmentalDisinfectionAuxStore.OperationType,
  type => {
    const array = [OperationTypeEnum.add, OperationTypeEnum.update];
    if (array.includes(type as OperationTypeEnum)) {
      formModel.OperationTypeName = OperationTypeName[type as OperationTypeEnum];
      formModel.visible = true;
      /** 回显数据 */
      if (type === OperationTypeEnum.update) {
        const data = JSON.parse(JSON.stringify(EnvironmentalDisinfectionAuxStore.data));
        formModel.data = data;
      }
    }
  }
);
</script>

<style lang="scss" scoped></style>
