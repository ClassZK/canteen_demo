<template>
  <ElDialog
    width="1000px"
    :title="`食品留样${formModel.OperationTypeName}`"
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
    <div class="form-container">
      <ElForm
        ref="formRef"
        :model="formModel.data"
        :rules="formRules"
        scroll-to-error
        label-width="80px"
        label-position="top"
      >
        <ElRow :gutter="30">
          <ElCol :span="12">
            <ElFormItem label="留样人" prop="sample_pepeole">
              <ElInput
                v-model.trim="formModel.data.sample_pepeole"
                maxlength="10"
                show-word-limit
                clearable
                placeholder="请输入留样人"
              ></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="留样时间" prop="sample_time">
              <ElDatePicker
                type="datetime"
                v-model="formModel.data.sample_time"
                :value-format="dateTimeModel.valueFormat"
                :default-time="dateTimeModel.defaultTime"
                :disabled-date="onDateTimeDisabled"
                placeholder="请选择留样时间"
              ></ElDatePicker>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="留样餐次" prop="sample_meal_types">
              <ElSelect v-model="formModel.data.sample_meal_types" filterable clearable placeholder="请选择留样餐次">
                <ElOption
                  v-for="item of MealtimeList"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
                ></ElOption>
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="留样重量(g)" prop="sample_weight">
              <ElInputNumber
                v-model="formModel.data.sample_weight"
                :max="99999999"
                :precision="2"
                controls-position="right"
                placeholder="请输入留样重量"
              ></ElInputNumber>
            </ElFormItem>
          </ElCol>
          <ElCol>
            <ElFormItem label="图片" prop="image">
              <IUploadImage :limit="100" :data="formModel.data.image" @success="onUploadImage"></IUploadImage>
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
import Storage from "tddev/storage";
import { useSampleRetentionAuxStore } from "../aux_modules/store";
import { OperationTypeEnum, OperationTypeName, Message, MealtimeList } from "@/global/const";
import { dateTimeFilter, timestampFilter } from "@/utils/Dayjs/index";
import { apiFoodRetentionUpdate } from "@/api/inspection";

const SampleRetentionAuxStore = useSampleRetentionAuxStore();
const formRef = ref();
const systemUserinfo: Obj = Storage.get("SystemUserinfo") ?? {};

const formInitial = () => ({
  image: "",
  sample_pepeole: systemUserinfo?.nick || "",
  sample_time: "",
  sample_meal_types: "",
  sample_weight: undefined,
  status: "",
  handlers: "",
  handle_time: "",
});

const formModel = reactive<{
  visible: boolean;
  loading: boolean;
  OperationTypeName: string;
  data: Obj;
}>({
  visible: false,
  loading: false,
  OperationTypeName: "",
  data: formInitial(),
});

const validateSampleWeight = (_rule: unknown, value: number, callback: (error?: Error) => void) => {
  if (Number(value) > 125) {
    callback();
    return;
  }
  callback(new Error("留样重量需大于125g"));
};

const formRules = {
  sample_pepeole: [{ required: true, message: "请输入留样人", trigger: ["change", "blur"] }],
  sample_time: [{ required: true, message: "请选择留样时间", trigger: ["change", "blur"] }],
  sample_meal_types: [{ required: true, message: "请选择留样餐次", trigger: ["change", "blur"] }],
  sample_weight: [{ required: true, validator: validateSampleWeight, trigger: ["change", "blur"] }],
};

const dateTimeModel = reactive({
  valueFormat: "YYYY-MM-DD HH:mm:ss",
  defaultTime: new Date(2000, 1, 1, 0, 0, 0),
});
const onDateTimeDisabled = (time: Date) => {
  const dateTime = dateTimeFilter(new Date());
  const timestamp = timestampFilter(dateTime);
  return time.getTime() > timestamp;
};

const onFormConfirm = async () => {
  await formRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      Message.close();
      formModel.loading = true;
      const formData = JSON.parse(JSON.stringify(formModel.data));
      formData.sample_weight = Number(formData.sample_weight);
      delete formData.status;
      delete formData.handlers;
      delete formData.handle_time;
      const { success, message } = await apiFoodRetentionUpdate(formData);
      if (success) {
        SampleRetentionAuxStore.$patch(state => {
          state.refresh = new Date().getTime();
        });
        formModel.visible = false;
        Message.success(`食品留样 ${formModel.OperationTypeName}成功`);
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

const onFormClosed = () => {
  formModel.data = formInitial();
  formRef.value?.resetFields();
  SampleRetentionAuxStore.$patch(state => {
    state.data = {};
    state.OperationType = OperationTypeEnum.default;
  });
};

watch(
  () => SampleRetentionAuxStore.OperationType,
  type => {
    const array = [OperationTypeEnum.add, OperationTypeEnum.update];
    if (array.includes(type as OperationTypeEnum)) {
      formModel.visible = true;
      formModel.OperationTypeName = OperationTypeName[type as OperationTypeEnum];

      if (type === OperationTypeEnum.update) {
        const data = JSON.parse(JSON.stringify(SampleRetentionAuxStore.data));
        if (data.sample_weight) {
          data.sample_weight = Number(data.sample_weight);
        }
        formModel.data = data;
      }
    }
  }
);
</script>

<style lang="scss" scoped></style>
