<template>
  <ElDialog
    width="1000px"
    :title="`检疫检测${formModel.OperationTypeName}`"
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
            <ElFormItem label="检测人" prop="detector">
              <ElInput
                v-model.trim="formModel.data.detector"
                maxlength="10"
                show-word-limit
                clearable
                placeholder="请输入检测人"
              ></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="检测时间" prop="detection_time">
              <ElDatePicker
                type="datetime"
                v-model="formModel.data.detection_time"
                :value-format="dateTimeModel.valueFormat"
                :default-time="dateTimeModel.defaultTime"
                :disabled-date="onDateTimeDisabled"
                placeholder="请选择检测时间"
              >
              </ElDatePicker>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="检测物品" prop="tested">
              <ElInput
                v-model="formModel.data.tested"
                maxlength="30"
                show-word-limit
                clearable
                placeholder="请输入检测物品"
              ></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="检测项目" prop="item">
              <ElSelect v-model="formModel.data.item" filterable clearable placeholder="请选择检测项目">
                <ElOption
                  v-for="item of QuarantineTypeList"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
                ></ElOption>
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="检测值" prop="detection_value">
              <ElInputNumber
                v-model="formModel.data.detection_value"
                :min="0"
                :max="99999999"
                :precision="2"
                controls-position="right"
                placeholder="请输入检测值"
              ></ElInputNumber>
            </ElFormItem>
          </ElCol>
          <ElCol>
            <ElFormItem label="检测结果" prop="detection_result">
              <ElInput
                v-model="formModel.data.detection_result"
                type="textarea"
                :rows="5"
                resize="none"
                maxlength="200"
                show-word-limit
                placeholder="检测结果"
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
import { ref, reactive, watch } from "vue";
import { QuarantineTypeList } from "../aux_modules/const";
import { useQuarantineInspectionAuxStore } from "../aux_modules/store";
import { OperationTypeEnum, OperationTypeName, Message } from "@/global/const";
import { dateTimeFilter, timestampFilter } from '@/utils/Dayjs/index';
import { apiQuarantineTestingUpdate } from "@/api/inspection";

const QuarantineInspectionAuxStore = useQuarantineInspectionAuxStore();
const formRef = ref();

/** 输入数据 函数方式 */
const formInitial = () => ({
  detector: "",
  detection_time: "",
  tested: "",
  item: "",
  detection_value: undefined,
  detection_result: "",
  image: "",
});
/** 交互反馈数据 */
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

const formRules = {
  detector: [{ required: true, message: "请输入检测人", trigger: ["change", "blur"] }],
  detection_time: [{ required: true, message: "请选择检测时间", trigger: ["change", "blur"] }],
  tested: [{ required: true, message: "请输入检测物品", trigger: ["change", "blur"] }],
  item: [{ required: true, message: "请选择检测项目", trigger: ["change", "blur"] }],
  detection_value: [{ required: true, message: "请输入检测值", trigger: ["change", "blur"] }],
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
      const formData = JSON.parse(JSON.stringify(formModel.data));
      formData.detection_value = formData.detection_value.toString();
      const { success, message } = await apiQuarantineTestingUpdate(formData);
      if (success) {
        /** 操作成功刷新页面数据 */
        QuarantineInspectionAuxStore.$patch(state => {
          state.refresh = new Date().getTime();
        });
        formModel.visible = false;
        Message.success(`检疫检测 ${formModel.OperationTypeName}成功`);
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
  QuarantineInspectionAuxStore.$patch(state => {
    state.data = {};
    state.OperationType = OperationTypeEnum.default;
  });
};

/** 监听操作类型 */
watch(
  () => QuarantineInspectionAuxStore.OperationType,
  type => {
    const array = [OperationTypeEnum.add, OperationTypeEnum.update];
    if (array.includes(type as OperationTypeEnum)) {
      formModel.OperationTypeName = OperationTypeName[type as OperationTypeEnum];
      /** 回显数据 */
      if (type === OperationTypeEnum.update) {
        const data = JSON.parse(JSON.stringify(QuarantineInspectionAuxStore.data));
        if (data.detection_value) {
          data.detection_value = Number(data.detection_value);
        }
        formModel.data = data;
      }
      formModel.visible = true;
    }
  }
);
</script>

<style lang="scss" scoped></style>
